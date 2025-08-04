import dotenv from "dotenv";

import { CodeGeneratorService } from "../lib/services/CodeGeneratorService";
import { isValidMetaResponse } from "./validate";
import { writeGeneratedFile } from "./writeGeneratedFile";
import { CubeMetadata } from "../lib/types/internal-types";
import { GenerateOptions, ProcessedOptions } from "../lib/types/internal-types";
import { loadConfig } from "./loadConfig";
import { fetchFromCubeMetaApi } from "./fetchFromCubeMetaApi";

import { generateCubeToken } from "./generateCubeToken";

dotenv.config();

export class GenerateCommandHandler {
  private codeGenerator = new CodeGeneratorService();

  async execute(options: GenerateOptions): Promise<void> {
    try {
      const processedOptions = await this.processOptions(options);
      const cubes = await this.fetchAndValidateCubes(processedOptions);
      const filteredCubes = this.filterCubes(cubes, processedOptions.cube);

      await this.generateOutput(filteredCubes, processedOptions);
      console.log(
        `✅ Successfully generated cube definitions for ${filteredCubes.length} cube(s) at ${processedOptions.output}`
      );
    } catch (error) {
      console.error(`❌ Error generating cube definitions:`, error);
      process.exit(1);
    }
  }

  private async processOptions(
    options: GenerateOptions
  ): Promise<ProcessedOptions> {
    const config = await loadConfig(options.config);

    // Resolve URL and secret with precedence: CLI > config > env
    const resolvedUrl =
      options.url || config.apiUrl || process.env.CUBE_API_URL;
    const resolvedSecret =
      options.secret || config.apiSecret || process.env.CUBE_API_SECRET;

    if (!resolvedUrl) {
      throw new Error(
        "Cube API URL must be provided via CLI flag, config file, or env var."
      );
    }

    // Generate JWT token if security context is provided
    let token: string | undefined;
    if (config.securityContext) {
      if (!resolvedSecret) {
        throw new Error(
          "Cube API secret is required to sign the security context."
        );
      }
      token = await generateCubeToken(config.securityContext, resolvedSecret);
      console.log("✅ Security context signed successfully.");
    } else {
      console.log(
        "⚠️ No security context provided. Proceeding without authentication."
      );
    }

    return {
      ...options,
      resolvedUrl,
      resolvedSecret,
      token,
    };
  }

  private async fetchAndValidateCubes(
    options: ProcessedOptions
  ): Promise<CubeMetadata[]> {
    console.log("🔄 Fetching cube metadata...");
    const metaData = await fetchFromCubeMetaApi(
      options.resolvedUrl,
      options.token
    );

    if (!isValidMetaResponse(metaData)) {
      throw new Error("No cubes found in the meta API response");
    }

    return metaData.cubes ?? [];
  }

  private filterCubes(
    cubes: CubeMetadata[],
    specificCube?: string
  ): CubeMetadata[] {
    if (!specificCube) {
      return cubes;
    }

    const filteredCubes = cubes.filter((cube) => cube.name === specificCube);
    if (filteredCubes.length === 0) {
      const availableCubes = cubes.map((c) => c.name).join(", ");
      throw new Error(
        `Cube "${specificCube}" not found. Available cubes: ${availableCubes}`
      );
    }

    return filteredCubes;
  }

  private async generateOutput(
    cubes: CubeMetadata[],
    options: ProcessedOptions
  ): Promise<void> {
    console.log(`🎯 Processing ${cubes.length} cube(s)...`);

    // Generate TypeScript definitions
    const generatedCode = this.codeGenerator.generateCubeDefCode(
      cubes,
      options.delimiter
    );
    await writeGeneratedFile(options.output, generatedCode);

    // Generate Zod schema if requested
    if (options.zodSchema) {
      const zodSchemaCode = this.codeGenerator.generateZodSchema(cubes);
      await writeGeneratedFile(options.zodSchema, zodSchemaCode);
      console.log(`📄 Zod schema written to: ${options.zodSchema}`);
    }
  }
}
