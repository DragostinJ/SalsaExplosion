import { readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { APP_ROUTE_SEGMENTS, isUnknownRoute } from "@/lib/route-segments";

describe("route segments", () => {
  it("lists exactly the route folders in src/app, so no new private page skips sign-in", () => {
    const folders = readdirSync(path.resolve(__dirname, "../../src/app"), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();
    // A route group "(name)" or a dynamic folder "[x]" at the top would break isUnknownRoute.
    expect(folders.filter((f) => /^[([]/.test(f))).toEqual([]);
    expect([...APP_ROUTE_SEGMENTS].sort()).toEqual(folders);
  });

  it("treats only addresses outside every route folder as unknown", () => {
    expect(isUnknownRoute("/this-page-does-not-exist")).toBe(true);
    expect(isUnknownRoute("/wp-login.php")).toBe(true);
    expect(isUnknownRoute("/")).toBe(false);
    expect(isUnknownRoute("/admin/anything")).toBe(false);
    expect(isUnknownRoute("/dashboard/progression")).toBe(false);
    expect(isUnknownRoute("/review")).toBe(false);
    expect(isUnknownRoute("/api/cron/daily")).toBe(false);
  });
});
