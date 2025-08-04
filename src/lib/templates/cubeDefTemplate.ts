export interface CubeTypeTemplateParams {
  cubeName: string;
}

/**
 * Generates a TypeScript type definition template for a given cube name.
 * `export type ${cubeName}Type = typeof ${cubeName};`
 *
 * @param cubeName - The name of the cube to generate the type for.
 * @returns A string containing the type definition for the specified cube.
 */
export const cubeTypeTemplate = ({ cubeName }: CubeTypeTemplateParams) =>
  `export type ${cubeName}Type = typeof ${cubeName};`;

export const cubeDefTemplate = ({
  imports,
  cubeDefinitions,
  cubeSchemaExport,
}: {
  imports: string;
  cubeDefinitions: string;
  cubeSchemaExport: string;
}) => `
${imports}
${cubeDefinitions}
${cubeSchemaExport}
`;

export interface CubeInstanceTemplateParams {
  title: string;
  cubeName: string;
  measuresEntries: string;
  dimensionsEntries: string;
  segments: string;
}

export const cubeInstanceTemplate = ({
  title,
  cubeName,
  measuresEntries,
  dimensionsEntries,
  segments,
}: CubeInstanceTemplateParams) => `// ${title}
  export const ${cubeName} = new CubeDef({
  name: "${cubeName}",
  measures: {
    ${measuresEntries}
  },
  dimensions: {
    ${dimensionsEntries}
  },
  segments: [${segments}],
});`;

export interface CubeSchemaExportTemplateParams {
  delimiterComment: string;
  schemaObjectCode: string;
  schemaTypeCode: string;
}

export const cubeSchemaExportTemplate = ({
  delimiterComment,
  schemaObjectCode,
  schemaTypeCode,
}: CubeSchemaExportTemplateParams) => `// Export all cubes in schema structure${delimiterComment}
export const CubeSchema = {
  ${schemaObjectCode}
};

export type CubeSchemaType = {
  ${schemaTypeCode}
};`;
