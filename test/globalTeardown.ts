import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export default async (): Promise<void> => {
  console.log("🧹 Global Teardown: Stopping Docker Compose...");

  try {
    await execAsync("docker-compose down", {
      cwd: require("path").resolve(__dirname, "../cube"),
      timeout: 30000,
    });
    console.log("✅ Global Teardown: Docker Compose stopped");
  } catch (error) {
    console.error("❌ Global Teardown warning:", error);
    // Don't throw here - we want cleanup to complete even if this fails
  }
};
