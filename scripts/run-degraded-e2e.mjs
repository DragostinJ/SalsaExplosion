import { spawn } from "node:child_process";

const unreachableDbUrl = "postgresql://nobody:nopass@127.0.0.1:9/nodb?connect_timeout=2";

const childEnv = {
  ...process.env,
  DATABASE_URL: unreachableDbUrl,
  DIRECT_URL: unreachableDbUrl,
};

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    console.log(`\n▶ Running: ${command} ${args.join(" ")}`);
    const proc = spawn(command, args, {
      stdio: "inherit",
      shell: true,
      env: childEnv,
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with exit code ${code}`));
      } else {
        resolve();
      }
    });

    proc.on("error", (err) => reject(err));
  });
}

async function main() {
  try {
    console.log("🛠 Step 1: Building Next.js application with simulated unreachable DB...");
    await runCommand("npx", ["next", "build"]);

    console.log("🧪 Step 2: Executing degraded resilience E2E Playwright suite...");
    await runCommand("npx", ["playwright", "test", "-c", "playwright.degraded.config.ts"]);

    console.log("\n✅ Degraded E2E suite completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Degraded E2E run failed:", error.message);
    process.exit(1);
  }
}

main();
