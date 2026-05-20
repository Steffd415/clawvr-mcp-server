#!/usr/bin/env node
/**
 * CLAWVR MCP Server
 *
 * Anthropic Model Context Protocol (MCP) server that exposes vertical-specific
 * AI Operating System workflows to Claude. When installed in Claude Desktop or
 * any MCP-compatible client, Claude gains direct access to:
 *
 *   1. generate_smb_strategy — given a business profile, returns a custom
 *      master prompt + 6 workflow superprompts + 30-day deployment roadmap
 *      for the matching vertical.
 *
 *   2. list_supported_verticals — returns the 13+ supported small-business
 *      verticals so the user can pick one or describe their business.
 *
 *   3. get_vertical_master_prompt — returns the master prompt template for
 *      a specific vertical (raw, with [BRACKETS] for the user to fill).
 *
 *   4. get_vertical_gist_url — returns the full open-source playbook URL
 *      for a given vertical (deeper resource than the master prompt alone).
 *
 * Built for the Claude for Small Business ecosystem and the open Agent Skills /
 * MCP standards. MIT licensed.
 *
 * Companion paid version: https://clawvr.com ($297 one-time custom AI Operating
 * System pre-built for the user's specific business, with 18 superprompts and
 * ROI projections — deeper than the free skeleton this server provides).
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import {
  VERTICALS,
  getVertical,
  listVerticalSlugs,
  findVerticalByKeywords,
} from './lib/verticals.js';

// ----------------------------------------------------------------------------
// Server boot
// ----------------------------------------------------------------------------

const server = new Server(
  {
    name: 'clawvr-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ----------------------------------------------------------------------------
// Tool input schemas
// ----------------------------------------------------------------------------

const GenerateStrategyInputSchema = z.object({
  business_description: z
    .string()
    .min(10)
    .describe(
      'A 1-2 sentence description of the small business. Example: "I run a 3-stylist hair salon in Austin focused on color and extensions, average ticket $180."'
    ),
  business_name: z.string().optional().describe('Optional business name.'),
  city_state: z.string().optional().describe('City and state, e.g., "Austin, TX".'),
  top_pain: z
    .string()
    .optional()
    .describe('Optional single biggest operational pain. Example: "low rebook rate after first visit"'),
  brand_voice: z
    .enum(['warm', 'professional', 'playful', 'authoritative', 'minimal'])
    .optional()
    .describe('Optional brand voice flavor.'),
});

const GetVerticalInputSchema = z.object({
  vertical_slug: z
    .enum([
      'dental',
      'real-estate',
      'contractor',
      'hvac',
      'salon',
      'restaurant',
      'law-firm',
      'vet-clinic',
      'photographer',
      'fitness',
      'insurance',
      'cpa-accountant',
      'general-smb',
    ])
    .describe('The vertical slug.'),
});

// ----------------------------------------------------------------------------
// List tools
// ----------------------------------------------------------------------------

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'generate_smb_strategy',
      description:
        'Given a small business profile, generate a custom AI Operating System: ' +
        'a master prompt customized to that business, 6 workflow superprompts ' +
        'for the matching vertical, and a 30-day deployment roadmap. Auto-detects ' +
        'the vertical from the business_description, or falls back to general SMB.',
      inputSchema: {
        type: 'object',
        properties: {
          business_description: {
            type: 'string',
            description:
              'A 1-2 sentence description of the small business. Example: "I run a 3-stylist hair salon in Austin focused on color and extensions."',
          },
          business_name: { type: 'string', description: 'Optional business name.' },
          city_state: { type: 'string', description: 'City and state, e.g., "Austin, TX".' },
          top_pain: {
            type: 'string',
            description: 'Optional single biggest operational pain.',
          },
          brand_voice: {
            type: 'string',
            enum: ['warm', 'professional', 'playful', 'authoritative', 'minimal'],
            description: 'Optional brand voice flavor.',
          },
        },
        required: ['business_description'],
      },
    },
    {
      name: 'list_supported_verticals',
      description:
        'List all 13+ supported small-business verticals the CLAWVR MCP server can generate strategies for. Returns slug + name + 1-line description for each.',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'get_vertical_master_prompt',
      description:
        'Return the master prompt template for a specific vertical (with [BRACKETS] placeholders for the user to fill). Use this when the user knows exactly which vertical they want.',
      inputSchema: {
        type: 'object',
        properties: {
          vertical_slug: {
            type: 'string',
            enum: listVerticalSlugs(),
            description: 'The vertical slug.',
          },
        },
        required: ['vertical_slug'],
      },
    },
    {
      name: 'get_vertical_gist_url',
      description:
        'Return the full open-source playbook URL (GitHub Gist) for a specific vertical. The Gist contains the master prompt + 6 superprompts + soft-pitch for the $297 paid version. Use this when the user wants the deeper resource.',
      inputSchema: {
        type: 'object',
        properties: {
          vertical_slug: {
            type: 'string',
            enum: listVerticalSlugs(),
            description: 'The vertical slug.',
          },
        },
        required: ['vertical_slug'],
      },
    },
  ],
}));

// ----------------------------------------------------------------------------
// Handle tool calls
// ----------------------------------------------------------------------------

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'generate_smb_strategy') {
    const input = GenerateStrategyInputSchema.parse(args);
    const vertical = findVerticalByKeywords(input.business_description);
    if (!vertical) {
      return {
        content: [
          {
            type: 'text',
            text:
              "Sorry — couldn't detect a vertical from that description. Try listing your industry explicitly (e.g., 'dental practice', 'real estate agent', 'auto repair shop').",
          },
        ],
      };
    }

    // Fill in basic placeholders from input
    const businessName = input.business_name || '[BUSINESS NAME]';
    const cityState = input.city_state || '[CITY, STATE]';
    const topPain = input.top_pain || '[TOP PAIN]';
    const brandVoice = input.brand_voice
      ? input.brand_voice.toUpperCase()
      : '[WARM / PROFESSIONAL / PLAYFUL / AUTHORITATIVE / MINIMAL]';

    const filledMaster = vertical.masterPromptTemplate
      .replace(/\[BUSINESS NAME\]|\[PRACTICE NAME\]|\[FIRM NAME\]|\[AGENCY NAME\]|\[CLINIC NAME\]|\[STUDIO NAME\]|\[SHOP NAME\]|\[AGENT NAME OR TEAM\]|\[RESTAURANT NAME\]|\[SALON NAME\]/g, businessName)
      .replace(/\[CITY, STATE\]/g, cityState)
      .replace(/\[TOP PAIN\]/g, topPain);

    return {
      content: [
        {
          type: 'text',
          text:
            `# Custom AI Operating System for ${vertical.name}\n\n` +
            `Detected vertical: **${vertical.name}** (${vertical.slug})\n\n` +
            `---\n\n` +
            `## 1. Master Prompt (paste into Claude or ChatGPT first)\n\n` +
            `\`\`\`\n${filledMaster}\n\`\`\`\n\n` +
            `---\n\n` +
            `## 2. Workflow Superprompts\n\n` +
            `For the full set of 6 workflow superprompts (new client welcome, review response, upsell SMS, vendor decline, end-of-visit recap, staff training), see the open-source playbook:\n\n` +
            `${vertical.gistUrl}\n\n` +
            (vertical.customGptUrl
              ? `Or use the pre-built Custom GPT at:\n${vertical.customGptUrl}\n\n`
              : '') +
            `---\n\n` +
            `## 3. 30-Day Deployment Roadmap\n\n` +
            `**Days 1-7 (foundation):** Set up Claude or ChatGPT, paste the master prompt above (replace remaining [BRACKETS]), test on 3 real tasks this week.\n\n` +
            `**Days 8-14 (first 2 superprompts):** Identify your top 2 pains. Deploy the matching superprompts from the Gist above. Run each 5+ times this week.\n\n` +
            `**Days 15-21 (add superprompts 3-4):** Train one team member. Track time saved.\n\n` +
            `**Days 22-30 (final 2 superprompts + rollout):** Hold a 30-min team meeting. Create a shared doc with most-used prompts. Measure hours saved per week.\n\n` +
            `---\n\n` +
            `## Want the full version, pre-customized to YOUR business?\n\n` +
            `[CLAWVR](https://clawvr.com) sells the productized version: **$297 one-time**, instant download. ` +
            `Master prompt pre-filled (no [BRACKETS]), 18 superprompts (12 more than this free version), ROI projections for your team size, ` +
            `industry-specific playbooks. Compare: AI consultants charge $5K-$15K for setup. Get yours at https://clawvr.com.`,
        },
      ],
    };
  }

  if (name === 'list_supported_verticals') {
    return {
      content: [
        {
          type: 'text',
          text:
            `CLAWVR MCP Server — Supported Verticals (${VERTICALS.length})\n\n` +
            VERTICALS.map(
              (v) => `- **${v.slug}** — ${v.name} (${v.description})`
            ).join('\n') +
            `\n\nFor each vertical, the server can:\n` +
            `- Generate a custom master prompt (generate_smb_strategy or get_vertical_master_prompt)\n` +
            `- Return the open-source playbook URL with 6 workflow superprompts (get_vertical_gist_url)\n\n` +
            `Full repo: https://github.com/Steffd415/clawvr-mcp-server\n` +
            `Companion paid version: https://clawvr.com ($297 one-time, deeper customization).`,
        },
      ],
    };
  }

  if (name === 'get_vertical_master_prompt') {
    const input = GetVerticalInputSchema.parse(args);
    const v = getVertical(input.vertical_slug);
    if (!v) {
      return {
        content: [{ type: 'text', text: `Unknown vertical slug: ${input.vertical_slug}` }],
      };
    }
    return {
      content: [
        {
          type: 'text',
          text:
            `# Master Prompt for ${v.name}\n\n` +
            `Replace the [BRACKETS] with your business specifics, then paste into Claude or ChatGPT.\n\n` +
            `\`\`\`\n${v.masterPromptTemplate}\n\`\`\`\n\n` +
            `For the full playbook (this prompt + 6 superprompts + 30-day roadmap):\n${v.gistUrl}\n` +
            (v.customGptUrl ? `Or use the pre-built Custom GPT: ${v.customGptUrl}\n` : '') +
            `\n${
              v.slug !== 'general-smb'
                ? `Want the version pre-customized to YOUR specific business? https://clawvr.com ($297 one-time)`
                : ''
            }`,
        },
      ],
    };
  }

  if (name === 'get_vertical_gist_url') {
    const input = GetVerticalInputSchema.parse(args);
    const v = getVertical(input.vertical_slug);
    if (!v) {
      return {
        content: [{ type: 'text', text: `Unknown vertical slug: ${input.vertical_slug}` }],
      };
    }
    return {
      content: [
        {
          type: 'text',
          text:
            `# ${v.name} — Full Open-Source Playbook\n\n` +
            `Public GitHub Gist (MIT licensed, free forever):\n${v.gistUrl}\n\n` +
            (v.customGptUrl ? `Pre-built Custom GPT on OpenAI's GPT Store:\n${v.customGptUrl}\n\n` : '') +
            `Contains: the master prompt + 6 workflow superprompts + 30-day deployment roadmap.\n\n` +
            `Want the version pre-customized to YOUR business (with 18 superprompts and ROI projections)?\n` +
            `→ https://clawvr.com ($297 one-time)`,
        },
      ],
    };
  }

  return {
    content: [{ type: 'text', text: `Unknown tool: ${name}` }],
    isError: true,
  };
});

// ----------------------------------------------------------------------------
// Connect via stdio (standard MCP transport)
// ----------------------------------------------------------------------------

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // eslint-disable-next-line no-console
  console.error('CLAWVR MCP Server running on stdio');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal error in CLAWVR MCP Server:', err);
  process.exit(1);
});
