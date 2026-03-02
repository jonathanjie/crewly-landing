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
