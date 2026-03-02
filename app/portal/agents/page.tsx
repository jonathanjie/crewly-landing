// app/portal/agents/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, fetchAllDeployments } from "@/lib/api";
import type { AppInstance, InstanceHealth } from "@/lib/types";
import { statusDotColor } from "@/lib/types";

export default function MyAgents() {
  const [agents, setAgents] = useState<AppInstance[]>([]);
  const [healthMap, setHealthMap] = useState<Record<string, InstanceHealth | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { agents: all } = await fetchAllDeployments();
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
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load agents");
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
      ) : error ? (
        <div className="bg-coral/10 text-coral-deep text-sm px-4 py-3 rounded-xl mb-4">
          {error}
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
                  <div className={`w-2.5 h-2.5 rounded-full mt-1 ${statusDotColor(agent.status, health?.status)}`} />
                </div>

                <p className="text-xs text-ink-light capitalize mb-4">{agent.status}</p>

                {health && health.status === "online" && health.minutes_since_heartbeat != null && (
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
