import fs from "fs/promises";
import path from "path";

export async function writeGeneratedFile(
  filePath: string,
  content: string
): Promise<void> {
  const outputDir = path.dirname(filePath);
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(filePath, content, "utf-8");
}
