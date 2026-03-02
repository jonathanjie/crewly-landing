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
