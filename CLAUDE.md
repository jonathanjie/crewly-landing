# Crewly Landing + Portal

Customer-facing AI-agent-as-a-service platform targeting Singapore SMEs via IMDA GenAIxDL grant. Next.js 16 app with static landing page and client-side portal that calls Fleet Control API.

**Domain:** crewly.chat
**Stack:** Next.js 16, React 19, Tailwind v4, Supabase Auth, Framer Motion
**Backend:** Fleet Control API at fleet.marinachain.io (separate repo)
**Design doc:** docs/plans/2026-03-02-crewly-portal-genaixdl-design.md

## Key Files

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout — fonts (Bricolage Grotesque + Plus Jakarta Sans), AuthProvider wrapper |
| `app/page.tsx` | Landing page (static) |
| `app/login/page.tsx` | Supabase email/password auth, Crewly branded |
| `app/grant-info/page.tsx` | Public GenAIxDL explainer — eligibility criteria, 5 use cases, CTA |
| `app/portal/layout.tsx` | Portal shell — auth gate, sticky nav, mobile hamburger menu |
| `app/portal/page.tsx` | Dashboard — agent count, quick-deploy CTA, activity feed |
| `app/portal/agents/page.tsx` | My Agents grid with health cards |
| `app/portal/agents/[id]/page.tsx` | Agent detail — overview, skills, channels tabs |
| `app/portal/agents/[id]/chat/page.tsx` | Agent chat UI — message bubbles, demo/preview mode |
| `app/portal/deploy/page.tsx` | 3-step deploy wizard (category, configure, deploy) |
| `app/portal/deploy/[slug]/page.tsx` | Template detail — skills, integrations, deploy CTA |
| `app/portal/use-cases/page.tsx` | GenAIxDL 5-category use case mapping with template links |
| `app/portal/error.tsx` | Portal error boundary — friendly error page with retry |
| `app/portal/loading.tsx` | Portal-wide loading skeleton — shimmer cards, branded dot animation |
| `app/portal/settings/page.tsx` | User settings — email display, password change, sign out, account deletion |
| `app/portal/org/page.tsx` | Organization management — details, plan badge, members, invite form |
| `app/portal/grant/page.tsx` | Grant eligibility checker — SSIC/SME validation, funding calculator |
| `app/portal/roi/page.tsx` | ROI dashboard — per-agent metrics, before/after comparison, PDF export |
| `app/not-found.tsx` | Custom 404 page — Crewly branded, dashboard + home CTAs |
| `app/api/fleet/[...path]/route.ts` | CORS proxy — forwards all methods to Fleet Control API server-side |
| `lib/supabase.ts` | Supabase client (null-safe when env vars missing) |
| `lib/auth-context.tsx` | AuthProvider + useAuth hook (session, loading, signOut) |
| `lib/api.ts` | Fleet Control API client — portalFetch with JWT, all endpoint wrappers |
| `lib/types.ts` | TypeScript types: Org, AppTemplate, AppInstance, InstanceHealth |
| `components/Navigation.tsx` | Landing page nav — scroll-aware, mobile hamburger, Grant link |
| `components/Hero.tsx` | Landing hero section |
| `components/HowItWorks.tsx` | Landing "How it works" section |
| `components/UseCases.tsx` | Landing use cases section |
| `components/Pricing.tsx` | Landing pricing section |
| `components/ChatDemo.tsx` | Landing chat demo component |
| `components/Channels.tsx` | Landing channels section |
| `components/Testimonials.tsx` | Landing testimonials |
| `components/CTA.tsx` | Landing CTA section |
| `components/Footer.tsx` | Landing footer |
| `docs/caddy/crewly.caddyfile` | Caddy reverse proxy config with security headers |
| `scripts/deploy.sh` | Production deploy script (git pull, build, pm2 restart) |
| `components/CrewAvatar.tsx` | Crew member avatar component |
| `app/globals.css` | Theme tokens, grain overlay, print CSS, blob animations |

## Routes

### Public
| Route | Rendering | Purpose |
|-------|-----------|---------|
| `/` | Static | Landing page |
| `/login` | Client | Supabase auth (sign in + sign up) |
| `/grant-info` | Server (with metadata) | GenAIxDL funding explainer |

### Portal (auth required)
| Route | Purpose |
|-------|---------|
| `/portal` | Dashboard overview |
| `/portal/agents` | Deployed agents grid |
| `/portal/agents/[id]` | Agent detail (health, skills, channels) |
| `/portal/agents/[id]/chat` | Agent chat UI (preview/live) |
| `/portal/deploy` | 3-step deploy wizard |
| `/portal/deploy/[slug]` | Template detail page |
| `/portal/use-cases` | GenAIxDL use case category mapping |
| `/portal/grant` | Grant eligibility checker + funding calculator |
| `/portal/roi` | ROI dashboard with PDF export |
| `/portal/org` | Organization details, members, invite |
| `/portal/settings` | Account settings, password change |

### API
| Route | Purpose |
|-------|---------|
| `/api/fleet/[...path]` | CORS proxy — forwards GET/POST/PUT/PATCH/DELETE to Fleet Control API |

## Conventions

### Design System
- **Colors:** teal (#2DD4BF), teal-deep (#0D9488), coral (#F97066), coral-deep (#E54D42), cream (#FAFAF8), ink (#2D2D3A)
- **Fonts:** Bricolage Grotesque (display/headings via `--font-display`), Plus Jakarta Sans (body via `--font-body`)
- **Font usage:** `font-[family-name:var(--font-display)]` for headings, body font is default
- **Cards:** `bg-white rounded-2xl border border-ink/5 p-6`
- **Inputs:** `rounded-xl border border-ink/10 bg-cream text-ink focus:ring-2 focus:ring-teal/40`
- **Status dots:** teal = online/active, coral = failed, amber = provisioning, ink-faint = stopped

### Navigation
- Landing page: `components/Navigation.tsx` — scroll-aware fixed nav, "Grant" link to `/grant-info`
- Portal: `app/portal/layout.tsx` — sticky nav with 8 links (Dashboard, My Agents, Deploy, Use Cases, Grant, ROI, Org, Settings)
- Mobile responsive: hamburger menu at `sm:` breakpoint (640px), closes on route change
- Landing mobile uses Framer Motion AnimatePresence; portal mobile uses CSS max-height transition

### API Client Pattern
- All Fleet Control calls go through `/api/fleet/[...path]` proxy (avoids CORS)
- `lib/api.ts` `portalFetch()` adds JWT from Supabase session automatically
- Proxy reads `FLEET_API_INTERNAL` > `NEXT_PUBLIC_FLEET_API_BASE` > hardcoded fallback

### Print / PDF Export
- ROI dashboard uses `window.print()` for PDF export
- `globals.css` has `@media print` block: white background, static nav, hidden grain overlay
- Tailwind classes: `print:hidden` (hide elements), `print:break-before-page`, `print:mb-4`

### Auth Flow
- `lib/auth-context.tsx` wraps entire app in `AuthProvider`
- Portal layout redirects to `/login` if no session
- Supabase client is null-safe (returns null when env vars are empty)

## Environment Variables

See `.env.example` for required variables. Key ones:
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/public key
- `NEXT_PUBLIC_FLEET_API_BASE` — Fleet Control API base URL (used client-side for display)
- `FLEET_API_INTERNAL` — Optional server-side override for proxy (e.g., localhost in dev)

## Development

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Vitest (single run, 28 tests)
npm run test:watch   # Vitest (watch mode)
```

## Testing

Tests live in `__tests__/` directories adjacent to their source:
- `lib/__tests__/types.test.ts` — Plan labels, category labels, statusDotColor helper
- `lib/__tests__/api.test.ts` — API client methods, error handling, fetchAllDeployments
- `lib/__tests__/supabase.test.ts` — Null-safe client initialization
- `app/__tests__/grant-info.test.tsx` — Grant info page rendering (5 categories, eligibility, CTAs)

Config: `vitest.config.ts` (jsdom environment, `@` path alias, setup file for jest-dom matchers).

## Documentation

- `README.md` — Project overview, setup, env vars, design system
- `ARCHITECTURE.md` — System design, data flow diagrams, key design decisions
- `CHANGELOG.md` — Sprint-by-sprint release history
- `docs/plans/2026-03-02-crewly-portal-genaixdl-design.md` — Full design + sprint completion notes
