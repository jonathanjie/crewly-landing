import { describe, it, expect, vi } from "vitest";

describe("supabase client", () => {
  it("returns null when env vars are empty", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");

    // Re-import to get fresh module evaluation
    vi.resetModules();
    const { supabase } = await import("../supabase");
    expect(supabase).toBeNull();

    vi.unstubAllEnvs();
  });

  it("creates client when env vars are set", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");

    vi.resetModules();
    const { supabase } = await import("../supabase");
    expect(supabase).not.toBeNull();
    expect(supabase).toHaveProperty("auth");

    vi.unstubAllEnvs();
  });
});
