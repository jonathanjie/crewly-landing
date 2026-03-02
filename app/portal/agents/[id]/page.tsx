// app/portal/agents/[id]/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { AppInstance, InstanceHealth } from "@/lib/types";
import { statusDotColor } from "@/lib/types";

type Tab = "overview" | "skills" | "channels" | "chat";

export default function AgentDetail() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [agent, setAgent] = useState<AppInstance | null>(null);
  const [health, setHealth] = useState<InstanceHealth | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const refresh = useCallback(async () => {
    const [a, h] = await Promise.all([
      api.getDeployment(id),
      api.getHealth(id).catch(() => null),
    ]);
    setAgent(a);
    setHealth(h);
  }, [id]);

  useEffect(() => {
    (async () => {
      try {
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load agent");
      } finally {
        setLoading(false);
      }
    })();
  }, [refresh]);

  const handleAction = async (action: "restart" | "stop") => {
    setActionLoading(true);
    setError(null);
    try {
      if (action === "restart") await api.restartDeployment(id);
      else await api.stopDeployment(id);
      await refresh().catch(() => {
        // Refresh may fail briefly after action — non-fatal
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} agent`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-white rounded-2xl h-64 border border-ink/5" />;
  }

  if (error && !agent) {
    return (
      <div className="text-center py-12">
        <p className="text-coral-deep text-sm mb-2">{error}</p>
        <button onClick={() => router.back()} className="text-teal-deep text-sm mt-2 hover:underline">
          ← Go back
        </button>
      </div>
    );
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

  const tabs: { key: Tab; label: string; href?: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "skills", label: "Skills" },
    { key: "channels", label: "Channels" },
    { key: "chat", label: "Chat", href: `/portal/agents/${id}/chat` },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-ink-faint hover:text-ink text-sm">
            ←
          </button>
          <div className={`w-3 h-3 rounded-full ${statusDotColor(agent.status, health?.status)}`} />
          <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink">
            {agent.name}
          </h1>
          <span className="text-xs text-ink-faint capitalize bg-ink/5 px-2 py-0.5 rounded-full">
            {agent.status}
          </span>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/portal/agents/${id}/chat`}
            className="text-xs bg-teal-deep text-white px-3 py-1.5 rounded-lg hover:bg-teal-deep/90 transition-colors flex items-center gap-1.5"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            Chat
          </Link>
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

      {error && (
        <div className="bg-coral/10 text-coral-deep text-sm px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-ink/5 pb-px">
        {tabs.map((t) =>
          t.href ? (
            <Link
              key={t.key}
              href={t.href}
              className="px-4 py-2 text-xs font-medium rounded-t-lg transition-colors text-ink-light hover:text-ink flex items-center gap-1"
            >
              {t.label}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </Link>
          ) : (
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
          ),
        )}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-2xl border border-ink/5 p-6">
        {tab === "overview" && (
          <div className="space-y-4">
            <Row label="Status" value={health?.status === "online" ? "Online" : "Offline"} />
            <Row label="Agent ID" value={agent.agent_id ?? "—"} mono />
            <Row label="Created" value={agent.created_at ? new Date(agent.created_at).toLocaleDateString() : "—"} />
            {health?.last_heartbeat && (
              <Row label="Last Heartbeat" value={new Date(health.last_heartbeat).toLocaleString()} />
            )}
            {health?.host && (
              <>
                {health.host.cpu_percent != null && (
                  <Row label="CPU" value={`${health.host.cpu_percent}%`} />
                )}
                {health.host.memory_percent != null && (
                  <Row label="Memory" value={`${health.host.memory_percent}%`} />
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
