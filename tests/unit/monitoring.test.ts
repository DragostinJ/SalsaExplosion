import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { reportError } from "@/lib/monitoring";

describe("M12: Structured Redacting Error Reporter Seam", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("redacts postgres connection strings, stripe secret keys, webhook secrets, and bearer tokens", () => {
    const errorWithSecrets = new Error(
      "Connection to postgresql://postgres:mypassword@aws-0-eu-west-2.pooler.supabase.com:6543/postgres failed with key sk_live_51P0123456789ABCDEF and webhook whsec_999988887777 using Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token"
    );

    reportError("TestScope", errorWithSecrets);

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const loggedRaw = consoleSpy.mock.calls[0][0];
    const loggedObj = JSON.parse(loggedRaw);

    expect(loggedObj.level).toBe("error");
    expect(loggedObj.scope).toBe("TestScope");
    expect(loggedObj.message).not.toContain("mypassword");
    expect(loggedObj.message).not.toContain("sk_live_51P0123456789ABCDEF");
    expect(loggedObj.message).not.toContain("whsec_999988887777");
    expect(loggedObj.message).not.toContain("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
    expect(loggedObj.message).toContain("[REDACTED_SECRET]");
  });

  it("handles non-Error objects, strings, null, and primitive values safely", () => {
    reportError("PrimitiveString", "Something blew up");
    reportError("NullValue", null);
    reportError("CustomObject", { message: "Custom object error", digest: "CUSTOM_DIGEST_123" });

    expect(consoleSpy).toHaveBeenCalledTimes(3);

    const call1 = JSON.parse(consoleSpy.mock.calls[0][0]);
    expect(call1.scope).toBe("PrimitiveString");
    expect(call1.message).toBe("Something blew up");

    const call2 = JSON.parse(consoleSpy.mock.calls[1][0]);
    expect(call2.scope).toBe("NullValue");
    expect(call2.message).toBe("null");

    const call3 = JSON.parse(consoleSpy.mock.calls[2][0]);
    expect(call3.scope).toBe("CustomObject");
    expect(call3.message).toBe("Custom object error");
    expect(call3.digest).toBe("CUSTOM_DIGEST_123");
  });

  it("never throws when JSON.stringify fails on circular structures in context", () => {
    const circularObj: Record<string, unknown> = { key: "normal" };
    circularObj.self = circularObj;

    expect(() => {
      reportError("CircularContext", new Error("Normal message"), circularObj as Record<string, string>);
    }).not.toThrow();

    expect(consoleSpy).toHaveBeenCalledTimes(1);
  });
});
