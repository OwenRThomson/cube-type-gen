import fs from "fs/promises";
import { CubeTypesConfig } from "../lib/types/internal-types";

/**
 * Loads and parses the CubeTypes configuration file
 *
 * @param configPath - The path to the configuration file. Defaults to "./cubetypes.config.json".
 * @returns A promise that resolves to the parsed CubeTypesConfig object. If the file does not exist, returns an empty object.
 * @throws Throws an error if the file cannot be read for reasons other than non-existence.
 */
export async function loadConfig(
  configPath: string = "./cubetypes.config.json"
): Promise<CubeTypesConfig> {
  try {
    const file = await fs.readFile(configPath, "utf-8");
    return JSON.parse(file);
  } catch (err: any) {
    if (err.code === "ENOENT") {
      return {};
    }
    throw new Error(
      `Failed to read config file at ${configPath}: ${err.message}`
    );
  }
}
