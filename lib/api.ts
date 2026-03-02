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
  listOrgs: () => portalFetch<Org[]>("/api/v1/orgs"),
  listTemplates: () => portalFetch<AppTemplate[]>("/api/v1/catalog"),
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
