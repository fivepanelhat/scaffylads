import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const ORIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};
let currentUser: unknown = null;

beforeEach(() => {
  vi.resetModules();
  vi.doMock("@supabase/ssr", () => ({
    createServerClient: () => ({
      auth: { getUser: async () => ({ data: { user: currentUser } }) },
    }),
  }));
});
afterEach(() => {
  for (const [k, v] of [["NEXT_PUBLIC_SUPABASE_URL", ORIG.url], ["NEXT_PUBLIC_SUPABASE_ANON_KEY", ORIG.key]] as const) {
    if (v === undefined) delete process.env[k]; else process.env[k] = v;
  }
  vi.doUnmock("@supabase/ssr");
});

const req = (path: string) => new NextRequest(new URL(`http://localhost${path}`));

describe("middleware gate", () => {
  it("is a no-op when Supabase is unconfigured (local single-user)", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const { middleware } = await import("@/middleware");
    const res = await middleware(req("/logbook"));
    expect(res.status).toBe(200);
  });

  it("redirects anonymous visitors away from app routes when deployed", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
    currentUser = null;
    const { middleware } = await import("@/middleware");
    for (const path of ["/", "/logbook", "/projects", "/schedule", "/api/logs"]) {
      const res = await middleware(req(path));
      expect(res.status, path).toBe(307);
      expect(res.headers.get("location"), path).toContain("/login");
    }
  });

  it("lets the login and callback routes through", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
    currentUser = null;
    const { middleware } = await import("@/middleware");
    for (const path of ["/login", "/auth/callback?code=abc"]) {
      expect((await middleware(req(path))).status, path).toBe(200);
    }
  });

  it("allows a signed-in user through", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
    currentUser = { id: "user-1" };
    const { middleware } = await import("@/middleware");
    expect((await middleware(req("/logbook"))).status).toBe(200);
  });
});
