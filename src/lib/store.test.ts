import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

function restore(name: string, value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  restore("NEXT_PUBLIC_SUPABASE_URL", ORIGINAL.url);
  restore("NEXT_PUBLIC_SUPABASE_ANON_KEY", ORIGINAL.key);
});

describe("storage backend selection", () => {
  it("uses the local JSON store when Supabase is unconfigured", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const { activeBackend } = await import("./store");
    expect(activeBackend()).toBe("local-json");
  });

  it("uses Supabase once both values are present", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";

    const { activeBackend } = await import("./store");
    expect(activeBackend()).toBe("supabase");
  });

  it("does not half-enable Supabase when only one value is set", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const { activeBackend } = await import("./store");
    // Falling through to the local file is the safe outcome. Reporting
    // "supabase" here would send every query at a client that cannot
    // authenticate.
    expect(activeBackend()).toBe("local-json");
  });
});
