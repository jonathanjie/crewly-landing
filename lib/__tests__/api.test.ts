import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock supabase before importing api
vi.mock("../supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            access_token: "test-jwt-token",
          },
        },
      }),
    },
  },
}));

// Mock fetch globally
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

import { api, fetchAllDeployments } from "../api";

beforeEach(() => {
  mockFetch.mockReset();
});

describe("api.listOrgs", () => {
  it("calls the correct endpoint with JWT", async () => {
    const orgs = [{ id: "1", name: "Test Org", slug: "test-org", plan_tier: "free" }];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(orgs),
    });

    const result = await api.listOrgs();

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/fleet/api/v1/orgs",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-jwt-token",
          "Content-Type": "application/json",
        }),
      }),
    );
    expect(result).toEqual(orgs);
  });
});

describe("api.listTemplates", () => {
  it("calls /api/v1/catalog", async () => {
    const templates = [{ id: "t1", slug: "kb", name: "Knowledge Brain" }];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(templates),
    });

    const result = await api.listTemplates();
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/fleet/api/v1/catalog",
      expect.any(Object),
    );
    expect(result).toEqual(templates);
  });
});

describe("api.deploy", () => {
  it("sends POST with body", async () => {
    const instance = { id: "i1", name: "My Bot", status: "provisioning" };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(instance),
    });

    const body = {
      org_slug: "test",
      template_slug: "kb",
      name: "My Bot",
      config: { agent_name: "My Bot" },
    };
    const result = await api.deploy(body);

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/fleet/api/v1/deployments",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(body),
      }),
    );
    expect(result).toEqual(instance);
  });
});

describe("api.getHealth", () => {
  it("calls health endpoint for deployment", async () => {
    const health = { agent_id: "a1", status: "online", last_heartbeat: "2026-03-02T00:00:00Z" };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(health),
    });

    const result = await api.getHealth("dep-1");
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/fleet/api/v1/deployments/dep-1/health",
      expect.any(Object),
    );
    expect(result).toEqual(health);
  });
});

describe("api.sendChat", () => {
  it("sends message via POST", async () => {
    const response = { response: "Hello!" };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(response),
    });

    const result = await api.sendChat("dep-1", "Hi there");
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/fleet/api/v1/deployments/dep-1/chat",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ message: "Hi there" }),
      }),
    );
    expect(result).toEqual(response);
  });
});

describe("api.getOrgMembers", () => {
  it("URL-encodes org slug", async () => {
    const members = [{ id: "m1", email: "a@b.com", role: "owner" }];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(members),
    });

    await api.getOrgMembers("my org");
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/fleet/api/v1/orgs/my%20org/members",
      expect.any(Object),
    );
  });
});

describe("portalFetch error handling", () => {
  it("throws on non-ok response with detail", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: "Forbidden",
      json: () => Promise.resolve({ detail: "Plan limit exceeded" }),
    });

    await expect(api.listOrgs()).rejects.toThrow("Plan limit exceeded");
  });

  it("throws statusText when no detail in error response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: () => Promise.reject(new Error("bad json")),
    });

    await expect(api.listOrgs()).rejects.toThrow("Internal Server Error");
  });
});

describe("fetchAllDeployments", () => {
  it("fetches orgs then deployments for each org in parallel", async () => {
    const orgs = [
      { id: "1", name: "Org A", slug: "org-a", plan_tier: "free" },
      { id: "2", name: "Org B", slug: "org-b", plan_tier: "pro" },
    ];
    const deploymentsA = [{ id: "d1", name: "Bot A", status: "active" }];
    const deploymentsB = [{ id: "d2", name: "Bot B", status: "active" }];

    mockFetch
      .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(orgs) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(deploymentsA) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(deploymentsB) });

    const result = await fetchAllDeployments();
    expect(result.orgs).toEqual(orgs);
    expect(result.agents).toHaveLength(2);
    expect(result.agents[0].id).toBe("d1");
    expect(result.agents[1].id).toBe("d2");
  });

  it("returns empty agents when no orgs exist", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
    });

    const result = await fetchAllDeployments();
    expect(result.orgs).toEqual([]);
    expect(result.agents).toEqual([]);
  });
});
