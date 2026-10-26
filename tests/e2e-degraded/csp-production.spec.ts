import { test, expect } from "@playwright/test";

test.describe("M15: Production CSP Eval Violation Detection", () => {
  const routesToCheck = ["/", "/events", "/pricing"];

  for (const route of routesToCheck) {
    test(`checks ${route} in production mode for unexpected CSP eval violations`, async ({
      page,
    }) => {
      const cspEvalErrors: string[] = [];

      page.on("console", (msg) => {
        const text = msg.text();
        if (
          text.includes("Content Security Policy") &&
          (text.includes("unsafe-eval") || text.includes("eval"))
        ) {
          cspEvalErrors.push(text);
        } else if (text.includes("Content Security Policy")) {
          test.info().annotations.push({
            type: "CSP_WARNING",
            description: text,
          });
        }
      });

      page.on("pageerror", (err) => {
        if (
          err.message.includes("Content Security Policy") &&
          (err.message.includes("unsafe-eval") || err.message.includes("eval"))
        ) {
          cspEvalErrors.push(err.message);
        }
      });

      const res = await page.goto(route, { waitUntil: "load" });
      expect(res?.status()).toBeLessThan(400);

      await page.waitForTimeout(1500);

      expect(cspEvalErrors).toEqual([]);
    });
  }
});
