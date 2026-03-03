import { describe, it, expect } from "vitest";
import {
  planLabels,
  planColors,
  categoryLabels,
  statusDotColor,
} from "../types";

describe("planLabels", () => {
  it("maps all plan tiers to display labels", () => {
    expect(planLabels.free).toBe("Free");
    expect(planLabels.starter).toBe("Starter");
    expect(planLabels.pro).toBe("Pro");
    expect(planLabels.enterprise).toBe("Enterprise");
  });

  it("covers exactly 4 tiers", () => {
    expect(Object.keys(planLabels)).toHaveLength(4);
  });
});

describe("planColors", () => {
  it("maps all plan tiers to Tailwind classes", () => {
    expect(planColors.free).toContain("bg-");
    expect(planColors.starter).toContain("text-");
    expect(planColors.pro).toContain("text-");
    expect(planColors.enterprise).toContain("text-");
  });

  it("covers exactly 4 tiers", () => {
    expect(Object.keys(planColors)).toHaveLength(4);
  });
});

describe("categoryLabels", () => {
  it("maps GenAIxDL categories to display labels", () => {
    expect(categoryLabels["knowledge-management"]).toBe("Knowledge Mining");
    expect(categoryLabels["customer-engagement"]).toBe("Customer Engagement");
    expect(categoryLabels["operations-automation"]).toBe("Operations Automation");
    expect(categoryLabels["content-generation"]).toBe("Content Generation");
    expect(categoryLabels["team-productivity"]).toBe("Team Ops");
  });

  it("covers all 5 GenAIxDL categories", () => {
    expect(Object.keys(categoryLabels)).toHaveLength(5);
  });
});

describe("statusDotColor", () => {
  it("returns teal for online health status", () => {
    expect(statusDotColor("active", "online")).toBe("bg-teal");
  });

  it("returns teal for active agent even without health", () => {
    expect(statusDotColor("active")).toBe("bg-teal");
  });

  it("returns coral for failed agent", () => {
    expect(statusDotColor("failed")).toBe("bg-coral");
    expect(statusDotColor("failed", "offline")).toBe("bg-coral");
  });

  it("returns amber for provisioning agent", () => {
    expect(statusDotColor("provisioning")).toBe("bg-amber-400");
  });

  it("returns ink-faint for stopped/pending agents", () => {
    expect(statusDotColor("stopped")).toBe("bg-ink-faint");
    expect(statusDotColor("pending")).toBe("bg-ink-faint");
  });

  it("returns teal when health is online even if agent status is not active", () => {
    expect(statusDotColor("pending", "online")).toBe("bg-teal");
  });
});
