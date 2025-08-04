import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

/*
  This file runs the docker-compose in /cube for testing, and the postgres
  instance it's connected to that's completely empty.
*/

const execAsync = promisify(exec);

export default async (): Promise<void> => {
  console.log("🚀 Global Setup: Starting Docker Compose...");

  try {
    console.log(
      "🔧 Setting up Docker Compose at",
      path.resolve(__dirname, "../cube")
    );
    // Start Docker Compose
    await execAsync("docker-compose -f docker-compose.yml up -d", {
      timeout: 120000, // 2 minutes
      cwd: path.resolve(__dirname, "../cube"),
    });

    console.log("✅ Global Setup: Docker Compose started");
    // Wait for Cube.js to be ready
    await waitForCubeJs();

    console.log("✅ Global Setup: Docker Compose ready");
  } catch (error) {
    console.error("❌ Global Setup failed:", error);
    throw error;
  }
};

async function waitForCubeJs(maxWaitTime = 90000): Promise<void> {
  const startTime = Date.now();
  const checkInterval = 3000;

  console.log("⏳ Waiting for Cube.js to be ready...");

  while (Date.now() - startTime < maxWaitTime) {
    try {
      const { stdout } = await execAsync(
        'curl -f http://localhost:4000/cubejs-api/v1/meta --max-time 5 || echo "not ready"'
      );

      if (!stdout.includes("not ready")) {
        console.log("✅ Cube.js is ready!");
        return;
      }
    } catch (error) {
      console.log("❌ Error checking Cube.js status:", error);
      // Continue waiting
    }

    console.log("⏳ Still waiting for Cube.js...");
    await new Promise((resolve) => setTimeout(resolve, checkInterval));
  }

  throw new Error(`Cube.js failed to start within ${maxWaitTime}ms`);
}
