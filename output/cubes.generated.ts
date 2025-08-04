// The generated output file needs to be @/cube-ts-gen
// I can't get the tsconfig to recognise the alias
import { CubeDef, m } from "../src/index";

// Cube Name
export const CubeName = new CubeDef({
  name: "CubeName",
  measures: {
    count: m.number,
  },
  dimensions: {
    dimension: m.string,
  },
  segments: [],
});

export type CubeNameType = typeof CubeName;
// Export all cubes in schema structure (flat structure)
export const CubeSchema = {
  CubeName: CubeName,
};

export type CubeSchemaType = {
  CubeName: CubeNameType;
};
