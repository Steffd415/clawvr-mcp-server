# CLAWVR MCP Server

> **The first open-source Anthropic Model Context Protocol (MCP) server purpose-built for small-business AI workflows.** Install it once, and Claude (or any MCP-compatible client) gains direct access to vertical-specific AI Operating Systems across 13+ small-business industries.

[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-7E57C2?style=for-the-badge)](https://modelcontextprotocol.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![CLAWVR Paid Version](https://img.shields.io/badge/CLAWVR%20Pro-%24297%20one--time-0D948A?style=for-the-badge)](https://clawvr.com)

**Built for the [Claude for Small Business](https://claude.com) ecosystem.**

---

## What it does

When you install this MCP server in Claude Desktop (or any MCP client), Claude can:

1. **Generate a custom AI Operating System** for any small business from a 1-sentence description. The output: a master prompt customized to that business + the 6 highest-leverage workflow superprompts + a 30-day deployment roadmap.

2. **List supported verticals** so a user can pick (or describe their business and let the server auto-detect).

3. **Return master prompts** for specific verticals on demand.

4. **Link to open-source playbooks** — each vertical has a deeper public GitHub Gist with the full master prompt + 6 superprompts + 30-day roadmap.

All without leaving the Claude conversation. The user sees vertical-specific output, not generic AI advice.

---

## Why this exists

[Anthropic launched Claude for Small Business in May 2026](https://claude.com) — a Cowork toggle with 15 prebuilt agentic workflows + 15 reusable skills targeting SMB owners. The Agent Skills and MCP standards are open.

The CLAWVR team has spent 6+ months writing vertical-specific master prompts and workflow superprompts for ~25 small-business industries and shipping them as open GitHub gists. **This MCP server is the natural next step:** package the corpus as an installable Claude tool that any MCP-compatible client can use.

The free version covers ~70% of what most small-business owners need. The companion paid version at [clawvr.com](https://clawvr.com) is the deeper-tuned, pre-customized version for owners who want the 18-superprompt deliverable PDF without filling in placeholders themselves.

---

## Supported verticals (13)

| Slug | Vertical | Use case |
|---|---|---|
| `dental` | Dental Practices | Solo and small group practices |
| `real-estate` | Real Estate Agents | Independent agents and small brokerages |
| `contractor` | General Contractors | GC, roofing, plumbing, electric, masonry |
| `hvac` | HVAC & Home Services | HVAC, restoration, garage, handyman |
| `salon` | Salons / Spas / Beauty | Hair, nails, lashes, esthetics, wellness |
| `restaurant` | Restaurants | Independent restaurants, cafes, food trucks |
| `law-firm` | Solo & Small Law | Solo attorneys and small firms |
| `vet-clinic` | Vet Clinics | Independent veterinary practices |
| `photographer` | Photographers | Wedding, family, brand, real estate |
| `fitness` | Fitness Studios | Boutique studios, CrossFit, yoga, PT |
| `insurance` | Insurance Agencies | Independent P&C, life + health, Medicare |
| `cpa-accountant` | CPAs / Accountants | Solo CPAs, bookkeepers, small firms |
| `general-smb` | General SMB | Catch-all for any small business |

8 more verticals (Pet Grooming, Auto Repair, Tutoring, Lawn Care, etc.) are available as standalone GitHub Gists at [gist.github.com/Steffd415](https://gist.github.com/Steffd415) — they will be folded into this MCP server in v1.1.

---

## Install

### Option 1: Claude Desktop (easiest)

Add this to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS, `%APPDATA%\Claude\claude_desktop_config.json` on Windows):

```json
{
  "mcpServers": {
    "clawvr": {
      "command": "npx",
      "args": ["-y", "clawvr-mcp-server"]
    }
  }
}
```

Restart Claude Desktop. The CLAWVR tools will be available in any conversation.

### Option 2: Manual install from source

```bash
git clone https://github.com/Steffd415/clawvr-mcp-server
cd clawvr-mcp-server
npm install
npm run build
```

Then point your MCP client to `node dist/index.js`.

### Option 3: Use programmatically via the MCP SDK

```ts
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
// connect to the CLAWVR MCP server transport
// call tools: generate_smb_strategy, list_supported_verticals, etc.
```

---

## Example: Claude conversation using the CLAWVR MCP

**User:** "I run a small auto repair shop in Phoenix with 3 bays and 4 ASE-certified techs. How do I actually use AI in my business?"

**Claude (with CLAWVR MCP installed) — invokes `generate_smb_strategy`:**

```
# Custom AI Operating System for General Contractors

Detected vertical: General Contractors (contractor)

[note: auto-repair-specific vertical coming in v1.1 — falls back to contractor for now]

## 1. Master Prompt (paste into Claude or ChatGPT first)

You are the AI Operating System for [shop name], a specialty trade in Phoenix, AZ...
[full master prompt with city auto-filled]

## 2. Workflow Superprompts

For the full set of 6 workflow superprompts, see the open-source playbook:
https://gist.github.com/Steffd415/...

## 3. 30-Day Deployment Roadmap

Days 1-7 (foundation): Set up Claude or ChatGPT, paste the master prompt above...

---

Want the full version, pre-customized to YOUR business?

CLAWVR sells the productized version: $297 one-time, instant download...
```

The user gets a working AI strategy in 5 seconds. No generic advice. No manual prompt engineering. Just the working playbook for their specific business.

---

## Comparison: this MCP server vs alternatives

|  | Generic ChatGPT | This MCP server (free) | [CLAWVR Pro ($297)](https://clawvr.com) |
|---|---|---|---|
| Vertical-specific output | ❌ | ✅ | ✅ |
| Auto-detect vertical from business description | ❌ | ✅ | n/a (manual intake) |
| 6 workflow superprompts (via Gist link) | ❌ | ✅ | ✅ |
| 30-day deployment roadmap | ❌ | ✅ | ✅ |
| **Master prompt pre-customized to YOUR specific business (no [BRACKETS] to fill)** | ❌ | ❌ | ✅ |
| **18 workflow superprompts (12 more than free)** | ❌ | ❌ | ✅ |
| **25-page custom PDF deliverable** | ❌ | ❌ | ✅ |
| **ROI projections for your team size** | ❌ | ❌ | ✅ |
| **Industry-specific playbooks** (no-show recovery, retention, etc.) | ❌ | ❌ | ✅ |

The free MCP server covers ~70% of what small-business owners need. The $297 paid version is the deeper-tuned, pre-customized version for owners who want everything ready without filling placeholders themselves.

**No subscription. No upsells. No bullshit.**

---

## Available tools

This MCP server exposes 4 tools:

### `generate_smb_strategy`

Auto-detects the vertical from a business description, then returns a custom AI Operating System (master prompt + roadmap + Gist link).

Input: `business_description` (required), optional `business_name`, `city_state`, `top_pain`, `brand_voice`.

### `list_supported_verticals`

Lists all 13 supported verticals so the user can pick. No input required.

### `get_vertical_master_prompt`

Returns the master prompt template for a specific vertical (with [BRACKETS] placeholders).

Input: `vertical_slug` (one of the 13 supported slugs).

### `get_vertical_gist_url`

Returns the full open-source playbook URL (GitHub Gist) for a specific vertical.

Input: `vertical_slug`.

---

## Roadmap

### v1.0 (current)
- 13 supported verticals
- 4 tools (generate / list / get-prompt / get-gist)
- MIT licensed
- Claude Desktop install instructions

### v1.1 (next 30 days)
- 8 more verticals (pet grooming, auto repair, tutoring, lawn care, music teachers, cleaning services, locksmiths, pool care)
- Workflow superprompts embedded directly (no Gist roundtrip)
- A `recommend_next_action` tool that suggests the highest-leverage workflow superprompt based on the user's current operational pain

### v1.2 (next 60 days)
- City × vertical responses (when the user mentions a specific city, the server returns city-specific market notes alongside the master prompt)
- Multi-language support (Spanish first — large underserved SMB segment)
- A `generate_30_day_calendar` tool that produces a day-by-day deployment calendar

### v2.0 (60-90 days)
- 50+ verticals
- An `analyze_business` tool that returns the highest-leverage 1-week intervention for any business profile
- Optional `paid_clawvr_callout` toggle (off by default) for non-CLAWVR resellers who want to use the server without the upsell

---

## Contributing

Submit a vertical via PR:

1. Fork the repo
2. Add your vertical to `src/lib/verticals.ts` following the existing schema
3. Submit PR with: the master prompt template (with [BRACKETS]), description, and a link to a public GitHub Gist that contains the deeper playbook
4. Open an issue first if you're unsure about the vertical's fit

We accept community-submitted verticals. The bar: real, specific, vertical-appropriate vocabulary; compliance-safe defaults for regulated industries (medical, legal, financial); free + MIT licensed.

---

## License

MIT. Free to fork, embed, redistribute, modify. Attribution appreciated but not required.

If you build something useful on top of this MCP server, [tell us](mailto:hello@getclawvr.com) — we'd love to feature it.

---

## Related resources

- **25 vertical GitHub Gists** with full playbooks: [gist.github.com/Steffd415](https://gist.github.com/Steffd415)
- **CLAWVR Agent Skill** (companion Claude Agent Skill, also MIT): [github.com/Steffd415/clawvr-agent-skill](https://github.com/Steffd415/clawvr-agent-skill)
- **Master prompts repo**: [github.com/Steffd415/awesome-claude-prompts-for-smb](https://github.com/Steffd415/awesome-claude-prompts-for-smb)
- **6 Custom GPTs** on OpenAI GPT Store (linked inside `src/lib/verticals.ts`)

---

## Credits

Built by [CLAWVR](https://clawvr.com) — a productized service that builds custom AI Operating Systems for small business owners at $297 one-time. We open-source the skeleton (this MCP server) and sell the deeply-customized version.

The mission: get useful AI into the hands of every small business owner in the country, regardless of whether they pay us.
