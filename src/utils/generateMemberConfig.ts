/**
 * Infers the filter type for a given cube type. from the Cube.js Type
 *
 * @param cubeType - The type of the cube member (e.g., "string", "number", "count", "sum", "avg", "min", "max", "time", "boolean").
 * @returns The inferred filter type: "string", "number", "time", or "none".
 */
function inferFilterType(
  cubeType: string
): "string" | "number" | "time" | "none" {
  switch (cubeType) {
    case "string":
      return "string";
    case "number":
    case "count":
    case "sum":
    case "avg":
    case "min":
    case "max":
      return "number";
    case "time":
      return "time";
    case "boolean":
      return "none";
    default:
      return "string"; // fallback
  }
}

/**
 * Generates a member configuration string based on the provided cube type.
 *
 * Infers the filter type from the given `cubeType` and returns the corresponding
 * member configuration string for use in Cube.js schema definitions.
 *
 * @param cubeType - The type of the cube to infer the filter type from.
 * @returns The member configuration string, such as "m.string", "m.number", "m.time", or "m.boolean".
 */
export function generateMemberConfig(cubeType: string): string {
  const filterType = inferFilterType(cubeType);

  switch (filterType) {
    case "string":
      return "m.string";
    case "number":
      return "m.number";
    case "time":
      return "m.time";
    case "none":
      return "m.boolean";
    default:
      return "m.string";
  }
}
