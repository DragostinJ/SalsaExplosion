import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("U3: 'use server' Exports Compliance & Turbopack Safety Guard", () => {
  const srcRoot = path.resolve(process.cwd(), "src");

  function getTsFiles(dir: string): string[] {
    const results: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...getTsFiles(full));
      } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
        results.push(full);
      }
    }
    return results;
  }

  it("statically guarantees every 'use server' file only exports async functions or TS types/interfaces", () => {
    const files = getTsFiles(srcRoot);
    const useServerFiles = files.filter((f) => {
      const content = fs.readFileSync(f, "utf-8");
      return (
        content.includes('"use server"') || content.includes("'use server'")
      );
    });

    expect(useServerFiles.length).toBeGreaterThan(5);

    for (const file of useServerFiles) {
      const relative = path.relative(srcRoot, file);
      const lines = fs.readFileSync(file, "utf-8").split(/\r?\n/);

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip non-exports and comments
        if (
          !line.startsWith("export ") ||
          line.startsWith("//") ||
          line.startsWith("/*") ||
          line.startsWith("*")
        ) {
          continue;
        }

        // Allowed: export type ..., export interface ..., export async function ...
        const isType = line.startsWith("export type ");
        const isInterface = line.startsWith("export interface ");
        const isAsyncFn = line.startsWith("export async function ");

        const isValid = isType || isInterface || isAsyncFn;

        expect(
          isValid,
          `Forbidden export in 'use server' file [src/${relative}:${i + 1}]: "${line}". Next.js Turbopack will crash with HTTP 500 runtime error (invalid-use-server-value). Only 'export async function', 'export type', or 'export interface' are permitted.`
        ).toBe(true);
      }
    }
  });

  it("dynamically validates that imported server actions only expose functions at runtime", async () => {
    const [notificationsMod, exportMod, managementMod] = await Promise.all([
      import("@/actions/notifications.actions"),
      import("@/actions/export.actions"),
      import("@/actions/management.actions"),
    ]);

    const modules = [
      { name: "notifications.actions", mod: notificationsMod },
      { name: "export.actions", mod: exportMod },
      { name: "management.actions", mod: managementMod },
    ];

    for (const { name, mod } of modules) {
      for (const [key, val] of Object.entries(mod)) {
        expect(
          typeof val,
          `Module ${name} exports '${key}' which is typeof '${typeof val}' instead of 'function'`
        ).toBe("function");
      }
    }
  });
});
