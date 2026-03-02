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
        org_slug: orgs[0].slug,
        template_slug: selectedTemplate.slug,
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
