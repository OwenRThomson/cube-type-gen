import { zodSchemaTemplate } from "../templates/zodSchemaTemplate";
import { cubeDefTemplate } from "../templates/cubeDefTemplate";
import { generateMemberConfig } from "../../utils/generateMemberConfig";
import { cubeSchemaExportTemplate } from "../templates/cubeDefTemplate";
import {
  cubeInstanceTemplate,
  cubeTypeTemplate,
} from "../templates/cubeDefTemplate";
import { CubeMetadata } from "../types/internal-types";

export class CodeGeneratorService {
  /**
   * Generates TypeScript code for cube definitions, including necessary imports,
   * cube definitions, and a schema export. The generated code is formatted using
   * a template function.
   *
   * @param cubes - An array of cube objects to generate definitions for.
   * @param delimiter - Optional delimiter to use in the schema export.
   * @returns The generated TypeScript code as a string.
   */
  generateCubeDefCode(cubes: CubeMetadata[], delimiter?: string): string {
    return cubeDefTemplate({
      imports: `import { CubeDef, m } from "./cube-types";\n\n`,
      cubeDefinitions: this.generateCubeDefinitions(cubes),
      cubeSchemaExport: this.generateCubeSchemaExport(cubes, delimiter),
    });
  }

  /**
   * Generates a Zod schema string based on the provided cube metadata.
   *
   * This method extracts all measures, dimensions, time dimensions, and segments from the given cubes (from the meta api),
   * creates Zod enums for each, and passes them to a template function to produce the final schema, as a ts string, which can be written to a file.
   *
   * @param cubes - An array of {@link CubeMetadata} objects representing the cubes to generate the schema from.
   * @returns A string containing the generated Zod schema.
   */
  generateZodSchema(cubes: CubeMetadata[]): string {
    const { allMeasures, allDimensions, allTimeDimensions, allSegments } =
      this.extractAllMembers(cubes);

    return zodSchemaTemplate({
      measuresEnum: this.createZodEnum(allMeasures),
      dimensionsEnum: this.createZodEnum(allDimensions),
      timeDimensionsEnum: this.createZodEnum(allTimeDimensions),
      segmentsEnum: this.createZodEnum(allSegments),
    });
  }

  /**
   * Generates a cube schema object which is just a large directory object of all of your cubes, optionally nested if your names are delimited.
   *
   * @param cubes - An array of `CubeMetadata` objects representing the cubes to include in the schema.
   * @param delimiter - An optional string used to split cube names for nested schema generation.
   * @returns An object representing the generated schema, with cube names mapped to safe variable names, possibly nested.
   */
  generateCubeSchema(cubes: CubeMetadata[], delimiter?: string): any {
    const schema: any = {};

    cubes.forEach((cube) => {
      const cubeName = cube.name;

      if (delimiter) {
        const pathParts = cubeName.split(delimiter);
        this.createNestedObject(pathParts, cubeName, schema);
      } else {
        schema[cubeName] = cubeName;
      }
    });

    return schema;
  }

  private generateCubeDefinitions(cubes: CubeMetadata[]): string {
    return cubes
      .map((cube) => {
        const cubeName = cube.name;

        const measuresEntries = this.generateMemberEntries(cube.measures || []);
        const dimensionsEntries = this.generateMemberEntries(
          cube.dimensions || []
        );
        const segments = this.generateSegments(cube.segments || []);

        const instanceDef = cubeInstanceTemplate({
          title: cube.title || cubeName,
          cubeName,
          measuresEntries,
          dimensionsEntries,
          segments,
        });

        const typeDef = cubeTypeTemplate({ cubeName });
        return `${instanceDef}\n\n${typeDef}`;
      })
      .join("\n\n");
  }

  private generateMemberEntries(members: any[]): string {
    return members
      .map((member) => {
        const memberName = member.name.split(".").pop();
        const memberConfig = generateMemberConfig(member.type);
        return `  ${memberName}: ${memberConfig},`;
      })
      .join("\n");
  }

  private generateSegments(segments: CubeMetadata[]): string {
    return segments
      .map((segment) => `"${segment.name.split(".").pop()}"`)
      .join(", ");
  }

  private generateCubeSchemaExport(
    cubes: CubeMetadata[],
    delimiter?: string
  ): string {
    const schemaStructure = this.generateCubeSchema(cubes, delimiter);
    const schemaObjectCode = this.generateSchemaObjectCode(schemaStructure);
    const schemaTypeCode = this.generateTypeForSchema(schemaStructure, cubes);

    const delimiterComment = delimiter
      ? ` (delimiter: "${delimiter}")`
      : " (flat structure)";

    return cubeSchemaExportTemplate({
      delimiterComment,
      schemaObjectCode,
      schemaTypeCode,
    });
  }

  private extractAllMembers(cubes: CubeMetadata[]): {
    allMeasures: string[];
    allDimensions: string[];
    allTimeDimensions: string[];
    allSegments: string[];
  } {
    const allMeasures: string[] = [];
    const allDimensions: string[] = [];
    const allTimeDimensions: string[] = [];
    const allSegments: string[] = [];

    cubes.forEach((cube) => {
      cube.measures?.forEach((measure: any) => {
        allMeasures.push(measure.name);
      });

      cube.dimensions?.forEach((dimension: any) => {
        allDimensions.push(dimension.name);
        if (dimension.type === "time") {
          allTimeDimensions.push(dimension.name);
        }
      });

      cube.segments?.forEach((segment: any) => {
        allSegments.push(segment.name);
      });
    });

    return { allMeasures, allDimensions, allTimeDimensions, allSegments };
  }

  private createZodEnum(items: string[]): string {
    return items.length > 0
      ? `z.enum([${items.map((item) => `"${item}"`).join(", ")}])`
      : `z.never()`;
  }

  private createNestedObject(
    path: string[],
    value: any,
    target: any = {}
  ): any {
    if (path.length === 0) return value;
    if (path.length === 1) {
      target[path[0]] = value;
      return target;
    }

    const [head, ...tail] = path;
    if (!target[head]) {
      target[head] = {};
    }
    this.createNestedObject(tail, value, target[head]);
    return target;
  }

  private generateSchemaObjectCode(
    schemaStructure: any,
    indent: string = "  "
  ): string {
    const entries: string[] = [];

    for (const [key, value] of Object.entries(schemaStructure)) {
      if (typeof value === "string") {
        entries.push(`${indent}${key}: ${value},`);
      } else {
        entries.push(`${indent}${key}: {`);
        entries.push(this.generateSchemaObjectCode(value, indent + "  "));
        entries.push(`${indent}},`);
      }
    }

    return entries.join("\n");
  }

  private generateTypeForSchema(schemaStructure: any, cubes: any[]): string {
    const generateNestedType = (obj: any): string => {
      const entries: string[] = [];

      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "string") {
          const cube = cubes.find(
            (c) => c.name.replace(/[^a-zA-Z0-9]/g, "_") === value
          );
          const typeName = cube ? `${value}Type` : "any";
          entries.push(`  ${key}: ${typeName};`);
        } else {
          entries.push(`  ${key}: {`);
          entries.push(
            generateNestedType(value)
              .split("\n")
              .map((line) => `  ${line}`)
              .join("\n")
          );
          entries.push(`  };`);
        }
      }

      return entries.join("\n");
    };

    return generateNestedType(schemaStructure);
  }
}
