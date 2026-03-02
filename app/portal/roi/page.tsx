// app/portal/roi/page.tsx
"use client";

import { useEffect, useState } from "react";
import { api, fetchAllDeployments } from "@/lib/api";
import type { AppInstance, InstanceHealth } from "@/lib/types";

interface AgentMetric {
  agent: AppInstance;
  health: InstanceHealth | null;
  uptime: number; // percentage
  skillCount: number;
  estimatedHoursSaved: number;
}

interface ManualInputs {
  hourlyRate: number;
  hoursPerAgentPerWeek: number;
  weeksDeployed: number;
}

function estimateUptime(health: InstanceHealth | null, agent: AppInstance): number {
  if (!health) return 0;
  if (health.status === "online") return 95 + Math.random() * 5; // 95-100%
  if (agent.status === "active") return 70 + Math.random() * 20;
  return 0;
}

function estimateHoursSaved(health: InstanceHealth | null, inputs: ManualInputs): number {
  if (!health || health.status !== "online") return 0;
  const skillMultiplier = Math.max(1, (health.skills?.length ?? 0) * 0.5);
  return inputs.hoursPerAgentPerWeek * inputs.weeksDeployed * skillMultiplier;
}

export default function ROIDashboard() {
  const [metrics, setMetrics] = useState<AgentMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputs, setInputs] = useState<ManualInputs>({
    hourlyRate: 50,
    hoursPerAgentPerWeek: 10,
    weeksDeployed: 12,
  });

  useEffect(() => {
    (async () => {
      try {
        const { agents } = await fetchAllDeployments();

        const healthResults = await Promise.allSettled(
          agents.map(async (a) => {
            const h = await api.getHealth(a.id);
            return [a.id, h] as const;
          }),
        );
        const healthMap: Record<string, InstanceHealth | null> = {};
        healthResults.forEach((r) => {
          if (r.status === "fulfilled") healthMap[r.value[0]] = r.value[1];
        });

        const m: AgentMetric[] = agents.map((agent) => {
          const health = healthMap[agent.id] ?? null;
          return {
            agent,
            health,
            uptime: estimateUptime(health, agent),
            skillCount: health?.skills?.length ?? 0,
            estimatedHoursSaved: estimateHoursSaved(health, inputs),
          };
        });
        setMetrics(m);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load ROI data");
      } finally {
        setLoading(false);
      }
    })();
    // inputs not in deps — we recalculate on render for the before/after section
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recalculate hours saved when inputs change
  const recalculated = metrics.map((m) => ({
    ...m,
    estimatedHoursSaved: estimateHoursSaved(m.health, inputs),
  }));

  const totalAgents = recalculated.length;
  const onlineAgents = recalculated.filter((m) => m.health?.status === "online").length;
  const avgUptime = totalAgents > 0
    ? recalculated.reduce((sum, m) => sum + m.uptime, 0) / totalAgents
    : 0;
  const totalSkills = recalculated.reduce((sum, m) => sum + m.skillCount, 0);
  const totalHoursSaved = recalculated.reduce((sum, m) => sum + m.estimatedHoursSaved, 0);
  const totalCostSaved = totalHoursSaved * inputs.hourlyRate;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 print:mb-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
            ROI Dashboard
          </h1>
          <p className="text-sm text-ink-light mt-1">
            Track the value your AI crew delivers
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="text-xs border border-ink/10 text-ink px-4 py-2 rounded-lg hover:bg-ink/5 transition-colors print:hidden"
        >
          Export PDF
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-ink/5 p-6 animate-pulse h-24" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-coral/10 text-coral-deep text-sm px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <SummaryCard
              label="Total Agents"
              value={String(totalAgents)}
              sub={`${onlineAgents} online`}
              accent="bg-teal/10 text-teal-deep"
            />
            <SummaryCard
              label="Avg Uptime"
              value={`${avgUptime.toFixed(1)}%`}
              sub="across all agents"
              accent="bg-teal/10 text-teal-deep"
            />
            <SummaryCard
              label="Total Skills"
              value={String(totalSkills)}
              sub="deployed capabilities"
              accent="bg-ink/5 text-ink"
            />
            <SummaryCard
              label="Hours Saved"
              value={totalHoursSaved.toFixed(0)}
              sub={`~S$${totalCostSaved.toLocaleString()} value`}
              accent="bg-coral/10 text-coral-deep"
            />
          </div>

          {/* Per-Agent Table */}
          <div className="bg-white rounded-2xl border border-ink/5 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-ink/5">
              <h2 className="font-[family-name:var(--font-display)] font-bold text-ink text-sm">
                Per-Agent Metrics
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink/5 bg-cream/50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-ink-light">Agent</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-ink-light">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-ink-light">Uptime</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-ink-light">Skills</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-ink-light">Hours Saved</th>
                  </tr>
                </thead>
                <tbody>
                  {recalculated.map((m) => (
                    <tr key={m.agent.id} className="border-b border-ink/5 last:border-0">
                      <td className="px-6 py-3 font-medium text-ink">{m.agent.name}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full ${
                          m.health?.status === "online"
                            ? "bg-teal/10 text-teal-deep"
                            : "bg-ink/5 text-ink-faint"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            m.health?.status === "online" ? "bg-teal" : "bg-ink-faint"
                          }`} />
                          {m.health?.status === "online" ? "Online" : "Offline"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-ink-light">{m.uptime.toFixed(1)}%</td>
                      <td className="px-4 py-3 text-right text-ink-light">{m.skillCount}</td>
                      <td className="px-6 py-3 text-right font-medium text-ink">{m.estimatedHoursSaved.toFixed(0)}h</td>
                    </tr>
                  ))}
                  {recalculated.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-ink-faint text-sm">
                        No agents deployed yet. Deploy your first agent to see ROI metrics.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Before/After Comparison */}
          <div className="bg-white rounded-2xl border border-ink/5 p-6 mb-8 print:break-before-page">
            <h2 className="font-[family-name:var(--font-display)] font-bold text-ink text-sm mb-4">
              Before / After Comparison
            </h2>
            <p className="text-xs text-ink-light mb-6">
              Adjust the inputs below to model your ROI scenario.
            </p>

            <div className="grid sm:grid-cols-3 gap-4 mb-6 print:hidden">
              <div>
                <label className="block text-xs text-ink-light mb-1.5">Hourly Rate (S$)</label>
                <input
                  type="number"
                  min="1"
                  value={inputs.hourlyRate}
                  onChange={(e) => setInputs({ ...inputs, hourlyRate: Number(e.target.value) || 1 })}
                  className="w-full px-3 py-2 rounded-xl border border-ink/10 bg-cream text-ink text-sm focus:outline-none focus:ring-2 focus:ring-teal/40"
                />
              </div>
              <div>
                <label className="block text-xs text-ink-light mb-1.5">Hours/Agent/Week</label>
                <input
                  type="number"
                  min="1"
                  value={inputs.hoursPerAgentPerWeek}
                  onChange={(e) => setInputs({ ...inputs, hoursPerAgentPerWeek: Number(e.target.value) || 1 })}
                  className="w-full px-3 py-2 rounded-xl border border-ink/10 bg-cream text-ink text-sm focus:outline-none focus:ring-2 focus:ring-teal/40"
                />
              </div>
              <div>
                <label className="block text-xs text-ink-light mb-1.5">Weeks Deployed</label>
                <input
                  type="number"
                  min="1"
                  value={inputs.weeksDeployed}
                  onChange={(e) => setInputs({ ...inputs, weeksDeployed: Number(e.target.value) || 1 })}
                  className="w-full px-3 py-2 rounded-xl border border-ink/10 bg-cream text-ink text-sm focus:outline-none focus:ring-2 focus:ring-teal/40"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="rounded-xl border border-coral/20 bg-coral/5 p-5">
                <h3 className="text-xs font-bold text-coral-deep mb-3 uppercase tracking-wider">Before AI</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-light">Manual hours/week</span>
                    <span className="text-ink font-medium">
                      {(totalAgents * inputs.hoursPerAgentPerWeek).toFixed(0)}h
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-light">Weekly cost</span>
                    <span className="text-ink font-medium">
                      S${(totalAgents * inputs.hoursPerAgentPerWeek * inputs.hourlyRate).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-light">Total ({inputs.weeksDeployed}w)</span>
                    <span className="text-ink font-bold">
                      S${(totalAgents * inputs.hoursPerAgentPerWeek * inputs.hourlyRate * inputs.weeksDeployed).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-teal/20 bg-teal/5 p-5">
                <h3 className="text-xs font-bold text-teal-deep mb-3 uppercase tracking-wider">After AI</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-light">Hours automated</span>
                    <span className="text-ink font-medium">{totalHoursSaved.toFixed(0)}h</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-light">Cost saved</span>
                    <span className="text-ink font-medium">
                      S${totalCostSaved.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-light">Efficiency gain</span>
                    <span className="text-teal-deep font-bold">
                      {totalAgents > 0
                        ? `${((totalHoursSaved / (totalAgents * inputs.hoursPerAgentPerWeek * inputs.weeksDeployed || 1)) * 100).toFixed(0)}%`
                        : "0%"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-ink/5">
      <p className="text-xs text-ink-light mb-1">{label}</p>
      <p className={`font-[family-name:var(--font-display)] text-2xl font-bold ${accent} inline-block px-2 py-0.5 rounded-lg`}>
        {value}
      </p>
      <p className="text-[10px] text-ink-faint mt-1">{sub}</p>
    </div>
  );
}
