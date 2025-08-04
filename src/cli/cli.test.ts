// test/cli.test.ts
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { exec, spawn } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

let validateQuery: any;
let CubeSchema: any;
let test_cube: any;

const OUTPUT_DIR = "./output";

describe("CLI Cube Generator", () => {
  beforeAll(async () => {
    console.log("Starting test suite setup...");

    console.log("Running CLI script...");
    await runCliScript();

    console.log("Importing generated files...");
    await importGeneratedFiles();

    console.log("✅ Test suite setup complete");
  }, 60000);

  describe("File Generation", () => {
    it("should generate query-schema.ts file", async () => {
      const filePath = path.join(OUTPUT_DIR, "query-schema.ts");
      const fileExists = await checkFileExists(filePath);
      expect(fileExists).toBe(true);

      const content = await fs.readFile(filePath, "utf-8");
      expect(content).toContain("validateQuery");
      expect(content).toContain("CubeQuerySchema.parse");
    });

    it("should generate cubes.generated.ts file", async () => {
      const filePath = path.join(OUTPUT_DIR, "cubes.generated.ts");
      const fileExists = await checkFileExists(filePath);
      expect(fileExists).toBe(true);

      const content = await fs.readFile(filePath, "utf-8");
      expect(content).toContain("CubeDef");
      expect(content).toContain("CubeSchema");
    });
  });

  describe("Generated Cube Definitions", () => {
    it("should contain test_cube cube", () => {
      expect(CubeSchema).toHaveProperty("test_cube");
      expect(test_cube).toBeDefined();
      expect(test_cube.name).toBe("test_cube");
    });

    it("should have correct measures structure", () => {
      const measures = test_cube.measures;

      expect(measures).toHaveProperty("count");
      expect(measures).toHaveProperty("total_spend");
      expect(measures).toHaveProperty("total_clicks");
      expect(measures).toHaveProperty("total_impressions");
      expect(measures).toHaveProperty("total_conversions");
      expect(measures).toHaveProperty("total_click_throughs");
      expect(measures).toHaveProperty("average_ctr");
    });

    it("should have correct dimensions structure", () => {
      const dimensions = test_cube.dimensions;

      expect(dimensions).toHaveProperty("dimension");
      expect(dimensions).toHaveProperty("schema");
      expect(dimensions).toHaveProperty("organisation_slug");
      expect(dimensions).toHaveProperty("service");
      expect(dimensions).toHaveProperty("name");
      expect(dimensions).toHaveProperty("src");
      expect(dimensions).toHaveProperty("ad_format");
      expect(dimensions).toHaveProperty("created_date");
      expect(dimensions).toHaveProperty("updated_date");
      expect(dimensions).toHaveProperty("date");
    });

    it("should have segments array", () => {
      expect(Array.isArray(test_cube.segments)).toBe(true);
    });
  });

  describe("Query Validation", () => {
    it("should validate correct queries", () => {
      const validQuery = {
        measures: ["test_cube.count"],
        dimensions: ["test_cube.name"],
        timeDimensions: [],
      };

      expect(() => validateQuery(validQuery)).not.toThrow();
    });

    it("should reject invalid queries - wrong measure", () => {
      const invalidQuery = {
        measures: ["test_cube.invalid_measure"],
        dimensions: ["test_cube.name"],
        timeDimensions: [],
      };

      expect(() => validateQuery(invalidQuery)).toThrow();
    });

    it("should reject invalid queries - wrong dimension", () => {
      const invalidQuery = {
        measures: ["test_cube.count"],
        dimensions: ["test_cube.invalid_dimension"],
        timeDimensions: [],
      };

      expect(() => validateQuery(invalidQuery)).toThrow();
    });

    it("should reject queries with wrong structure", () => {
      const invalidQuery = {
        wrongField: "value",
      };

      console.log(
        "Validation Result:",
        validateQuery(invalidQuery),
        invalidQuery
      );

      expect(() => validateQuery(invalidQuery)).toThrow();
    });

    it("should validate complex valid queries", () => {
      const complexQuery = {
        measures: ["test_cube.count", "test_cube.total_spend"],
        dimensions: ["test_cube.name", "test_cube.ad_format"],
        timeDimensions: [
          {
            dimension: "test_cube.date",
            granularity: "day",
          },
        ],
        filters: [
          {
            member: "test_cube.service",
            operator: "equals",
            values: ["adroll"],
          },
        ],
      };

      console.log(
        "Complex Query Validation Result:",
        validateQuery(complexQuery)
      );

      expect(() => validateQuery(complexQuery)).not.toThrow();
    });
  });
});

// Helper functions
async function runCliScript(): Promise<void> {
  try {
    // Adjust this command to match your CLI script
    const { stdout, stderr } = await execAsync(
      "npx cube-ts-gen generate \
  --url http://localhost:4000 \
  --secret test \
  --output ./output/cubes.generated.ts \
  --cube CubeName \
  --zod-schema ./output/query-schema.ts",
      {
        timeout: 30000,
      }
    );

    console.log("CLI Output:", stdout);
    if (stderr) {
      console.warn("CLI Warnings:", stderr);
    }
  } catch (error) {
    console.error("CLI script failed:", error);
    throw error;
  }
}

async function checkFileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

async function importGeneratedFiles(): Promise<void> {
  try {
    // Dynamic import of generated files
    const querySchemaPath = path.resolve(OUTPUT_DIR, "query-schema.ts");
    const cubesPath = path.resolve(OUTPUT_DIR, "cubes.generated.ts");

    // You might need to compile TypeScript files first
    // or adjust these imports based on your setup
    const querySchema = await import(querySchemaPath);
    const cubes = await import(cubesPath);

    validateQuery = querySchema.validateQuery;
    CubeSchema = cubes.CubeSchema;
    test_cube = cubes.test_cube;

    console.log("Generated files imported successfully");
  } catch (error) {
    console.error("Failed to import generated files:", error);
    throw error;
  }
}
