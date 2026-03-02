# Crewly Sprint 2 — GenAIxDL Grant Features

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add GenAIxDL grant eligibility checker, ROI dashboard, public grant info page, CORS proxy, and mobile responsive portal nav.

**Architecture:** Sprint 1 established the portal foundation (`/portal/*` with client-side rendering, Supabase auth, Fleet Control API calls). Sprint 2 adds a Next.js API route proxy to eliminate CORS issues with Fleet Control, two new portal pages (grant eligibility + ROI dashboard), one public page (/grant-info), and mobile responsive nav. The proxy is the critical dependency — Tasks 2 and 3 depend on it being in place first.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, TypeScript 5

**Dependency graph:**
```
Task 1 (CORS proxy + api.ts update)
  ├── Task 2 (Grant eligibility — client-only, but benefits from proxy for future)
  ├── Task 3 (ROI dashboard — needs proxy for metrics fetch)
  └── Task 5 (Mobile nav — independent, but test after proxy)
Task 4 (Public grant-info page — fully independent, no auth, no proxy)
```

---

### Task 1: Next.js API proxy route (CORS fix)

**Files:**
- Create: `app/api/fleet/[...path]/route.ts`
- Modify: `lib/api.ts`
- Modify: `.env.local` (add `FLEET_API_INTERNAL` — server-side only, no `NEXT_PUBLIC_` prefix)

**Why:** The portal currently calls `fleet.marinachain.io` directly from the browser. This hits CORS restrictions because Fleet Control's CORS headers don't include `crewly.chat`. Rather than adding CORS headers to Fleet Control (which would need to be maintained for every new domain), we proxy through Next.js's server-side API routes. The browser calls `/api/fleet/...`, Next.js forwards to Fleet Control server-side (no CORS), and returns the response.

**Step 1: Add server-side env var**

Add to `.env.local`:

```
FLEET_API_INTERNAL=https://fleet.marinachain.io
```

This is a server-only variable (no `NEXT_PUBLIC_` prefix) — only accessible in API routes, not exposed to the browser.

**Step 2: Create the catch-all proxy route**

Create `app/api/fleet/[...path]/route.ts`:

```typescript
// app/api/fleet/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";

const FLEET_API = process.env.FLEET_API_INTERNAL ?? "https://fleet.marinachain.io";

async function proxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const target = `${FLEET_API}/api/${path.join("/")}`;

  // Forward query string
  const url = new URL(target);
  req.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  // Build forwarded headers — pass through Authorization + Content-Type
  const headers = new Headers();
  const auth = req.headers.get("authorization");
  if (auth) headers.set("Authorization", auth);
  const ct = req.headers.get("content-type");
  if (ct) headers.set("Content-Type", ct);

  // Forward the request
  const upstream = await fetch(url.toString(), {
    method: req.method,
    headers,
    body: req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined,
  });

  // Stream response back
  const responseHeaders = new Headers();
  const upstreamCT = upstream.headers.get("content-type");
  if (upstreamCT) responseHeaders.set("Content-Type", upstreamCT);

  // Handle 204 No Content
  if (upstream.status === 204) {
    return new NextResponse(null, { status: 204, headers: responseHeaders });
  }

  const body = await upstream.text();
  return new NextResponse(body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
```

**Mapping:** Browser calls `/api/fleet/v1/orgs` → proxy hits `https://fleet.marinachain.io/api/v1/orgs`.

**Step 3: Update lib/api.ts to use local proxy**

Replace the entire file:

```typescript
// lib/api.ts
import { supabase } from "./supabase";
import type { Org, AppTemplate, AppInstance, InstanceHealth, AgentROI } from "./types";

// In the browser, call our own Next.js API proxy (no CORS issues).
// The proxy forwards to Fleet Control server-side.
const API = "/api/fleet";

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
  // Existing endpoints
  listOrgs: () => portalFetch<Org[]>("/v1/orgs"),
  listTemplates: () => portalFetch<AppTemplate[]>("/v1/catalog"),
  listDeployments: (orgSlug: string) =>
    portalFetch<AppInstance[]>(`/v1/deployments?org=${orgSlug}`),
  deploy: (body: { organization_id: string; template_id: string; name: string; config: Record<string, unknown> }) =>
    portalFetch<AppInstance>("/v1/deployments", { method: "POST", body: JSON.stringify(body) }),
  getDeployment: (id: string) =>
    portalFetch<AppInstance>(`/v1/deployments/${id}`),
  getHealth: (id: string) =>
    portalFetch<InstanceHealth>(`/v1/deployments/${id}/health`),
  restartDeployment: (id: string) =>
    portalFetch<{ status: string }>(`/v1/deployments/${id}/restart`, { method: "POST" }),
  stopDeployment: (id: string) =>
    portalFetch<{ status: string }>(`/v1/deployments/${id}/stop`, { method: "POST" }),

  // Sprint 2: ROI metrics
  getROI: (id: string, hours = 720) =>
    portalFetch<AgentROI>(`/v1/deployments/${id}/roi?hours=${hours}`),
};
```

**Key change:** `API` constant goes from `process.env.NEXT_PUBLIC_FLEET_API_BASE` (external URL) to `"/api/fleet"` (local proxy). All path prefixes drop `/api` since the proxy maps `/api/fleet/v1/...` → `fleet.marinachain.io/api/v1/...`.

**Step 4: Remove NEXT_PUBLIC_FLEET_API_BASE from .env.local**

The `NEXT_PUBLIC_FLEET_API_BASE` env var is no longer needed. Remove it from `.env.local`. The file should now contain:

```
NEXT_PUBLIC_SUPABASE_URL=https://fxacuwmynnygzubpqdve.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_MdtDvd3YqCbpjsFHbFjv5w_M1CbKYt1
FLEET_API_INTERNAL=https://fleet.marinachain.io
```

**Step 5: Verify build**

```bash
cd /home/jons-openclaw/crewly-landing && npm run build
```

Expected: Build succeeds. The proxy route is compiled as a serverless function.

**Step 6: Smoke test**

```bash
cd /home/jons-openclaw/crewly-landing && npm run dev &
sleep 3
# Test proxy route (no auth needed for this test — expects 401 or 403 which confirms proxy is working)
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/fleet/v1/orgs
# Should return 401 or 403 (not 404), proving the proxy forwards correctly
kill %1
```

**Step 7: Commit**

```bash
git add app/api/fleet/ lib/api.ts .env.local && git commit -m "feat: Next.js API proxy for Fleet Control — eliminates CORS issues"
```

---

### Task 2: Grant eligibility checker (`/portal/grant`)

**Files:**
- Create: `app/portal/grant/page.tsx`
- Create: `lib/grant-eligibility.ts` (pure logic, testable)
- Modify: `app/portal/layout.tsx` (add nav link)
- Modify: `lib/types.ts` (add `GrantEligibilityResult` type)

**Why:** DME customers need to self-check their GenAIxDL eligibility before booking a consultation. This is a client-side calculator — no API calls needed. All eligibility logic runs in the browser.

**Step 1: Add types to lib/types.ts**

Append to `lib/types.ts`:

```typescript
// --- Grant eligibility (Sprint 2) ---

export type UseCaseCategory = "KM" | "CE" | "OA" | "CG" | "CA";

export interface GrantEligibilityInput {
  acraNumber: string;
  ssicCode: string;
  employeeCount: number;
  annualTurnover: number; // in SGD
  useCases: UseCaseCategory[];
}

export interface GrantEligibilityResult {
  eligible: boolean;
  reasons: string[];
  isSME: boolean;
  fundingPercentage: number; // 50 for SME, 30 for non-SME
  maxFunding: number; // 20000
  estimatedFunding: number; // fundingPercentage% of $20K project
}

export interface AgentROI {
  queries_handled: number;
  avg_response_ms: number;
  uptime_pct: number;
  estimated_hours_saved: number;
  cost_avoided: number;
}
```

**Step 2: Create pure eligibility logic**

Create `lib/grant-eligibility.ts`:

```typescript
// lib/grant-eligibility.ts
import type { GrantEligibilityInput, GrantEligibilityResult } from "./types";

const PROJECT_COST = 20_000; // Max per DME project
const SME_FUNDING_PCT = 50;
const NON_SME_FUNDING_PCT = 30;

// SME definition: ≤200 employees OR ≤$100M annual turnover
const SME_MAX_EMPLOYEES = 200;
const SME_MAX_TURNOVER = 100_000_000;

// ICT SSIC codes start with 61, 62, or 63 — these are NOT eligible
const ICT_SSIC_PREFIXES = ["61", "62", "63"];

/**
 * Validate ACRA number format.
 * Singapore UEN formats:
 * - Business (old): 8-9 digits + letter (e.g. 53301245A)
 * - Local company: YYYYNNNNNX (e.g. 202012345A)
 * - Others: TYYPPNNNNA (e.g. T08LL0001A)
 * For simplicity, we check: 8-10 alphanumeric chars.
 */
export function isValidACRA(acra: string): boolean {
  const cleaned = acra.trim().toUpperCase();
  return /^[A-Z0-9]{8,10}$/.test(cleaned);
}

/**
 * Check if SSIC code is in the Non-ICT category.
 * ICT codes: Division 61 (Telecommunications), 62 (Computer programming),
 * 63 (Information service activities).
 * GenAIxDL Quick Win requires Non-ICT companies.
 */
export function isNonICT(ssicCode: string): boolean {
  const cleaned = ssicCode.trim();
  if (cleaned.length < 2) return false;
  const prefix = cleaned.slice(0, 2);
  return !ICT_SSIC_PREFIXES.includes(prefix);
}

/**
 * Determine if the company qualifies as an SME.
 * SME: ≤200 employees OR ≤$100M annual turnover.
 */
export function isSME(employeeCount: number, annualTurnover: number): boolean {
  return employeeCount <= SME_MAX_EMPLOYEES || annualTurnover <= SME_MAX_TURNOVER;
}

/**
 * Run full eligibility check. Returns verdict + detailed reasons.
 */
export function checkEligibility(input: GrantEligibilityInput): GrantEligibilityResult {
  const reasons: string[] = [];
  let eligible = true;

  // 1. ACRA validation
  if (!input.acraNumber.trim()) {
    reasons.push("ACRA/UEN number is required.");
    eligible = false;
  } else if (!isValidACRA(input.acraNumber)) {
    reasons.push("ACRA/UEN number format is invalid. Expected 8-10 alphanumeric characters.");
    eligible = false;
  }

  // 2. SSIC code — must be non-ICT
  if (!input.ssicCode.trim()) {
    reasons.push("SSIC code is required.");
    eligible = false;
  } else if (!isNonICT(input.ssicCode)) {
    reasons.push("Company SSIC code falls under ICT (Division 61/62/63). GenAIxDL Quick Win is for Non-ICT companies only.");
    eligible = false;
  }

  // 3. Must have at least 1 use case selected
  if (input.useCases.length === 0) {
    reasons.push("At least one GenAIxDL use case category must be selected.");
    eligible = false;
  }

  // 4. Employee count / turnover must be positive
  if (input.employeeCount <= 0) {
    reasons.push("Employee count must be greater than 0.");
    eligible = false;
  }
  if (input.annualTurnover <= 0) {
    reasons.push("Annual turnover must be greater than 0.");
    eligible = false;
  }

  // Determine SME status
  const sme = isSME(input.employeeCount, input.annualTurnover);
  const fundingPercentage = sme ? SME_FUNDING_PCT : NON_SME_FUNDING_PCT;
  const estimatedFunding = Math.round((fundingPercentage / 100) * PROJECT_COST);

  if (eligible) {
    reasons.push(
      sme
        ? `Your company qualifies as an SME — eligible for ${SME_FUNDING_PCT}% co-funding.`
        : `Your company is classified as non-SME — eligible for ${NON_SME_FUNDING_PCT}% co-funding.`
    );
    reasons.push(`Estimated government funding: S$${estimatedFunding.toLocaleString()} (of S$${PROJECT_COST.toLocaleString()} project).`);
  }

  return {
    eligible,
    reasons,
    isSME: sme,
    fundingPercentage,
    maxFunding: PROJECT_COST,
    estimatedFunding,
  };
}
```

**Step 3: Create grant eligibility page**

Create `app/portal/grant/page.tsx`:

```typescript
// app/portal/grant/page.tsx
"use client";

import { useState } from "react";
import { checkEligibility } from "@/lib/grant-eligibility";
import type { GrantEligibilityResult, UseCaseCategory } from "@/lib/types";

const USE_CASES: { key: UseCaseCategory; label: string; description: string }[] = [
  { key: "KM", label: "Knowledge Management", description: "Document search, knowledge bases, internal Q&A" },
  { key: "CE", label: "Customer Engagement", description: "Customer support bots, lead qualification, FAQs" },
  { key: "OA", label: "Operations Automation", description: "Invoice processing, scheduling, compliance checks" },
  { key: "CG", label: "Content Generation", description: "Marketing copy, reports, email drafts, proposals" },
  { key: "CA", label: "Code / Analytics", description: "Data queries, dashboards, anomaly detection, reporting" },
];

export default function GrantEligibility() {
  const [acraNumber, setAcraNumber] = useState("");
  const [ssicCode, setSsicCode] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");
  const [annualTurnover, setAnnualTurnover] = useState("");
  const [useCases, setUseCases] = useState<UseCaseCategory[]>([]);
  const [result, setResult] = useState<GrantEligibilityResult | null>(null);

  const toggleUseCase = (key: UseCaseCategory) => {
    setUseCases((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleCheck = () => {
    setResult(
      checkEligibility({
        acraNumber,
        ssicCode,
        employeeCount: parseInt(employeeCount) || 0,
        annualTurnover: parseInt(annualTurnover) || 0,
        useCases,
      })
    );
  };

  const handleReset = () => {
    setAcraNumber("");
    setSsicCode("");
    setEmployeeCount("");
    setAnnualTurnover("");
    setUseCases([]);
    setResult(null);
  };

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink mb-2">
        GenAIxDL Grant Eligibility
      </h1>
      <p className="text-sm text-ink-light mb-8 max-w-xl">
        Check if your company qualifies for the IMDA GenAIxDL Quick Win grant.
        Up to 50% co-funding (SME) or 30% (non-SME) on a S$20,000 AI deployment project.
      </p>

      {/* Form */}
      <div className="max-w-xl space-y-6">
        {/* ACRA / UEN */}
        <div className="bg-white rounded-2xl border border-ink/5 p-6">
          <label className="block text-xs font-medium text-ink-light mb-2">
            ACRA / UEN Number
          </label>
          <input
            type="text"
            value={acraNumber}
            onChange={(e) => setAcraNumber(e.target.value.toUpperCase())}
            placeholder="e.g. 202012345A"
            maxLength={10}
            className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-cream text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-teal/40 text-sm font-mono"
          />
        </div>

        {/* SSIC Code */}
        <div className="bg-white rounded-2xl border border-ink/5 p-6">
          <label className="block text-xs font-medium text-ink-light mb-2">
            SSIC Code
          </label>
          <input
            type="text"
            value={ssicCode}
            onChange={(e) => setSsicCode(e.target.value)}
            placeholder="e.g. 47190 (must NOT start with 61/62/63)"
            maxLength={6}
            className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-cream text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-teal/40 text-sm font-mono"
          />
          <p className="text-xs text-ink-faint mt-2">
            GenAIxDL Quick Win is for Non-ICT companies. SSIC codes starting with 61, 62, or 63 are not eligible.
          </p>
        </div>

        {/* Company Size */}
        <div className="bg-white rounded-2xl border border-ink/5 p-6 space-y-4">
          <p className="text-xs font-medium text-ink-light">Company Size</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-ink-faint mb-1">Number of Employees</label>
              <input
                type="number"
                value={employeeCount}
                onChange={(e) => setEmployeeCount(e.target.value)}
                placeholder="e.g. 25"
                min={1}
                className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-cream text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-teal/40 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-ink-faint mb-1">Annual Turnover (S$)</label>
              <input
                type="number"
                value={annualTurnover}
                onChange={(e) => setAnnualTurnover(e.target.value)}
                placeholder="e.g. 5000000"
                min={1}
                className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-cream text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-teal/40 text-sm"
              />
            </div>
          </div>
          <p className="text-xs text-ink-faint">
            SME: up to 200 employees OR up to S$100M turnover = 50% co-funding. Otherwise 30%.
          </p>
        </div>

        {/* Use Cases */}
        <div className="bg-white rounded-2xl border border-ink/5 p-6">
          <p className="text-xs font-medium text-ink-light mb-3">
            GenAIxDL Use Case Categories (select all that apply)
          </p>
          <div className="space-y-2">
            {USE_CASES.map(({ key, label, description }) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleUseCase(key)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  useCases.includes(key)
                    ? "border-teal bg-teal/5 ring-1 ring-teal/20"
                    : "border-ink/5 hover:border-ink/10 hover:bg-ink/3"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                    useCases.includes(key)
                      ? "border-teal-deep bg-teal-deep"
                      : "border-ink/20"
                  }`}>
                    {useCases.includes(key) && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-ink">{label}</span>
                    <span className="text-xs text-ink-light ml-2 hidden sm:inline">({key})</span>
                    <p className="text-xs text-ink-faint mt-0.5">{description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleCheck}
            className="bg-teal-deep text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-teal-deep/90 transition-colors"
          >
            Check Eligibility
          </button>
          {result && (
            <button
              onClick={handleReset}
              className="text-sm text-ink-light hover:text-ink transition-colors px-4 py-3"
            >
              Reset
            </button>
          )}
        </div>

        {/* Result */}
        {result && (
          <div className={`rounded-2xl border p-6 ${
            result.eligible
              ? "bg-teal/5 border-teal/20"
              : "bg-coral/5 border-coral/20"
          }`}>
            {/* Verdict */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                result.eligible ? "bg-teal-deep text-white" : "bg-coral-deep text-white"
              }`}>
                {result.eligible ? "\u2713" : "\u2717"}
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-display)] font-bold text-ink">
                  {result.eligible ? "Likely Eligible" : "Not Eligible"}
                </h3>
                <p className="text-xs text-ink-light">
                  {result.eligible
                    ? `${result.isSME ? "SME" : "Non-SME"} \u2014 ${result.fundingPercentage}% co-funding`
                    : "See issues below"}
                </p>
              </div>
            </div>

            {/* Reasons */}
            <ul className="space-y-2 mb-6">
              {result.reasons.map((reason, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink">
                  <span className={`mt-0.5 flex-shrink-0 ${result.eligible ? "text-teal-deep" : "text-coral-deep"}`}>
                    {result.eligible ? "\u2022" : "\u26A0"}
                  </span>
                  {reason}
                </li>
              ))}
            </ul>

            {/* Funding summary (if eligible) */}
            {result.eligible && (
              <div className="bg-white/60 rounded-xl p-4 mb-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-ink-faint mb-1">Project Cost</p>
                    <p className="font-[family-name:var(--font-display)] font-bold text-ink">
                      S${result.maxFunding.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-faint mb-1">Gov Funding</p>
                    <p className="font-[family-name:var(--font-display)] font-bold text-teal-deep">
                      S${result.estimatedFunding.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-faint mb-1">Your Cost</p>
                    <p className="font-[family-name:var(--font-display)] font-bold text-ink">
                      S${(result.maxFunding - result.estimatedFunding).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              {result.eligible ? (
                <>
                  <a
                    href="https://cal.com/crewly/genaixdl-consultation"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-teal-deep text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-teal-deep/90 transition-colors"
                  >
                    Book a consultation
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 11L11 3M11 3H5M11 3v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                  <a
                    href="https://cal.com/crewly/genaixdl-apply"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center text-sm font-medium text-teal-deep border border-teal/30 px-6 py-3 rounded-xl hover:bg-teal/5 transition-colors"
                  >
                    Apply now
                  </a>
                </>
              ) : (
                <a
                  href="https://cal.com/crewly/genaixdl-consultation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 text-sm font-medium text-ink border border-ink/10 px-6 py-3 rounded-xl hover:bg-ink/5 transition-colors"
                >
                  Still have questions? Book a call
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 11L11 3M11 3H5M11 3v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 4: Add "Grant" nav link to portal layout**

In `app/portal/layout.tsx`, update the `navLinks` array:

```typescript
const navLinks = [
  { href: "/portal", label: "Dashboard" },
  { href: "/portal/agents", label: "My Agents" },
  { href: "/portal/deploy", label: "Deploy" },
  { href: "/portal/grant", label: "Grant" },
  { href: "/portal/roi", label: "ROI" },
];
```

**Step 5: Verify build**

```bash
cd /home/jons-openclaw/crewly-landing && npm run build
```

**Step 6: Commit**

```bash
git add lib/grant-eligibility.ts lib/types.ts app/portal/grant/ app/portal/layout.tsx && git commit -m "feat: GenAIxDL grant eligibility checker — client-side calculator with SME/non-SME funding"
```

---

### Task 3: ROI dashboard (`/portal/roi`)

**Files:**
- Create: `app/portal/roi/page.tsx`

**Why:** DME customers need ROI evidence for IMDA claims. This page shows per-agent metrics (queries handled, uptime, hours saved) and allows before/after comparison with manual baselines. Fetches data from Fleet Control metrics endpoint via the proxy (Task 1).

**Step 1: Create ROI dashboard page**

Create `app/portal/roi/page.tsx`:

```typescript
// app/portal/roi/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import type { AppInstance, AgentROI } from "@/lib/types";

interface AgentWithROI {
  agent: AppInstance;
  roi: AgentROI | null;
}

interface Baseline {
  hoursPerWeek: string;
  costPerHour: string;
}

export default function ROIDashboard() {
  const [agents, setAgents] = useState<AgentWithROI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [baseline, setBaseline] = useState<Baseline>({ hoursPerWeek: "", costPerHour: "" });
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const orgs = await api.listOrgs();
        const allAgents: AppInstance[] = [];
        for (const org of orgs) {
          allAgents.push(...await api.listDeployments(org.slug));
        }

        // Fetch ROI in parallel
        const results = await Promise.allSettled(
          allAgents
            .filter((a) => a.status === "active")
            .map(async (agent) => {
              const roi = await api.getROI(agent.id).catch(() => null);
              return { agent, roi } as AgentWithROI;
            })
        );

        setAgents(
          results
            .filter((r): r is PromiseFulfilledResult<AgentWithROI> => r.status === "fulfilled")
            .map((r) => r.value)
        );
      } catch {
        setError("Failed to load ROI data. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Aggregate totals
  const totals = agents.reduce(
    (acc, { roi }) => {
      if (!roi) return acc;
      return {
        queries: acc.queries + roi.queries_handled,
        hoursSaved: acc.hoursSaved + roi.estimated_hours_saved,
        costAvoided: acc.costAvoided + roi.cost_avoided,
        uptimeSum: acc.uptimeSum + roi.uptime_pct,
        count: acc.count + 1,
      };
    },
    { queries: 0, hoursSaved: 0, costAvoided: 0, uptimeSum: 0, count: 0 }
  );

  const avgUptime = totals.count > 0 ? (totals.uptimeSum / totals.count).toFixed(1) : "—";

  // Before/after comparison
  const baselineHours = parseFloat(baseline.hoursPerWeek) || 0;
  const baselineCost = parseFloat(baseline.costPerHour) || 0;
  const monthlyBaselineCost = baselineHours * baselineCost * 4.33; // weeks per month
  const monthlySavings = totals.hoursSaved > 0 ? (totals.hoursSaved * baselineCost) : 0;

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div ref={printRef}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink mb-1">
            ROI Dashboard
          </h1>
          <p className="text-sm text-ink-light">
            Track agent performance metrics for IMDA GenAIxDL claim documentation.
          </p>
        </div>
        <button
          onClick={handleExportPDF}
          className="text-sm border border-ink/10 text-ink px-4 py-2 rounded-xl hover:bg-ink/5 transition-colors print:hidden"
        >
          Export as PDF
        </button>
      </div>

      {error && (
        <div className="bg-coral/10 text-coral-deep text-sm px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid sm:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-ink/5 animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <>
          {/* Aggregate Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <SummaryCard label="Queries Handled" value={totals.queries.toLocaleString()} accent="teal" />
            <SummaryCard label="Hours Saved" value={totals.hoursSaved.toFixed(1)} accent="teal" />
            <SummaryCard label="Avg Uptime" value={`${avgUptime}%`} accent="teal" />
            <SummaryCard label="Cost Avoided" value={`S$${totals.costAvoided.toLocaleString()}`} accent="coral" />
          </div>

          {/* Per-Agent Cards */}
          <h2 className="font-[family-name:var(--font-display)] font-bold text-ink mb-4">
            Per-Agent Breakdown
          </h2>

          {agents.length === 0 ? (
            <div className="bg-white rounded-2xl border border-ink/5 p-12 text-center">
              <p className="text-ink-light text-sm">
                No active agents with ROI data. Deploy an agent and check back after it handles some queries.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {agents.map(({ agent, roi }) => (
                <div key={agent.id} className="bg-white rounded-2xl border border-ink/5 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-2.5 h-2.5 rounded-full ${roi ? "bg-teal" : "bg-ink-faint"}`} />
                    <h3 className="font-[family-name:var(--font-display)] font-bold text-ink text-sm">
                      {agent.name}
                    </h3>
                  </div>

                  {roi ? (
                    <div className="space-y-3">
                      <MetricRow label="Queries Handled" value={roi.queries_handled.toLocaleString()} />
                      <MetricRow label="Avg Response" value={`${roi.avg_response_ms}ms`} />
                      <MetricRow label="Uptime" value={`${roi.uptime_pct.toFixed(1)}%`} />
                      <MetricRow label="Hours Saved" value={roi.estimated_hours_saved.toFixed(1)} />
                      <MetricRow label="Cost Avoided" value={`S$${roi.cost_avoided.toLocaleString()}`} />
                    </div>
                  ) : (
                    <p className="text-xs text-ink-faint">No ROI data available yet.</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Before/After Comparison */}
          <h2 className="font-[family-name:var(--font-display)] font-bold text-ink mb-4">
            Before / After Comparison
          </h2>
          <div className="bg-white rounded-2xl border border-ink/5 p-6 mb-4">
            <p className="text-xs text-ink-light mb-4">
              Enter your manual baseline to calculate the AI-assisted improvement.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs text-ink-faint mb-1">
                  Manual hours per week (before AI)
                </label>
                <input
                  type="number"
                  value={baseline.hoursPerWeek}
                  onChange={(e) => setBaseline((b) => ({ ...b, hoursPerWeek: e.target.value }))}
                  placeholder="e.g. 40"
                  min={0}
                  className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-cream text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-teal/40 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-ink-faint mb-1">
                  Cost per hour (S$)
                </label>
                <input
                  type="number"
                  value={baseline.costPerHour}
                  onChange={(e) => setBaseline((b) => ({ ...b, costPerHour: e.target.value }))}
                  placeholder="e.g. 25"
                  min={0}
                  className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-cream text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-teal/40 text-sm"
                />
              </div>
            </div>

            {baselineHours > 0 && baselineCost > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-ink/5">
                      <th className="text-left py-3 text-xs font-medium text-ink-light">Metric</th>
                      <th className="text-right py-3 text-xs font-medium text-ink-light">Before (Manual)</th>
                      <th className="text-right py-3 text-xs font-medium text-teal-deep">After (AI-Assisted)</th>
                      <th className="text-right py-3 text-xs font-medium text-ink-light">Improvement</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-ink/5">
                      <td className="py-3 text-ink">Monthly Hours</td>
                      <td className="py-3 text-right text-ink">{(baselineHours * 4.33).toFixed(0)}h</td>
                      <td className="py-3 text-right text-teal-deep font-medium">
                        {Math.max(0, (baselineHours * 4.33) - totals.hoursSaved).toFixed(0)}h
                      </td>
                      <td className="py-3 text-right text-teal-deep">
                        {totals.hoursSaved > 0 ? `-${totals.hoursSaved.toFixed(0)}h` : "—"}
                      </td>
                    </tr>
                    <tr className="border-b border-ink/5">
                      <td className="py-3 text-ink">Monthly Cost</td>
                      <td className="py-3 text-right text-ink">S${monthlyBaselineCost.toFixed(0)}</td>
                      <td className="py-3 text-right text-teal-deep font-medium">
                        S${Math.max(0, monthlyBaselineCost - monthlySavings).toFixed(0)}
                      </td>
                      <td className="py-3 text-right text-teal-deep">
                        {monthlySavings > 0 ? `-S$${monthlySavings.toFixed(0)}` : "—"}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 text-ink font-medium">Queries / Month</td>
                      <td className="py-3 text-right text-ink-faint">Manual</td>
                      <td className="py-3 text-right text-teal-deep font-medium">{totals.queries.toLocaleString()}</td>
                      <td className="py-3 text-right text-teal-deep">Automated</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Print-friendly footer */}
          <div className="hidden print:block text-xs text-ink-faint text-center mt-8 pt-4 border-t border-ink/10">
            Generated by Crewly ROI Dashboard &mdash; crewly.chat/portal/roi &mdash; {new Date().toLocaleDateString()}
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: string; accent: "teal" | "coral" }) {
  const colors = accent === "teal" ? "bg-teal/10 text-teal-deep" : "bg-coral/10 text-coral-deep";
  return (
    <div className="bg-white rounded-2xl p-6 border border-ink/5">
      <p className="text-xs text-ink-light mb-1">{label}</p>
      <p className={`font-[family-name:var(--font-display)] text-2xl font-bold ${colors} inline-block px-2 py-0.5 rounded-lg`}>
        {value}
      </p>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-ink-light">{label}</span>
      <span className="text-sm font-medium text-ink">{value}</span>
    </div>
  );
}
```

**Step 2: Add print styles to globals.css**

Append to `app/globals.css`:

```css
/* Print styles for ROI PDF export */
@media print {
  nav, .print\\:hidden {
    display: none !important;
  }
  body {
    background: white;
  }
  .grain::before {
    display: none;
  }
}
```

**Step 3: Verify build**

```bash
cd /home/jons-openclaw/crewly-landing && npm run build
```

**Step 4: Commit**

```bash
git add app/portal/roi/ app/globals.css && git commit -m "feat: ROI dashboard — per-agent metrics, before/after comparison, PDF export via print"
```

---

### Task 4: Public grant info page (`/grant-info`)

**Files:**
- Create: `app/grant-info/page.tsx`

**Why:** A public (no auth) page explaining the GenAIxDL grant to drive traffic from marketing. Uses landing page styling (cream bg, teal/coral accents, Bricolage Grotesque headings) — NOT the portal layout.

**Step 1: Create the page**

Create `app/grant-info/page.tsx`:

```typescript
// app/grant-info/page.tsx
import Link from "next/link";

export const metadata = {
  title: "GenAIxDL Quick Win Grant — Crewly",
  description:
    "Get up to 50% co-funding on AI deployment for your business through IMDA's GenAIxDL Quick Win grant. Crewly covers all 5 use case categories.",
};

const USE_CASES = [
  {
    code: "KM",
    name: "Knowledge Management",
    icon: "\uD83D\uDCDA",
    description: "AI-powered internal knowledge search, document Q&A, and smart knowledge bases for your team.",
  },
  {
    code: "CE",
    name: "Customer Engagement",
    icon: "\uD83D\uDCAC",
    description: "Intelligent customer support bots, lead qualification, and 24/7 FAQ automation across WhatsApp, Telegram, and more.",
  },
  {
    code: "OA",
    name: "Operations Automation",
    icon: "\u2699\uFE0F",
    description: "Automate invoice processing, scheduling, compliance checks, and operational workflows.",
  },
  {
    code: "CG",
    name: "Content Generation",
    icon: "\u270D\uFE0F",
    description: "Generate marketing copy, reports, email drafts, and proposals with your brand voice.",
  },
  {
    code: "CA",
    name: "Code & Analytics",
    icon: "\uD83D\uDCCA",
    description: "Data queries, dashboard generation, anomaly detection, and automated reporting.",
  },
];

const ELIGIBILITY_CRITERIA = [
  "Registered in Singapore (valid ACRA/UEN)",
  "Non-ICT company (SSIC code not starting with 61, 62, or 63)",
  "At least 30% local shareholding",
  "Have not previously claimed GenAIxDL for the same use case",
];

export default function GrantInfoPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Nav bar (minimal, not the portal nav) */}
      <nav className="sticky top-0 z-50 bg-cream/80 backdrop-blur-xl border-b border-ink/5">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-teal group-hover:scale-110 transition-transform" />
              <div className="w-2 h-2 rounded-full bg-coral group-hover:scale-110 transition-transform delay-75" />
              <div className="w-2 h-2 rounded-full bg-teal-deep group-hover:scale-110 transition-transform delay-150" />
            </div>
            <span className="font-[family-name:var(--font-display)] text-lg font-bold text-ink">
              crewly
            </span>
          </Link>
          <Link
            href="/portal/grant"
            className="bg-teal-deep text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-teal-deep/90 transition-colors"
          >
            Check Eligibility
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-teal/10 text-teal-deep text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 rounded-full bg-teal" />
          IMDA GenAIxDL Quick Win
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-bold text-ink leading-tight mb-4">
          Get up to <span className="text-teal-deep">50% co-funding</span> on AI
          <br className="hidden sm:block" /> for your business
        </h1>
        <p className="text-lg text-ink-light max-w-2xl mx-auto mb-8">
          The GenAIxDL Quick Win grant funds non-ICT Singapore businesses to deploy
          AI solutions. Crewly is a pre-approved vendor covering all 5 use case categories.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/portal/grant"
            className="inline-flex items-center gap-2 bg-ink text-cream text-sm font-semibold px-6 py-3 rounded-full hover:bg-ink/90 transition-colors"
          >
            Check your eligibility
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 7h12m0 0L8.5 2.5M13 7l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <a
            href="https://cal.com/crewly/genaixdl-consultation"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-ink-light hover:text-ink transition-colors"
          >
            Book a free call &rarr;
          </a>
        </div>
      </section>

      {/* What is GenAIxDL */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="bg-white rounded-3xl border border-ink/5 p-8 sm:p-12">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink mb-4">
            What is GenAIxDL Quick Win?
          </h2>
          <p className="text-ink-light leading-relaxed mb-6">
            GenAIxDL (Generative AI x Digital Leaders) Quick Win is an IMDA initiative to accelerate
            AI adoption among Singapore businesses. Through pre-approved vendors like Crewly,
            companies can deploy production-grade AI solutions with government co-funding &mdash;
            reducing the barrier to entry for AI-powered automation.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-teal-deep mb-1">50%</p>
              <p className="text-sm text-ink-light">Co-funding for SMEs</p>
            </div>
            <div className="text-center p-4">
              <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-coral-deep mb-1">30%</p>
              <p className="text-sm text-ink-light">Co-funding for non-SMEs</p>
            </div>
            <div className="text-center p-4">
              <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-ink mb-1">S$20K</p>
              <p className="text-sm text-ink-light">Max project cost per DME</p>
            </div>
          </div>
        </div>
      </section>

      {/* Eligibility Criteria */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink mb-6">
          Eligibility Criteria
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {ELIGIBILITY_CRITERIA.map((criterion, i) => (
            <div key={i} className="flex items-start gap-3 bg-white rounded-2xl border border-ink/5 p-5">
              <div className="w-6 h-6 rounded-full bg-teal/10 text-teal-deep flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">
                {i + 1}
              </div>
              <p className="text-sm text-ink leading-relaxed">{criterion}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 bg-cream-warm rounded-2xl p-5 border border-ink/5">
          <p className="text-sm text-ink-light">
            <strong className="text-ink">SME definition:</strong> up to 200 employees OR up to S$100M annual turnover.
            SMEs receive 50% co-funding; non-SMEs receive 30%.
          </p>
        </div>
      </section>

      {/* Use Cases */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink mb-2">
          5 Use Case Categories
        </h2>
        <p className="text-sm text-ink-light mb-6">
          Crewly covers all 5 GenAIxDL use case categories &mdash; choose one or combine multiple.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {USE_CASES.map((uc) => (
            <div key={uc.code} className="bg-white rounded-2xl border border-ink/5 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{uc.icon}</span>
                <div>
                  <h3 className="font-[family-name:var(--font-display)] font-bold text-ink text-sm">
                    {uc.name}
                  </h3>
                  <span className="text-[10px] text-ink-faint">{uc.code}</span>
                </div>
              </div>
              <p className="text-xs text-ink-light leading-relaxed">{uc.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink mb-6">
          How It Works
        </h2>
        <div className="bg-white rounded-3xl border border-ink/5 p-8 sm:p-12">
          <div className="space-y-6">
            {[
              { step: 1, title: "Check eligibility", desc: "Use our free checker to confirm your company qualifies for GenAIxDL Quick Win." },
              { step: 2, title: "Book a consultation", desc: "Our team reviews your needs and designs an AI solution across 1-5 use case categories." },
              { step: 3, title: "We deploy your AI crew", desc: "Crewly deploys production-grade AI agents to your existing channels (WhatsApp, Slack, Telegram, web)." },
              { step: 4, title: "Claim your grant", desc: "We provide ROI documentation and deployment evidence for your IMDA claim. You only pay your co-funding share." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-teal-deep text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  {step}
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-display)] font-bold text-ink mb-1">{title}</h3>
                  <p className="text-sm text-ink-light">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-ink mb-4">
          Ready to get started?
        </h2>
        <p className="text-ink-light mb-8 max-w-lg mx-auto">
          Check your eligibility in 2 minutes, or book a free consultation with our team.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/portal/grant"
            className="inline-flex items-center gap-2 bg-ink text-cream text-sm font-semibold px-6 py-3 rounded-full hover:bg-ink/90 transition-colors"
          >
            Check eligibility
          </Link>
          <a
            href="https://cal.com/crewly/genaixdl-consultation"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink border border-ink/10 px-6 py-3 rounded-full hover:bg-ink/5 transition-colors"
          >
            Book a free call
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 11L11 3M11 3H5M11 3v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-8 border-t border-ink/5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-teal" />
              <div className="w-1.5 h-1.5 rounded-full bg-coral" />
              <div className="w-1.5 h-1.5 rounded-full bg-teal-deep" />
            </div>
            <span className="font-[family-name:var(--font-display)] text-sm font-bold text-ink">crewly</span>
          </div>
          <p className="text-xs text-ink-faint">&copy; {new Date().getFullYear()} Crewly by MarinaChain. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
```

**Note:** This is a React Server Component (no `"use client"` directive). It has no interactive state, so it can be statically rendered for better SEO and faster load. The `metadata` export provides page-level SEO. The "Check eligibility" CTA links to `/portal/grant` which will redirect to `/login` if the user isn't authenticated (handled by the portal layout's auth guard).

**Step 2: Verify build**

```bash
cd /home/jons-openclaw/crewly-landing && npm run build
```

**Step 3: Commit**

```bash
git add app/grant-info/ && git commit -m "feat: public GenAIxDL grant info page — eligibility criteria, use cases, CTAs"
```

---

### Task 5: Portal mobile responsive nav

**Files:**
- Modify: `app/portal/layout.tsx`

**Why:** The portal nav currently shows all links in a horizontal row that overflows on mobile. This task adds a hamburger menu at `max-sm:` (640px breakpoint) following the same pattern as the landing page's `Navigation.tsx` (hamburger with animated lines + slide-down menu).

**Step 1: Replace app/portal/layout.tsx**

Replace the entire file:

```typescript
// app/portal/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

const navLinks = [
  { href: "/portal", label: "Dashboard" },
  { href: "/portal/agents", label: "My Agents" },
  { href: "/portal/deploy", label: "Deploy" },
  { href: "/portal/grant", label: "Grant" },
  { href: "/portal/roi", label: "ROI" },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { session, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !session) router.replace("/login");
  }, [loading, session, router]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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

            {/* Desktop links */}
            <div className="hidden sm:flex gap-1">
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

          {/* Right: user + sign out (desktop) + hamburger (mobile) */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-ink-light hidden sm:inline">
              {session.user.email}
            </span>
            <button
              onClick={async () => { await signOut(); router.push("/login"); }}
              className="text-xs text-ink-faint hover:text-ink-light transition-colors hidden sm:inline"
            >
              Sign out
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="sm:hidden p-2 -mr-2"
              aria-label="Toggle menu"
            >
              <div className="w-5 flex flex-col gap-1">
                <span
                  className={`block h-0.5 bg-ink transition-all duration-200 ${
                    mobileOpen ? "rotate-45 translate-y-1.5" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 bg-ink transition-all duration-200 ${
                    mobileOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 bg-ink transition-all duration-200 ${
                    mobileOpen ? "-rotate-45 -translate-y-1.5" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`sm:hidden overflow-hidden transition-all duration-200 bg-white/95 backdrop-blur-xl border-t border-ink/5 ${
            mobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-6 py-4 flex flex-col gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === href
                    ? "bg-teal/10 text-teal-deep"
                    : "text-ink-light hover:text-ink hover:bg-ink/5"
                }`}
              >
                {label}
              </Link>
            ))}

            <div className="border-t border-ink/5 mt-2 pt-3 flex items-center justify-between">
              <span className="text-xs text-ink-light truncate max-w-[200px]">
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

**Key changes from the original layout:**
1. `navLinks` now includes "Grant" and "ROI" (from Task 2)
2. Desktop links wrapped in `hidden sm:flex` (hidden below 640px)
3. Hamburger button with `sm:hidden` (visible only below 640px)
4. Mobile slide-down menu with `max-h` animation (no framer-motion needed — keep bundle small)
5. Mobile menu closes on route change via `useEffect` on `pathname`
6. Sign out button + email shown in mobile menu footer

**Step 2: Verify build**

```bash
cd /home/jons-openclaw/crewly-landing && npm run build
```

**Step 3: Commit**

```bash
git add app/portal/layout.tsx && git commit -m "feat: portal mobile responsive nav — hamburger menu at sm breakpoint"
```

---

## Verification Checklist

After all 5 tasks are complete, run these checks:

```bash
cd /home/jons-openclaw/crewly-landing

# 1. Full build
npm run build

# 2. Start dev server
npm run dev &
sleep 3

# 3. Check proxy works (should return 401/403, NOT 404)
curl -s -o /dev/null -w "Proxy: %{http_code}\n" http://localhost:3000/api/fleet/v1/orgs

# 4. Check grant-info page loads (public, should return 200)
curl -s -o /dev/null -w "Grant info: %{http_code}\n" http://localhost:3000/grant-info

# 5. Check portal pages compile (should return 200 — but redirect to /login without auth)
curl -s -o /dev/null -w "Portal grant: %{http_code}\n" -L http://localhost:3000/portal/grant
curl -s -o /dev/null -w "Portal ROI: %{http_code}\n" -L http://localhost:3000/portal/roi

# 6. Kill dev server
kill %1
```

**Expected results:**
- Proxy: 401 or 403 (proves proxy forwards to Fleet Control)
- Grant info: 200 (public page renders)
- Portal pages: 200 (client-side pages load, auth redirect happens in JS)

## File Summary

| Task | Files Created | Files Modified |
|------|--------------|----------------|
| 1. CORS proxy | `app/api/fleet/[...path]/route.ts` | `lib/api.ts`, `.env.local` |
| 2. Grant checker | `app/portal/grant/page.tsx`, `lib/grant-eligibility.ts` | `lib/types.ts`, `app/portal/layout.tsx` |
| 3. ROI dashboard | `app/portal/roi/page.tsx` | `app/globals.css` |
| 4. Grant info | `app/grant-info/page.tsx` | (none) |
| 5. Mobile nav | (none) | `app/portal/layout.tsx` |

**Total new files:** 5
**Total modified files:** 4 (some modified by multiple tasks)

**Note on Task ordering:** Task 5 modifies `app/portal/layout.tsx` which Task 2 also modifies (adding nav links). Since Task 5's code is the complete final version of the layout (including the nav links from Task 2), the implementer should either:
- Implement Task 2 first (just the nav link addition), then Task 5 overwrites with the full mobile-responsive version, OR
- Implement Task 5 directly since its code already includes the "Grant" and "ROI" nav links

The recommended approach is to implement Tasks 1 → 2 → 5 → 3 → 4, where Task 5 replaces the layout fully (it already includes Task 2's nav link changes).
