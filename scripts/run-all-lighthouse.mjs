import { execSync } from "node:child_process";
import fs from "node:fs";

const urls = [
  { name: "root", url: "http://localhost:3200/" },
  { name: "events", url: "http://localhost:3200/events" },
  { name: "music", url: "http://localhost:3200/music" },
  { name: "song", url: "http://localhost:3200/music/me-dicen-cuba" },
];

const results = {};

for (const { name, url } of urls) {
  const jsonPath = `./lighthouse-${name}.json`;
  console.log(`Auditing ${name} (${url})...`);
  try {
    execSync(
      `npx lighthouse ${url} --output=json --output-path=${jsonPath} --chrome-flags="--headless --no-sandbox" --only-categories=performance`,
      { stdio: "ignore", env: { ...process.env, NODE_OPTIONS: "--use-system-ca" } }
    );
    const report = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    const perf = Math.round((report.categories.performance?.score || 0) * 100);
    const lcp = report.audits["largest-contentful-paint"]?.displayValue || "N/A";
    const cls = report.audits["cumulative-layout-shift"]?.displayValue || "0";
    const tbt = report.audits["total-blocking-time"]?.displayValue || "0 ms";
    const opps = Object.values(report.audits)
      .filter((a) => a.details && a.details.type === "opportunity" && a.score !== 1)
      .sort((a, b) => (b.numericValue || 0) - (a.numericValue || 0))
      .slice(0, 5)
      .map((a) => `${a.title} (${a.displayValue || "N/A"})`);

    results[name] = { url, perf, lcp, cls, tbt, opps };
    console.log(`Results for ${name}:`, { perf, lcp, cls, tbt, opps });
  } catch (err) {
    console.error(`Error auditing ${name}:`, err.message);
  }
}

fs.writeFileSync("./lighthouse-summary-before.json", JSON.stringify(results, null, 2));
console.log("All audits complete. Saved to lighthouse-summary-before.json");
