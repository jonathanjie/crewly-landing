# Changelog

All notable changes to Crewly are documented in this file.

## [Unreleased]

### Added
- Test infrastructure: Vitest + React Testing Library with 28 baseline tests
- `ARCHITECTURE.md` documenting system design, data flow, and directory structure
- Project-specific `README.md` replacing stock Next.js template

### Fixed
- 5 ESLint errors: `<a>` → `<Link>` for internal nav (login, org), setState-in-effect patterns refactored to derived state (portal layout, ChatDemo, auth-context)
- 2 ESLint warnings: removed unnecessary `eslint-disable` directives (deploy wizard, ROI dashboard)

---

## [0.4.0] — 2026-03-02 (Sprint 4)

### Added
- User settings page (`/portal/settings`) — email display, password change via Supabase, sign out, account deletion contact
- Organization page (`/portal/org`) — org details with plan tier badge, member list with role badges, member invite form, plan upgrade CTA
- Custom 404 page with Crewly branding and navigation CTAs
- Portal loading skeleton with branded three-dot bounce animation
- Caddy config (`docs/caddy/crewly.caddyfile`) with security headers (HSTS, CSP, COOP, X-Frame-Options)
- Production deploy script (`scripts/deploy.sh`) — git pull, npm ci, build, pm2 restart
- Portal nav: Org and Settings links
- API client: `getOrgMembers`, `inviteOrgMember` methods, `OrgMember` type, `planLabels`/`planColors` helpers

## [0.3.0] — 2026-03-02 (Sprint 3)

### Added
- Agent chat UI (`/portal/agents/[id]/chat`) — message bubbles, typing indicator, preview/live mode, 4000 char input limit
- Template detail page (`/portal/deploy/[slug]`) — skills, integration blocks, config schema preview, deploy CTA
- GenAIxDL use case mapping (`/portal/use-cases`) — 5 IMDA categories with template links and funding callout
- Portal error boundary with branded error page, retry, and dashboard link
- IMDA GenAIxDL Funded badge on landing hero with animation
- Deploy wizard `?template=slug` auto-selection
- `sendChat` API method

### Fixed
- Chat message IDs use monotonic counter (prevents React key collisions)
- `categoryLabels` extracted to `lib/types.ts` (DRY)
- Deploy wizard effect depends on extracted string, not searchParams object
- Agent detail `handleAction` clears error state and catches refresh failures

## [0.2.0] — 2026-03-02 (Sprint 2)

### Added
- CORS proxy route (`/api/fleet/[...path]`) — server-side forwarding eliminates cross-origin issues
- Grant eligibility checker (`/portal/grant`) — client-side SSIC/SME validation, funding calculator
- ROI dashboard (`/portal/roi`) — per-agent metrics, before/after comparison, PDF export via `window.print()`
- Public grant info page (`/grant-info`) — GenAIxDL explainer with eligibility criteria and 5 use case categories
- Mobile responsive portal nav — hamburger menu at <=640px, closes on route change

### Fixed
- Currency formatting: 2 decimal places for SGD amounts in ROI dashboard
- Proxy hardening, grant validation, ROI calculation stability

## [0.1.0] — 2026-03-02 (Sprint 1)

### Added
- Supabase email/password authentication (`/login`) with Crewly branding
- `AuthProvider` + `useAuth` hook wrapping entire app
- Fleet Control API client (`lib/api.ts`) with typed methods and JWT auth
- Portal layout with sticky nav, auth gate, desktop + mobile navigation
- Dashboard (`/portal`) — agent count stats, recent agents list, empty state CTA
- My Agents grid (`/portal/agents`) with health status dots
- Agent detail page (`/portal/agents/[id]`) — overview, skills, channels tabs
- Deploy wizard (`/portal/deploy`) — 3-step flow (template → configure → deploy)
- TypeScript types for Org, AppTemplate, AppInstance, InstanceHealth
- Static landing page with hero, use cases, pricing, testimonials, chat demo
