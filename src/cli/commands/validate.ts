import { Command } from "commander";
import { GenerateCommandHandler } from "../../utils/generateCubeDefs";
import { GenerateOptions } from "../../lib/types/internal-types";

export function registerGenerateCommand(program: Command): void {
  const handler = new GenerateCommandHandler();

  program
    .command("generate")
    .description("Generate TypeScript CubeDef definitions from Cube Meta API")
    .option(
      "-c, --config <path>",
      "Path to cubetypes.config.json",
      "./cubetypes.config.json"
    )
    .option("-u, --url <url>", "Cube API base URL")
    .option("--secret <secret>", "Cube API secret for signing security context")
    .option(
      "-o, --output <path>",
      "Output file path for generated types",
      "./cubes.generated.ts"
    )
    .option("--cube <name>", "Generate types for specific cube only (optional)")
    .option(
      "-z, --zod-schema <path>",
      "Output file path for generated Zod query validation schema (optional)"
    )
    .option(
      "-d, --delimiter <delimiter>",
      "Delimiter for grouping cube names into nested structure (optional)"
    )
    .action(async (options: GenerateOptions) => {
      await handler.execute(options);
    });
}
