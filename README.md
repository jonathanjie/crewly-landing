# Crewly

Customer-facing AI-agent-as-a-service platform targeting Singapore SMEs via the IMDA GenAIxDL grant. Static landing page + authenticated portal for deploying, managing, and measuring ROI of AI agents.

**Domain:** [crewly.chat](https://crewly.chat)

## Stack

- **Framework:** Next.js 16 (App Router, React 19)
- **Styling:** Tailwind CSS v4
- **Auth:** Supabase (email/password)
- **Animation:** Framer Motion 12
- **Backend:** [Fleet Control API](https://fleet.marinachain.io) (separate repo)
- **Testing:** Vitest + React Testing Library
- **Deployment:** VPS + Caddy reverse proxy + PM2

## Architecture

```
crewly.chat (Next.js 16)
├── /                           Landing page (static)
├── /login                      Supabase auth (sign in + sign up)
├── /grant-info                 GenAIxDL funding explainer (server-rendered)
└── /portal/*                   Authenticated portal (client-side SPA)
    ├── /portal                 Dashboard overview
    ├── /portal/agents          Deployed agents grid
    ├── /portal/agents/[id]     Agent detail (health, skills, channels)
    ├── /portal/agents/[id]/chat  Agent chat UI (preview/live mode)
    ├── /portal/deploy          3-step deploy wizard
    ├── /portal/deploy/[slug]   Template detail page
    ├── /portal/use-cases       GenAIxDL 5-category use case mapping
    ├── /portal/grant           Grant eligibility checker + funding calculator
    ├── /portal/roi             ROI dashboard with PDF export
    ├── /portal/org             Organization management + member invite
    └── /portal/settings        Account settings + password change

/api/fleet/[...path]            CORS proxy to Fleet Control API
```

The portal calls Fleet Control API at `fleet.marinachain.io` via a server-side CORS proxy (`/api/fleet/`). Auth tokens come from Supabase, which is shared with Fleet Control's portal auth. The frontend is fully decoupled from the backend — no shared filesystem, process, or DB connection.

## Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
# Fill in Supabase URL + anon key, Fleet API base URL

# Development
npm run dev          # Start dev server on port 3000

# Production build
npm run build
npm start
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase public/anon key |
| `NEXT_PUBLIC_FLEET_API_BASE` | Yes | Fleet Control API base URL |
| `FLEET_API_INTERNAL` | No | Server-side API override (e.g., `http://localhost:8100` for local dev) |

The app gracefully degrades when Supabase env vars are empty — the client returns `null` and the auth provider skips initialization.

## Scripts

```bash
npm run dev          # Next.js dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run test         # Vitest (run once)
npm run test:watch   # Vitest (watch mode)
```

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| `teal` | `#2DD4BF` | Primary accent, online status |
| `teal-deep` | `#0D9488` | CTAs, active nav, success |
| `coral` | `#F97066` | Warning, failed status |
| `coral-deep` | `#E54D42` | Error text, destructive |
| `cream` | `#FAFAF8` | Page background |
| `ink` | `#2D2D3A` | Primary text |
| `ink-light` | `#6B6B7B` | Secondary text |
| `ink-faint` | `#A0A0B0` | Tertiary text, placeholders |

**Fonts:** Bricolage Grotesque (display/headings via `--font-display`) + Plus Jakarta Sans (body via `--font-body`).

**Card pattern:** `bg-white rounded-2xl border border-ink/5 p-6`

## Deployment

Production deployment uses Caddy as reverse proxy (config at `docs/caddy/crewly.caddyfile`) with PM2 for process management.

```bash
# Deploy script (pulls, builds, restarts)
scripts/deploy.sh
```

Caddy serves the Next.js app with security headers (HSTS, CSP, X-Frame-Options, etc.) and SPA fallback for `/portal/*` routes.

## GenAIxDL Grant Context

Crewly is an approved vendor for IMDA's GenAI x Digital Leaders (GenAIxDL) Quick Win programme. The platform covers all 5 use case categories:

1. **Knowledge Management** — Knowledge search, document sync, FAQ bots
2. **Customer Engagement** — Support chatbots, lead qualification, multichannel comms
3. **Operations Automation** — Scheduling, logistics, workflow routing
4. **Content Generation** — Report writing, marketing content, translations
5. **Compliance & Analytics** — Regulatory monitoring, dashboards, audit trails

DMEs (demand-side companies) receive 50% co-funding (SME) or 30% (non-SME), up to $20K per project.

## Related

- **Fleet Control** — Backend API powering agent deployment, health monitoring, and billing
- **Design doc** — `docs/plans/2026-03-02-crewly-portal-genaixdl-design.md`
