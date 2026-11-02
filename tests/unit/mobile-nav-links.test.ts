import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { dancerLinks, EXPLORE_LINKS, TEACHER_LINKS, OWNER_LINKS } from "@/components/navigation/mobile-nav-links";

// The signed-in menu once picked a deleted link by position; the empty slot crashed every page that opened it.
describe("mobile menu links", () => {
  const appRoot = path.resolve(process.cwd(), "src", "app");
  const lists = {
    "signed out": dancerLinks(false),
    "signed in": dancerLinks(true),
    explore: EXPLORE_LINKS,
    teacher: TEACHER_LINKS,
    owner: OWNER_LINKS,
  };

  it.each(Object.entries(lists))("%s: every link is filled in and opens a real page", (_name, links) => {
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link?.icon, `missing link or icon in ${JSON.stringify(link)}`).toBeTruthy();
      const page = path.join(appRoot, ...link.href.split("/").filter(Boolean), "page.tsx");
      expect(fs.existsSync(page), `${link.href} has no page.tsx`).toBe(true);
    }
  });

  it("signed-in dancers keep every public link and add their member pages", () => {
    const signedIn = dancerLinks(true).map((l) => l.href);
    for (const link of dancerLinks(false)) expect(signedIn).toContain(link.href);
    expect(signedIn).toEqual(expect.arrayContaining(["/dashboard/wallet", "/dashboard/progression"]));
    expect(new Set(signedIn).size).toBe(signedIn.length);
  });
});
