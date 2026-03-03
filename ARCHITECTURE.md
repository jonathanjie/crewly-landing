# Architecture

## System Overview

```
┌─────────────────────────────────────────┐
│           crewly.chat (VPS)             │
│                                         │
│  Caddy ──► Next.js 16 (PM2)            │
│  :443       :3000                       │
│                                         │
│  Static pages:  /, /grant-info          │
│  Client SPA:    /portal/*               │
│  API proxy:     /api/fleet/* ──────┐    │
│                                    │    │
└────────────────────────────────────┼────┘
                                     │
                    HTTPS            │
                                     ▼
┌─────────────────────────────────────────┐
│     fleet.marinachain.io (VPS)          │
│                                         │
│  Caddy ──► Fleet Control API (uvicorn)  │
│  :443       :8100                       │
│                                         │
│  FastAPI + SQLAlchemy + PostgreSQL       │
│  Docker provisioner for agent containers│
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         Supabase (shared)               │
│                                         │
│  Auth (JWT tokens)                      │
│  User management                        │
└─────────────────────────────────────────┘
```

## Key Design Decisions

### 1. CORS Proxy (`/api/fleet/[...path]`)

All Fleet Control API calls are proxied server-side through a Next.js API route. This eliminates CORS issues entirely — the browser only talks to `crewly.chat`, and the server forwards requests to `fleet.marinachain.io`.

The proxy reads the API URL from env vars: `FLEET_API_INTERNAL` (server-only override) > `NEXT_PUBLIC_FLEET_API_BASE` (fallback).

### 2. Client-Side Portal Rendering

Portal pages use `"use client"` with React client-side rendering. No SSR for portal routes — data fetching happens in `useEffect` with proper loading/error states. This keeps the architecture simple and avoids hydration complexity.

The landing page and `/grant-info` are statically generated at build time.

### 3. Null-Safe Supabase Client

`lib/supabase.ts` returns `null` when env vars are empty. Every consumer handles the null case, allowing the app to build and partially function without Supabase configuration (landing page works, portal redirects to login).

### 4. Auth Flow

```
User ──► /login (Supabase signIn) ──► Session stored in browser
  │
  └──► /portal/* (AuthProvider checks session)
         │
         ├── Has session ──► Render portal, attach JWT to API calls
         └── No session  ──► Redirect to /login
```

`AuthProvider` wraps the entire app. Portal layout acts as an auth gate — if `session` is null after loading completes, it redirects to `/login`.

### 5. API Client Pattern

`lib/api.ts` exports an `api` object with typed methods for each Fleet Control endpoint. All methods use `portalFetch()`, which:
1. Gets the current Supabase session
2. Extracts the JWT access token
3. Calls `/api/fleet/...` (the CORS proxy) with the token as `Authorization: Bearer`
4. Throws a typed error on non-OK responses (extracts `detail` from JSON body)

### 6. Design System

The app uses Tailwind v4 with custom theme tokens defined in `globals.css` via `@theme inline`. No component library — all UI is built from Tailwind utility classes following consistent patterns:

- **Cards:** `bg-white rounded-2xl border border-ink/5 p-6`
- **Inputs:** `rounded-xl border border-ink/10 bg-cream text-ink focus:ring-2 focus:ring-teal/40`
- **Status:** teal (online), coral (failed), amber (provisioning), ink-faint (stopped)
- **Typography:** `font-[family-name:var(--font-display)]` for headings, body font is default

### 7. Grain Texture

A subtle SVG noise texture is applied as a fixed pseudo-element (`.grain::before`) for visual warmth. It's disabled during print/PDF export.

## Directory Structure

```
app/
├── layout.tsx              Root layout (fonts, AuthProvider)
├── page.tsx                Landing page (static)
├── globals.css             Theme tokens, animations, print styles
├── login/                  Supabase auth
├── grant-info/             Public GenAIxDL explainer
├── not-found.tsx           Custom 404
├── portal/
│   ├── layout.tsx          Auth gate + nav (desktop + mobile)
│   ├── loading.tsx         Branded skeleton
│   ├── error.tsx           Error boundary
│   └── [pages]/            Dashboard, agents, deploy, grant, roi, org, settings
└── api/fleet/              CORS proxy

components/                 Landing page sections (Hero, Nav, Pricing, etc.)

lib/
├── api.ts                  Fleet Control API client (portalFetch + typed wrappers)
├── auth-context.tsx        AuthProvider + useAuth hook
├── supabase.ts             Supabase client (null-safe)
└── types.ts                TypeScript types + helper constants

docs/
├── caddy/                  Caddy reverse proxy config
└── plans/                  Design docs + sprint plans

scripts/
└── deploy.sh               Production deploy script
```

## Data Flow

### Agent Deployment
```
User selects template ──► Configure name ──► POST /api/v1/deployments
                                                     │
                                              Fleet Control creates
                                              AppInstance + Docker container
                                                     │
                                              Beacon heartbeat starts
                                                     │
                                              Health endpoint shows "online"
```

### ROI Calculation
```
Dashboard ──► fetchAllDeployments() ──► Per-agent health check (Promise.allSettled)
                                              │
                                       Estimate uptime from health status
                                       Estimate hours saved (uptime × skills × user inputs)
                                       Calculate cost saved (hours × hourly rate)
```

ROI is calculated client-side using `estimateHoursSaved()` — a pure function of health data and user-configurable inputs (hourly rate, hours/agent/week, weeks deployed). No backend ROI endpoint required for the current implementation.

## Testing

Tests use Vitest with jsdom environment and React Testing Library:

- `lib/__tests__/types.test.ts` — Type helpers, plan labels, status dot colors
- `lib/__tests__/api.test.ts` — API client methods, error handling, fetchAllDeployments
- `lib/__tests__/supabase.test.ts` — Null-safe client initialization
- `app/__tests__/grant-info.test.tsx` — Grant info page rendering

Run with `npm test` (single run) or `npm run test:watch` (watch mode).
