# Crewly Portal + GenAIxDL Vendor Platform — Design

**Date:** 2026-03-02
**Status:** Approved
**Domain:** crewly.chat

---

## Strategic Context

Crewly is the customer-facing AI-agent-as-a-service brand targeting Singapore SMEs/DMEs via the IMDA GenAIxDL Quick Win grant. It operates as a single organization within Fleet Control's multi-tenant backend. MarinaAI serves maritime clients under a separate org; Crewly serves the horizontal multi-industry market.

**GenAIxDL Quick Win requirements:**
- Vendor covers 3+ of 5 use cases (KM, CE, CA, OA, CG) — we target all 5
- Max $20K per DME project, 3-month timeline
- DMEs get 50% funded (SME) or 30% (non-SME)
- Vendor gets 6 months to onboard up to 5 DME customers
- Claims require: proof of deployment, ROI datapoints, invoices

---

## Architecture

Extend `crewly-landing` from a static landing page into a full Next.js 16 app with client-side portal routes. Portal calls Fleet Control API at `fleet.marinachain.io`. Auth via same Supabase instance. Deployed on VPS with Caddy. Future: dockerize both for elastic infra (design is already HTTP-decoupled).

```
crewly.chat (Next.js 16, Caddy on VPS)
├── /                    (landing page — static export, existing)
├── /grant-info          (public — GenAIxDL funding info)
├── /login               (Supabase auth, Crewly branded)
└── /portal/*            (client-side SPA, auth required)
    ├── /portal          (dashboard overview)
    ├── /portal/agents   (deployed agents grid)
    ├── /portal/agents/[id]  (agent detail: skills, connections, health)
    ├── /portal/deploy   (3-step wizard: category → template → deploy)
    ├── /portal/grant    (eligibility checker + application tracker)
    └── /portal/roi      (ROI dashboard for IMDA claims)

Backend: fleet.marinachain.io/api/v1/* (existing Fleet Control API)
Auth: Supabase (shared project, same JWT)
Org: "Crewly" row in Fleet Control organizations table
```

**Rendering model:** Landing page remains static export. Portal routes use `"use client"` with React client-side rendering — no SSR needed. Caddy serves build output with SPA fallback for `/portal/*`.

**Design system:** Crewly's existing teal/coral palette (not Fleet Control's Deep Ocean). Fonts: Bricolage Grotesque (display) + Plus Jakarta Sans (body). Tailwind v4.

---

## Portal Pages

### Login (`/login`)
- Email + password via `supabase.auth.signInWithPassword()`
- New users: `supabase.auth.signUp()` + auto-join Crewly org
- Crewly branding: teal gradient, crew avatar illustrations
- On success → redirect to `/portal`

### Dashboard (`/portal`)
- Active agent count, total agent hours this month
- Quick-deploy CTA if 0 agents ("Deploy your first AI crew member")
- Grant status card (if DME has applied via /portal/grant)
- Recent activity feed (deploys, restarts, alerts)

### My Agents (`/portal/agents`)
- Grid of agent cards: name, status dot (healthy/unhealthy/stopped), uptime, channel icons
- Click → `/portal/agents/[id]`

### Agent Detail (`/portal/agents/[id]`)
- Tabs: Overview (health charts), Skills, Connections, Files, Channels
- Health: CPU/Memory/Uptime line charts (from Fleet Control metrics endpoint)
- Skills: list of installed skills with descriptions
- Connections: Google/Notion/Slack status with "Connect" buttons

### Deploy Wizard (`/portal/deploy`)
1. **Pick category:** KM / CE / OA / CG / CA → filtered template list
2. **Configure:** Render template's JSON schema as form fields
3. **Name + deploy:** Instance name, confirm, calls `POST /api/v1/deployments`

### Grant Eligibility (`/portal/grant`)
- ACRA number input
- SSIC code check (Non-ICT validation: not 61/62/63xxx)
- Company size: employees + annual turnover
- Use case selector (which GenAIxDL categories)
- Output: eligibility verdict + next steps + CTOaaS declaration link
- Application tracker: draft → submitted → approved → deployed → claimed

### ROI Dashboard (`/portal/roi`)
- Per-agent: queries handled, avg response time, uptime %, estimated hours saved
- Before/after comparison (manual baseline vs AI-assisted)
- Aggregate project ROI across all agents
- Export as PDF (for IMDA claim documentation)

---

## GenAIxDL Use Case Coverage (5/5)

| Category | Archetype | Key Skills | Status |
|----------|-----------|------------|--------|
| **KM** | Knowledge Brain | knowledge-search, document-sync, search-strategy | Exists |
| **CE** | Support L1 Deflector | escalation-routing, response-quality, stakeholder-comms | Exists |
| **OA** | Finance Ops / Maritime Ops | task-management, regulatory-search, fleet-control | Exists |
| **CG** | Content Creator | content generation, brand tone, template writing | Needs creation |
| **CA** | Analytics Assistant | data queries, chart generation, anomaly detection | Needs creation |

---

## New Fleet Control API Endpoints

### 1. Auto-join org on signup
```
POST /api/v1/orgs/{org_slug}/auto-join
Auth: Portal JWT
Body: {} (user ID from JWT)
→ Creates OrganizationMember(user_id, org_id, role=member)
```

### 2. ROI metrics
```
GET /api/v1/deployments/{id}/roi?hours=720
Auth: Portal JWT
→ { queries_handled, avg_response_ms, uptime_pct, estimated_hours_saved, cost_avoided }
```
Derived from existing heartbeat + metrics data.

### 3. Grant applications CRUD
```
POST /api/v1/grant-applications
Body: { company_name, acra_number, ssic_code, use_cases[], employee_count, annual_turnover }
→ Creates GrantApplication(status=draft)

GET /api/v1/grant-applications
→ List applications for caller's org

PATCH /api/v1/grant-applications/{id}
Body: { status, notes }
→ Update status (draft/submitted/approved/deployed/claimed)
```

---

## Price Schedule (GenAIxDL Quick Win)

| Type | Item | Cost | Remarks |
|------|------|------|---------|
| ICT Services | Crewly Pro subscription | $3,000 | 3 months of platform access |
| Professional Services | Custom AI Solution | $17,000 | Deployment, architecture, knowledge base, integration, UAT, governance advisory |
| **Total** | | **$20,000** | Max per DME project |

---

## Implementation Sprints

| Sprint | Focus | Deliverable |
|--------|-------|-------------|
| **S1** | Portal foundation | Login, AuthContext, API client, PortalLayout, Dashboard, My Agents |
| **S2** | Deploy + detail | Deploy Wizard, Agent Detail (all tabs), template catalog integration |
| **S3** | GenAIxDL features | Grant eligibility, application tracker, ROI dashboard, PDF export |
| **S4** | Use case templates | Content Creator + Analytics Assistant archetypes + skill content |
| **S5** | Polish + dogfood | Mobile responsive, error states, loading, e2e test with real credentials |

---

## Future: Containerization

Current deployment: VPS + Caddy. The architecture is HTTP-decoupled:
- Crewly frontend → Fleet Control API via HTTPS
- No filesystem coupling, no shared process, no shared DB connection

To containerize later:
- Crewly: `docker build` the Next.js app, serve via nginx/caddy container
- Fleet Control: already has Docker infrastructure
- Both behind a reverse proxy / load balancer
- Environment variables for API URL, Supabase URL (already parameterized)

No architectural changes needed — just deployment config.
