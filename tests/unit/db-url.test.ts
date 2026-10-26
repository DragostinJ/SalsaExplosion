import { describe, it, expect } from "vitest";
import { withServerlessPoolParams } from "@/lib/db-url";

describe("M11: Serverless Database URL Pool Parameters", () => {
  const basePoolerUrl = "postgresql://postgres:secret@aws-0-eu-west-2.pooler.supabase.com:6543/postgres";
  const directUrl = "postgresql://postgres:secret@db.project.supabase.co:5432/postgres";

  it("leaves URL untouched in non-production environments", () => {
    const devUrl = withServerlessPoolParams(basePoolerUrl, { NODE_ENV: "development" });
    expect(devUrl).toBe(basePoolerUrl);
  });

  it("leaves non-pooler URLs untouched even in production", () => {
    const res = withServerlessPoolParams(directUrl, { NODE_ENV: "production" });
    expect(res).toBe(directUrl);
  });

  it("appends pgbouncer=true, connection_limit=1, and pool_timeout=15 to Supabase pooler in production", () => {
    const res = withServerlessPoolParams(basePoolerUrl, { NODE_ENV: "production" });
    expect(res).toBeDefined();
    const parsed = new URL(res!);
    expect(parsed.searchParams.get("pgbouncer")).toBe("true");
    expect(parsed.searchParams.get("connection_limit")).toBe("1");
    expect(parsed.searchParams.get("pool_timeout")).toBe("15");
  });

  it("preserves existing query parameters without overwriting explicit custom values", () => {
    const customUrl = `${basePoolerUrl}?connection_limit=2&custom=flag`;
    const res = withServerlessPoolParams(customUrl, { NODE_ENV: "production" });
    expect(res).toBeDefined();
    const parsed = new URL(res!);
    expect(parsed.searchParams.get("connection_limit")).toBe("2");
    expect(parsed.searchParams.get("custom")).toBe("flag");
    expect(parsed.searchParams.get("pgbouncer")).toBe("true");
    expect(parsed.searchParams.get("pool_timeout")).toBe("15");
  });

  it("handles empty, invalid, and undefined inputs gracefully without throwing", () => {
    expect(withServerlessPoolParams(undefined, { NODE_ENV: "production" })).toBeUndefined();
    expect(withServerlessPoolParams("", { NODE_ENV: "production" })).toBe("");
    expect(withServerlessPoolParams("not-a-valid-url", { NODE_ENV: "production" })).toBe("not-a-valid-url");
  });
});
