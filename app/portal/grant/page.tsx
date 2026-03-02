// app/portal/grant/page.tsx
"use client";

import { useState } from "react";

const USE_CASES = [
  { id: "km", label: "Knowledge Management", desc: "Document search, FAQ bots, internal wikis" },
  { id: "ce", label: "Customer Engagement", desc: "Chatbots, lead qualification, support agents" },
  { id: "oa", label: "Operations Automation", desc: "Workflow automation, scheduling, logistics" },
  { id: "cg", label: "Content Generation", desc: "Reports, marketing copy, translations" },
  { id: "ca", label: "Compliance & Analytics", desc: "Regulatory checks, data analysis, dashboards" },
];

interface FormData {
  companyName: string;
  acraUen: string;
  ssicCode: string;
  employees: string;
  turnover: string;
  useCases: string[];
}

interface Result {
  eligible: boolean;
  fundingRate: number;
  reasons: string[];
  estimatedFunding: number | null;
}

function checkEligibility(form: FormData): Result {
  const reasons: string[] = [];
  let eligible = true;

  // SSIC code check — non-ICT required (not starting with 61, 62, or 63)
  const ssicPrefix = form.ssicCode.slice(0, 2);
  const isICT = ["61", "62", "63"].includes(ssicPrefix);
  if (isICT) {
    eligible = false;
    reasons.push("SSIC code falls under ICT sector (61/62/63) — GenAIxDL targets non-ICT industries.");
  }

  if (!form.ssicCode || form.ssicCode.length < 2) {
    eligible = false;
    reasons.push("Valid SSIC code required.");
  }

  // Employee and turnover check — SME = <=200 employees OR <=S$100M turnover
  const employees = parseInt(form.employees, 10);
  const turnover = parseFloat(form.turnover);

  if (isNaN(employees) || employees <= 0) {
    eligible = false;
    reasons.push("Number of employees must be a positive number.");
  }

  if (isNaN(turnover) || turnover <= 0) {
    eligible = false;
    reasons.push("Annual turnover must be a positive number.");
  }

  if (!form.companyName.trim()) {
    eligible = false;
    reasons.push("Company name is required.");
  }

  if (!form.acraUen.trim()) {
    eligible = false;
    reasons.push("ACRA/UEN number is required.");
  }

  if (form.useCases.length === 0) {
    eligible = false;
    reasons.push("At least one use case must be selected.");
  }

  // Determine funding rate
  const isSME = (employees > 0 && employees <= 200) || (turnover > 0 && turnover <= 100);
  const fundingRate = isSME ? 50 : 30;

  if (!isICT && eligible) {
    if (isSME) {
      reasons.push("Qualifies as SME (<=200 employees or <=S$100M turnover) — 50% funding.");
    } else {
      reasons.push("Non-SME enterprise — eligible for 30% funding.");
    }
    reasons.push(`${form.useCases.length} use case(s) selected across GenAIxDL categories.`);
  }

  // Estimate funding (assume S$30K per use case as baseline)
  const baseCost = form.useCases.length * 30000;
  const estimatedFunding = eligible ? Math.round(baseCost * (fundingRate / 100)) : null;

  return { eligible, fundingRate, reasons, estimatedFunding };
}

export default function GrantEligibility() {
  const [form, setForm] = useState<FormData>({
    companyName: "",
    acraUen: "",
    ssicCode: "",
    employees: "",
    turnover: "",
    useCases: [],
  });
  const [result, setResult] = useState<Result | null>(null);

  const toggleUseCase = (id: string) => {
    setForm((prev) => ({
      ...prev,
      useCases: prev.useCases.includes(id)
        ? prev.useCases.filter((u) => u !== id)
        : [...prev.useCases, id],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(checkEligibility(form));
  };

  const handleReset = () => {
    setForm({ companyName: "", acraUen: "", ssicCode: "", employees: "", turnover: "", useCases: [] });
    setResult(null);
  };

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink mb-2">
        Grant Eligibility Checker
      </h1>
      <p className="text-sm text-ink-light mb-8">
        Check if your company qualifies for IMDA&apos;s GenAIxDL grant — up to 50% funding for AI adoption.
      </p>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
          {/* Company Info */}
          <div className="bg-white rounded-2xl border border-ink/5 p-6 space-y-4">
            <h2 className="font-[family-name:var(--font-display)] font-bold text-ink text-sm mb-2">
              Company Information
            </h2>

            <div>
              <label className="block text-xs text-ink-light mb-1.5">Company Name</label>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                placeholder="Acme Pte Ltd"
                className="w-full px-4 py-2.5 rounded-xl border border-ink/10 bg-cream text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-teal/40 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-ink-light mb-1.5">ACRA/UEN Number</label>
              <input
                type="text"
                value={form.acraUen}
                onChange={(e) => setForm({ ...form, acraUen: e.target.value })}
                placeholder="202012345A"
                className="w-full px-4 py-2.5 rounded-xl border border-ink/10 bg-cream text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-teal/40 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-ink-light mb-1.5">
                SSIC Code
                <span className="text-ink-faint ml-1">(must be non-ICT — not 61/62/63)</span>
              </label>
              <input
                type="text"
                value={form.ssicCode}
                onChange={(e) => setForm({ ...form, ssicCode: e.target.value.replace(/\D/g, "").slice(0, 5) })}
                placeholder="50401"
                maxLength={5}
                className="w-full px-4 py-2.5 rounded-xl border border-ink/10 bg-cream text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-teal/40 text-sm font-mono"
              />
            </div>
          </div>

          {/* Size Info */}
          <div className="bg-white rounded-2xl border border-ink/5 p-6 space-y-4">
            <h2 className="font-[family-name:var(--font-display)] font-bold text-ink text-sm mb-2">
              Company Size
            </h2>

            <div>
              <label className="block text-xs text-ink-light mb-1.5">Number of Employees</label>
              <input
                type="number"
                min="1"
                value={form.employees}
                onChange={(e) => setForm({ ...form, employees: e.target.value })}
                placeholder="50"
                className="w-full px-4 py-2.5 rounded-xl border border-ink/10 bg-cream text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-teal/40 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-ink-light mb-1.5">
                Annual Turnover
                <span className="text-ink-faint ml-1">(S$ millions)</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={form.turnover}
                onChange={(e) => setForm({ ...form, turnover: e.target.value })}
                placeholder="10"
                className="w-full px-4 py-2.5 rounded-xl border border-ink/10 bg-cream text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-teal/40 text-sm"
              />
            </div>

            <p className="text-[10px] text-ink-faint">
              SME: up to 200 employees OR up to S$100M turnover = 50% funding. Non-SME = 30%.
            </p>
          </div>

          {/* Use Cases */}
          <div className="bg-white rounded-2xl border border-ink/5 p-6">
            <h2 className="font-[family-name:var(--font-display)] font-bold text-ink text-sm mb-4">
              AI Use Cases
            </h2>
            <div className="space-y-2">
              {USE_CASES.map((uc) => (
                <button
                  key={uc.id}
                  type="button"
                  onClick={() => toggleUseCase(uc.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    form.useCases.includes(uc.id)
                      ? "border-teal bg-teal/5 ring-1 ring-teal/20"
                      : "border-ink/5 hover:border-ink/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                      form.useCases.includes(uc.id)
                        ? "border-teal-deep bg-teal-deep"
                        : "border-ink/20"
                    }`}>
                      {form.useCases.includes(uc.id) && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">{uc.label}</p>
                      <p className="text-xs text-ink-faint">{uc.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-teal-deep text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-teal-deep/90 transition-colors"
            >
              Check Eligibility
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="text-sm text-ink-light hover:text-ink transition-colors px-4 py-2.5"
            >
              Reset
            </button>
          </div>
        </form>

        {/* Result Card */}
        <div className="lg:col-span-2">
          {result ? (
            <div className={`rounded-2xl border-2 p-6 sticky top-20 ${
              result.eligible
                ? "border-teal bg-teal/5"
                : "border-coral bg-coral/5"
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg ${
                  result.eligible ? "bg-teal-deep" : "bg-coral-deep"
                }`}>
                  {result.eligible ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className={`font-[family-name:var(--font-display)] font-bold ${
                    result.eligible ? "text-teal-deep" : "text-coral-deep"
                  }`}>
                    {result.eligible ? "Likely Eligible" : "Not Eligible"}
                  </h3>
                  {result.eligible && (
                    <p className="text-xs text-ink-light">
                      {result.fundingRate}% funding rate
                    </p>
                  )}
                </div>
              </div>

              {result.estimatedFunding !== null && (
                <div className="bg-white rounded-xl p-4 mb-4">
                  <p className="text-xs text-ink-light mb-1">Estimated Funding</p>
                  <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-teal-deep">
                    S${result.estimatedFunding.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-ink-faint mt-1">
                    Based on ~S$30K per use case at {result.fundingRate}% co-funding
                  </p>
                </div>
              )}

              <div className="space-y-2">
                {result.reasons.map((r, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className={`text-xs mt-0.5 ${result.eligible ? "text-teal-deep" : "text-coral-deep"}`}>
                      {result.eligible ? "+" : "-"}
                    </span>
                    <p className="text-xs text-ink-light">{r}</p>
                  </div>
                ))}
              </div>

              {result.eligible && (
                <a
                  href="https://www.imda.gov.sg/how-we-can-help/smes-go-digital"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block text-center bg-teal-deep text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-teal-deep/90 transition-colors"
                >
                  Apply on IMDA
                </a>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-ink/5 bg-white p-6 sticky top-20">
              <div className="text-center text-ink-faint">
                <div className="text-3xl mb-3">?</div>
                <p className="text-sm">Fill in the form and click &quot;Check Eligibility&quot; to see your result.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
