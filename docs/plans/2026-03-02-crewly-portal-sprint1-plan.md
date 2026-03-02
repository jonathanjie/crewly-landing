# Crewly Portal Sprint 1 — Foundation

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the Crewly customer portal with auth, dashboard, agent management, and deploy wizard — all backed by the Fleet Control API.

**Architecture:** Extend crewly-landing (Next.js 16 App Router) with `/portal/*` client-rendered pages. Remove static export — run as Next.js server behind Caddy. Auth via Supabase (shared instance with Fleet Control). API calls to `fleet.marinachain.io/api/v1/*`.

**Tech Stack:** Next.js 16, React 19, Supabase JS v2, Tailwind v4, TypeScript 5

---

### Task 1: Project setup

**Files:**
- Modify: `next.config.ts`
- Modify: `package.json` (via npm install)
- Create: `.env.local`

**Step 1: Install Supabase client**

```bash
cd /home/jons-openclaw/crewly-landing
npm install @supabase/supabase-js
```

**Step 2: Remove static export from next.config.ts**

Replace the entire file:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
};

export default nextConfig;
```

**Step 3: Create .env.local**

```
NEXT_PUBLIC_SUPABASE_URL=https://fxacuwmynnygzubpqdve.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4YWN1d215bm55Z3p1YnBxZHZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MzgyMjMsImV4cCI6MjA1NTUxNDIyM30.LFM2IAqmENDiAdiwlsdDh4MdT3M7EGZIFRK20OnF1s0
NEXT_PUBLIC_FLEET_API_BASE=https://fleet.marinachain.io
```

**Step 4: Verify build**

```bash
npm run build
```

Expected: Build succeeds (landing page still works)

**Step 5: Commit**

```bash
git add -A && git commit -m "chore: install Supabase, remove static export for portal routes"
```

---

### Task 2: Supabase client + types

**Files:**
- Create: `lib/supabase.ts`
- Create: `lib/types.ts`

**Step 1: Create Supabase client singleton**

```typescript
// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase: SupabaseClient | null = url
  ? createClient(url, key)
  : null;
```

**Step 2: Create shared types**

```typescript
// lib/types.ts
export interface Org {
  id: string;
  name: string;
  slug: string;
  plan_tier: "free" | "starter" | "pro" | "enterprise";
}

export interface AppTemplate {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  default_skills: string[];
  config_schema: Record<string, unknown>;
}

export interface AppInstance {
  id: string;
  name: string;
  status: "pending" | "provisioning" | "active" | "failed" | "stopped";
  template_id: string;
  organization_id: string;
  agent_id: string | null;
  created_at: string;
  deployed_at: string | null;
}

export interface InstanceHealth {
  agent_id: string | null;
  status: "online" | "offline" | "no_agent";
  last_heartbeat: string | null;
  minutes_since_heartbeat: number | null;
  host: Record<string, unknown> | null;
  openclaw: Record<string, unknown> | null;
  skills: string[] | null;
  channels: Record<string, { enabled: boolean }> | null;
}
```

**Step 3: Commit**

```bash
git add lib/ && git commit -m "feat: Supabase client singleton + shared TypeScript types"
```

---

### Task 3: Auth context + login page

**Files:**
- Create: `lib/auth-context.tsx`
- Create: `app/login/page.tsx`

**Step 1: Create AuthProvider**

```typescript
// lib/auth-context.tsx
"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

interface AuthCtx {
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({
  session: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_ev, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{
      session,
      loading,
      signOut: async () => { await supabase?.auth.signOut(); setSession(null); },
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

**Step 2: Create login page**

```tsx
// app/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const { session } = useAuth();

  useEffect(() => {
    if (session) router.replace("/portal");
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError(null);

    const { error: authErr } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (authErr) setError(authErr.message);
    else router.push("/portal");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-teal" />
              <div className="w-2 h-2 rounded-full bg-coral" />
              <div className="w-2 h-2 rounded-full bg-teal-deep" />
            </div>
            <span className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
              crewly
            </span>
          </div>
          <p className="text-ink-light text-sm">
            {isSignUp ? "Create your account" : "Sign in to your portal"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-white text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal text-sm"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-white text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal text-sm"
          />

          {error && (
            <p className="text-coral-deep text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-deep text-white font-semibold py-3 rounded-xl hover:bg-teal-deep/90 transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? "..." : isSignUp ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm text-ink-light mt-6">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
            className="text-teal-deep font-medium hover:underline"
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>

        <div className="text-center mt-8">
          <a href="/" className="text-xs text-ink-faint hover:text-ink-light transition-colors">
            &larr; Back to crewly.chat
          </a>
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Wrap root layout with AuthProvider**

Modify `app/layout.tsx` to wrap children with AuthProvider. Add at top:
```typescript
import { AuthProvider } from "@/lib/auth-context";
```

Wrap `{children}` in the body:
```tsx
<AuthProvider>
  {children}
</AuthProvider>
```

**Step 4: Build and verify**

```bash
npm run build
```

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: auth context + login page with Supabase"
```

---

### Task 4: API client

**Files:**
- Create: `lib/api.ts`

**Step 1: Create Fleet Control API client**

```typescript
// lib/api.ts
import { supabase } from "./supabase";
import type { Org, AppTemplate, AppInstance, InstanceHealth } from "./types";

const API = process.env.NEXT_PUBLIC_FLEET_API_BASE ?? "";

async function portalFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const session = (await supabase?.auth.getSession())?.data.session;
  const token = session?.access_token ?? "";

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "" }));
    throw new Error(err.detail || res.statusText || `Request failed (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  // Organizations
  listOrgs: () => portalFetch<Org[]>("/api/v1/orgs"),

  // Templates
  listTemplates: () => portalFetch<AppTemplate[]>("/api/v1/catalog"),

  // Deployments
  listDeployments: (orgSlug: string) =>
    portalFetch<AppInstance[]>(`/api/v1/deployments?org=${orgSlug}`),

  deploy: (body: { organization_id: string; template_id: string; name: string; config: Record<string, unknown> }) =>
    portalFetch<AppInstance>("/api/v1/deployments", { method: "POST", body: JSON.stringify(body) }),

  getDeployment: (id: string) =>
    portalFetch<AppInstance>(`/api/v1/deployments/${id}`),

  getHealth: (id: string) =>
    portalFetch<InstanceHealth>(`/api/v1/deployments/${id}/health`),

  restartDeployment: (id: string) =>
    portalFetch<{ status: string }>(`/api/v1/deployments/${id}/restart`, { method: "POST" }),

  stopDeployment: (id: string) =>
    portalFetch<{ status: string }>(`/api/v1/deployments/${id}/stop`, { method: "POST" }),
};
```

**Step 2: Commit**

```bash
git add lib/api.ts && git commit -m "feat: Fleet Control API client with JWT auth"
```

---

### Task 5: Portal layout

**Files:**
- Create: `app/portal/layout.tsx`

**Step 1: Create auth-gated portal layout**

```tsx
// app/portal/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

const navLinks = [
  { href: "/portal", label: "Dashboard" },
  { href: "/portal/agents", label: "My Agents" },
  { href: "/portal/deploy", label: "Deploy" },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { session, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !session) router.replace("/login");
  }, [loading, session, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-6 h-6 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-ink/5">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/portal" className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-teal" />
                <div className="w-1.5 h-1.5 rounded-full bg-coral" />
                <div className="w-1.5 h-1.5 rounded-full bg-teal-deep" />
              </div>
              <span className="font-[family-name:var(--font-display)] text-sm font-bold text-ink">
                crewly
              </span>
            </Link>

            {/* Links */}
            <div className="flex gap-1">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    pathname === href
                      ? "bg-teal/10 text-teal-deep"
                      : "text-ink-light hover:text-ink hover:bg-ink/5"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: user + sign out */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-ink-light hidden sm:inline">
              {session.user.email}
            </span>
            <button
              onClick={async () => { await signOut(); router.push("/login"); }}
              className="text-xs text-ink-faint hover:text-ink-light transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
```

**Step 2: Build and verify**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add app/portal/ && git commit -m "feat: portal layout with auth gate and Crewly nav"
```

---

### Task 6: Dashboard page

**Files:**
- Create: `app/portal/page.tsx`

**Step 1: Create dashboard**

```tsx
// app/portal/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Org, AppInstance } from "@/lib/types";

export default function Dashboard() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [agents, setAgents] = useState<AppInstance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const orgsData = await api.listOrgs();
        setOrgs(orgsData);
        const allAgents: AppInstance[] = [];
        for (const org of orgsData) {
          const deps = await api.listDeployments(org.slug);
          allAgents.push(...deps);
        }
        setAgents(allAgents);
      } catch {
        // Silently degrade — user sees empty state
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const active = agents.filter((a) => a.status === "active").length;

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink mb-6">
        Dashboard
      </h1>

      {loading ? (
        <div className="grid sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-ink/5 animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <StatCard label="Active Agents" value={String(active)} accent="bg-teal/10 text-teal-deep" />
            <StatCard label="Total Deployed" value={String(agents.length)} accent="bg-ink/5 text-ink" />
            <StatCard label="Organizations" value={String(orgs.length)} accent="bg-coral/10 text-coral-deep" />
          </div>

          {/* Empty state or quick actions */}
          {agents.length === 0 ? (
            <div className="bg-white rounded-2xl border border-ink/5 p-12 text-center">
              <p className="text-4xl mb-4">🚀</p>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink mb-2">
                Deploy your first crew member
              </h2>
              <p className="text-ink-light text-sm mb-6 max-w-md mx-auto">
                Pick from our templates — knowledge assistants, customer support agents,
                operations automation, and more.
              </p>
              <Link
                href="/portal/deploy"
                className="inline-flex items-center gap-2 bg-teal-deep text-white font-semibold px-6 py-3 rounded-xl hover:bg-teal-deep/90 transition-colors text-sm"
              >
                Browse templates
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-ink/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-[family-name:var(--font-display)] font-bold text-ink">
                  Recent agents
                </h2>
                <Link href="/portal/agents" className="text-xs text-teal-deep hover:underline">
                  View all →
                </Link>
              </div>
              <div className="space-y-3">
                {agents.slice(0, 5).map((agent) => (
                  <Link
                    key={agent.id}
                    href={`/portal/agents/${agent.id}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-ink/3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        agent.status === "active" ? "bg-teal" : agent.status === "failed" ? "bg-coral" : "bg-ink-faint"
                      }`} />
                      <span className="text-sm font-medium text-ink">{agent.name}</span>
                    </div>
                    <span className="text-xs text-ink-faint capitalize">{agent.status}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-ink/5">
      <p className="text-xs text-ink-light mb-1">{label}</p>
      <p className={`font-[family-name:var(--font-display)] text-3xl font-bold ${accent} inline-block px-2 py-0.5 rounded-lg`}>
        {value}
      </p>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add app/portal/page.tsx && git commit -m "feat: portal dashboard with stats and empty state"
```

---

### Task 7: My Agents page

**Files:**
- Create: `app/portal/agents/page.tsx`

**Step 1: Create agent list**

```tsx
// app/portal/agents/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { AppInstance, InstanceHealth } from "@/lib/types";

export default function MyAgents() {
  const [agents, setAgents] = useState<AppInstance[]>([]);
  const [healthMap, setHealthMap] = useState<Record<string, InstanceHealth | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const orgs = await api.listOrgs();
        const all: AppInstance[] = [];
        for (const org of orgs) {
          all.push(...await api.listDeployments(org.slug));
        }
        setAgents(all);

        // Fetch health in parallel
        const results = await Promise.allSettled(
          all.map(async (a) => {
            const h = await api.getHealth(a.id);
            return [a.id, h] as const;
          })
        );
        const hm: Record<string, InstanceHealth | null> = {};
        results.forEach((r) => {
          if (r.status === "fulfilled") hm[r.value[0]] = r.value[1];
        });
        setHealthMap(hm);
      } catch {
        // empty
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
          My Agents
        </h1>
        <Link
          href="/portal/deploy"
          className="bg-teal-deep text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-teal-deep/90 transition-colors"
        >
          + Deploy
        </Link>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-ink/5 p-6 animate-pulse h-40" />
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-ink/5 p-12 text-center">
          <p className="text-3xl mb-3">🤖</p>
          <p className="text-ink-light text-sm">No agents deployed yet.</p>
          <Link href="/portal/deploy" className="text-teal-deep text-sm hover:underline mt-2 inline-block">
            Deploy your first agent →
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => {
            const health = healthMap[agent.id];
            const isOnline = health?.status === "online";
            return (
              <Link
                key={agent.id}
                href={`/portal/agents/${agent.id}`}
                className="bg-white rounded-2xl border border-ink/5 p-6 hover:shadow-md hover:border-ink/10 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-[family-name:var(--font-display)] font-bold text-ink text-sm group-hover:text-teal-deep transition-colors">
                    {agent.name}
                  </h3>
                  <div className={`w-2.5 h-2.5 rounded-full mt-1 ${
                    isOnline ? "bg-teal" : agent.status === "failed" ? "bg-coral" : "bg-ink-faint"
                  }`} />
                </div>

                <p className="text-xs text-ink-light capitalize mb-4">{agent.status}</p>

                {health && isOnline && health.minutes_since_heartbeat != null && (
                  <p className="text-xs text-ink-faint">
                    Last heartbeat: {health.minutes_since_heartbeat < 1 ? "just now" : `${Math.round(health.minutes_since_heartbeat)}m ago`}
                  </p>
                )}

                {health?.skills && health.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {health.skills.slice(0, 3).map((s) => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-teal/10 text-teal-deep">
                        {s}
                      </span>
                    ))}
                    {health.skills.length > 3 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-ink/5 text-ink-faint">
                        +{health.skills.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add app/portal/agents/ && git commit -m "feat: My Agents page with health cards"
```

---

### Task 8: Agent detail page

**Files:**
- Create: `app/portal/agents/[id]/page.tsx`

**Step 1: Create agent detail**

```tsx
// app/portal/agents/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { AppInstance, InstanceHealth } from "@/lib/types";

type Tab = "overview" | "skills" | "channels";

export default function AgentDetail() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [agent, setAgent] = useState<AppInstance | null>(null);
  const [health, setHealth] = useState<InstanceHealth | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [a, h] = await Promise.all([
          api.getDeployment(id),
          api.getHealth(id).catch(() => null),
        ]);
        setAgent(a);
        setHealth(h);
      } catch {
        // will show error state
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleAction = async (action: "restart" | "stop") => {
    setActionLoading(true);
    try {
      if (action === "restart") await api.restartDeployment(id);
      else await api.stopDeployment(id);
      // Refresh data
      const [a, h] = await Promise.all([
        api.getDeployment(id),
        api.getHealth(id).catch(() => null),
      ]);
      setAgent(a);
      setHealth(h);
    } catch {
      // handle silently
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-white rounded-2xl h-64 border border-ink/5" />;
  }

  if (!agent) {
    return (
      <div className="text-center py-12">
        <p className="text-ink-light">Agent not found.</p>
        <button onClick={() => router.back()} className="text-teal-deep text-sm mt-2 hover:underline">
          ← Go back
        </button>
      </div>
    );
  }

  const isOnline = health?.status === "online";
  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "skills", label: "Skills" },
    { key: "channels", label: "Channels" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-ink-faint hover:text-ink text-sm">
            ←
          </button>
          <div className={`w-3 h-3 rounded-full ${isOnline ? "bg-teal" : "bg-ink-faint"}`} />
          <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink">
            {agent.name}
          </h1>
          <span className="text-xs text-ink-faint capitalize bg-ink/5 px-2 py-0.5 rounded-full">
            {agent.status}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleAction("restart")}
            disabled={actionLoading}
            className="text-xs border border-ink/10 text-ink px-3 py-1.5 rounded-lg hover:bg-ink/5 transition-colors disabled:opacity-50"
          >
            Restart
          </button>
          <button
            onClick={() => handleAction("stop")}
            disabled={actionLoading}
            className="text-xs border border-coral/30 text-coral-deep px-3 py-1.5 rounded-lg hover:bg-coral/5 transition-colors disabled:opacity-50"
          >
            Stop
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-ink/5 pb-px">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-xs font-medium rounded-t-lg transition-colors ${
              tab === t.key
                ? "bg-white text-teal-deep border border-ink/5 border-b-white -mb-px"
                : "text-ink-light hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-2xl border border-ink/5 p-6">
        {tab === "overview" && (
          <div className="space-y-4">
            <Row label="Status" value={isOnline ? "Online" : "Offline"} />
            <Row label="Agent ID" value={agent.agent_id ?? "—"} mono />
            <Row label="Created" value={agent.created_at ? new Date(agent.created_at).toLocaleDateString() : "—"} />
            {health?.last_heartbeat && (
              <Row label="Last Heartbeat" value={new Date(health.last_heartbeat).toLocaleString()} />
            )}
            {health?.host && typeof health.host === "object" && (
              <>
                {(health.host as Record<string, unknown>).cpu_percent != null && (
                  <Row label="CPU" value={`${(health.host as Record<string, number>).cpu_percent}%`} />
                )}
                {(health.host as Record<string, unknown>).memory_percent != null && (
                  <Row label="Memory" value={`${(health.host as Record<string, number>).memory_percent}%`} />
                )}
              </>
            )}
          </div>
        )}

        {tab === "skills" && (
          <div>
            {health?.skills && health.skills.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-2">
                {health.skills.map((s) => (
                  <div key={s} className="flex items-center gap-2 p-3 rounded-xl bg-teal/5 border border-teal/10">
                    <span className="text-teal-deep text-sm">✦</span>
                    <span className="text-sm text-ink font-medium">{s}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-light">No skills detected.</p>
            )}
          </div>
        )}

        {tab === "channels" && (
          <div>
            {health?.channels && Object.keys(health.channels).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(health.channels).map(([name, ch]) => (
                  <div key={name} className="flex items-center justify-between p-3 rounded-xl bg-ink/3">
                    <span className="text-sm font-medium text-ink capitalize">{name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      ch.enabled ? "bg-teal/10 text-teal-deep" : "bg-ink/5 text-ink-faint"
                    }`}>
                      {ch.enabled ? "Connected" : "Disabled"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-light">No channels configured.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-ink/5 last:border-0">
      <span className="text-xs text-ink-light">{label}</span>
      <span className={`text-sm text-ink ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add app/portal/agents/ && git commit -m "feat: agent detail page with overview, skills, channels tabs"
```

---

### Task 9: Deploy wizard

**Files:**
- Create: `app/portal/deploy/page.tsx`

**Step 1: Create deploy wizard**

```tsx
// app/portal/deploy/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Org, AppTemplate } from "@/lib/types";

type Step = "template" | "configure" | "deploy";

const categoryLabels: Record<string, string> = {
  "knowledge-management": "Knowledge Mining",
  "customer-engagement": "Customer Engagement",
  "operations-automation": "Operations Automation",
  "content-generation": "Content Generation",
  "team-productivity": "Team Ops",
};

export default function DeployWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("template");
  const [templates, setTemplates] = useState<AppTemplate[]>([]);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<AppTemplate | null>(null);
  const [agentName, setAgentName] = useState("");
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [t, o] = await Promise.all([api.listTemplates(), api.listOrgs()]);
        setTemplates(t);
        setOrgs(o);
      } catch {
        setError("Failed to load templates");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDeploy = async () => {
    if (!selectedTemplate || !agentName.trim() || orgs.length === 0) return;
    setDeploying(true);
    setError(null);
    try {
      const instance = await api.deploy({
        organization_id: orgs[0].id,
        template_id: selectedTemplate.id,
        name: agentName.trim(),
        config: { agent_name: agentName.trim() },
      });
      router.push(`/portal/agents/${instance.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deploy failed");
      setDeploying(false);
    }
  };

  const steps: { key: Step; label: string; num: number }[] = [
    { key: "template", label: "Choose template", num: 1 },
    { key: "configure", label: "Configure", num: 2 },
    { key: "deploy", label: "Deploy", num: 3 },
  ];

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink mb-6">
        Deploy a new agent
      </h1>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step === s.key ? "bg-teal-deep text-white" :
              steps.findIndex(x => x.key === step) > i ? "bg-teal/20 text-teal-deep" :
              "bg-ink/5 text-ink-faint"
            }`}>
              {s.num}
            </div>
            <span className={`text-xs ${step === s.key ? "text-ink font-medium" : "text-ink-faint"}`}>
              {s.label}
            </span>
            {i < steps.length - 1 && <div className="w-8 h-px bg-ink/10" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-coral/10 text-coral-deep text-sm px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      {/* Step: Template */}
      {step === "template" && (
        <div>
          {loading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-ink/5 p-6 animate-pulse h-32" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setSelectedTemplate(t); setStep("configure"); }}
                  className={`text-left bg-white rounded-2xl border p-6 hover:shadow-md transition-all ${
                    selectedTemplate?.id === t.id ? "border-teal ring-2 ring-teal/20" : "border-ink/5 hover:border-ink/10"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{t.icon || "🤖"}</span>
                    <div>
                      <h3 className="font-[family-name:var(--font-display)] font-bold text-ink text-sm mb-1">
                        {t.name}
                      </h3>
                      <p className="text-xs text-ink-light line-clamp-2">{t.description}</p>
                      {t.category && (
                        <span className="text-[10px] mt-2 inline-block px-2 py-0.5 rounded-full bg-ink/5 text-ink-faint">
                          {categoryLabels[t.category] ?? t.category}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step: Configure */}
      {step === "configure" && selectedTemplate && (
        <div className="max-w-md">
          <div className="bg-white rounded-2xl border border-ink/5 p-6 mb-4">
            <p className="text-xs text-ink-light mb-1">Template</p>
            <p className="text-sm font-medium text-ink">{selectedTemplate.name}</p>
          </div>

          <div className="bg-white rounded-2xl border border-ink/5 p-6">
            <label className="block text-xs text-ink-light mb-2">Agent name</label>
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="e.g. Support Bot, Knowledge Assistant"
              className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-cream text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-teal/40 text-sm"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setStep("template")}
              className="text-sm text-ink-light hover:text-ink transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={() => agentName.trim() && setStep("deploy")}
              disabled={!agentName.trim()}
              className="bg-teal-deep text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-teal-deep/90 transition-colors disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step: Deploy */}
      {step === "deploy" && selectedTemplate && (
        <div className="max-w-md">
          <div className="bg-white rounded-2xl border border-ink/5 p-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-xs text-ink-light">Template</span>
              <span className="text-sm text-ink">{selectedTemplate.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-ink-light">Agent name</span>
              <span className="text-sm text-ink font-medium">{agentName}</span>
            </div>
            {orgs[0] && (
              <div className="flex justify-between">
                <span className="text-xs text-ink-light">Organization</span>
                <span className="text-sm text-ink">{orgs[0].name}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setStep("configure")}
              className="text-sm text-ink-light hover:text-ink transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={handleDeploy}
              disabled={deploying}
              className="bg-teal-deep text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-teal-deep/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {deploying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Deploying...
                </>
              ) : (
                "Deploy agent"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Build and verify**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add app/portal/deploy/ && git commit -m "feat: deploy wizard — template selection, configure, deploy"
```

---

### Task 10: Full build verification + Caddy config

**Step 1: Build**

```bash
cd /home/jons-openclaw/crewly-landing && npm run build
```

Expected: Build succeeds with all pages.

**Step 2: Test dev server**

```bash
npm run dev &
sleep 3
curl -s http://localhost:3000 | head -5
curl -s http://localhost:3000/login | head -5
curl -s http://localhost:3000/portal | head -5
kill %1
```

Expected: All 3 return HTML.

**Step 3: Commit everything**

```bash
git add -A && git commit -m "feat: Crewly Portal Sprint 1 complete — auth, dashboard, agents, deploy wizard"
```
