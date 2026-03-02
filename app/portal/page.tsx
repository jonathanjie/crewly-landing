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
