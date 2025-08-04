export interface ZodSchemaTemplateParams {
  measuresEnum: string;
  dimensionsEnum: string;
  timeDimensionsEnum: string;
  segmentsEnum: string;
}

export const zodSchemaTemplate = ({
  measuresEnum,
  dimensionsEnum,
  timeDimensionsEnum,
  segmentsEnum,
}: ZodSchemaTemplateParams) => `import { z } from "zod";
import type { 
  Query, 
  Filter, 
  TimeDimension as CubeTimeDimension,
  BinaryOperator,
  UnaryOperator,
  QueryOrder,
  TQueryOrderObject,
  TQueryOrderArray
} from "@cubejs-client/core";

// Re-export the main Query type for convenience
export type { Query as CubeQuery } from "@cubejs-client/core";

// Zod schemas for operators (using existing types)
const BinaryOperatorSchema = z.enum([
  "equals", "notEquals", "contains", "notContains", "startsWith", "notStartsWith",
  "endsWith", "notEndsWith", "gt", "gte", "lt", "lte", 
  "inDateRange", "notInDateRange", "beforeDate", "beforeOrOnDate",
  "afterDate", "afterOrOnDate"
]);

const UnaryOperatorSchema = z.enum(["set", "notSet"]);

const QueryOrderSchema = z.enum(["asc", "desc", "none"]);

// Available cube members (generated from your cubes)
const MeasureNameSchema = ${measuresEnum};
const DimensionNameSchema = ${dimensionsEnum};
const TimeDimensionNameSchema = ${timeDimensionsEnum};
const SegmentNameSchema = ${segmentsEnum};

// Union of all members
const MemberNameSchema = z.union([MeasureNameSchema, DimensionNameSchema]);

// Date range schema (supports various formats)
const DateRangeSchema = z.union([
  z.string(), // Relative dates like "last week"
  z.tuple([z.string(), z.string()]), // Date range as tuple
]);

// Binary filter schema
const BinaryFilterSchema = z.object({
  member: MemberNameSchema.optional(),
  dimension: z.string().optional(), // deprecated but still supported
  operator: BinaryOperatorSchema,
  values: z.array(z.string())
});

// Unary filter schema  
const UnaryFilterSchema = z.object({
  member: MemberNameSchema.optional(),
  dimension: z.string().optional(), // deprecated but still supported
  operator: UnaryOperatorSchema,
  values: z.never().optional()
});

// Logical filters (recursive)
const LogicalFilterSchema: z.ZodType<Filter> = z.lazy(() => z.union([
  BinaryFilterSchema,
  UnaryFilterSchema,
  z.object({
    and: z.array(LogicalFilterSchema)
  }),
  z.object({
    or: z.array(LogicalFilterSchema)
  })
]));

// Time dimension schema
const TimeDimensionSchema = z.object({
  dimension: TimeDimensionNameSchema,
  granularity: z.string().optional(),
  dateRange: DateRangeSchema.optional(),
  compareDateRange: z.array(DateRangeSchema).optional()
});

// Order schemas
const QueryOrderObjectSchema = z.record(z.string(), QueryOrderSchema);
const QueryOrderArraySchema = z.array(z.tuple([z.string(), QueryOrderSchema]));

// Main query schema that validates against Cube.js Query interface
export const CubeQuerySchema = z.object({
  measures: z.array(MeasureNameSchema).optional(),
  dimensions: z.array(DimensionNameSchema).optional(),
  filters: z.array(LogicalFilterSchema).optional(),
  timeDimensions: z.array(TimeDimensionSchema).optional(),
  segments: z.array(SegmentNameSchema).optional(),
  limit: z.number().int().positive().nullable().optional(),
  rowLimit: z.number().int().positive().nullable().optional(),
  offset: z.number().int().min(0).optional(),
  order: z.union([
    QueryOrderObjectSchema, 
    QueryOrderArraySchema
  ]).optional(),
  timezone: z.string().optional(),
  renewQuery: z.boolean().optional(),
  ungrouped: z.boolean().optional(),
  responseFormat: z.enum(["compact", "default"]).optional(),
  total: z.boolean().optional()
}) satisfies z.ZodType<Query>;

// Array of queries for data blending
export const CubeQueriesSchema = z.array(CubeQuerySchema);
export type CubeQueries = z.infer<typeof CubeQueriesSchema>;

// Validation helper functions
export const validateQuery = (query: unknown): Query => {
  return CubeQuerySchema.parse(query);
};

export const validateQueries = (queries: unknown): CubeQueries => {
  return CubeQueriesSchema.parse(queries);
};

export const isValidQuery = (query: unknown): query is Query => {
  return CubeQuerySchema.safeParse(query).success;
};

export const isValidQueries = (queries: unknown): queries is CubeQueries => {
  return CubeQueriesSchema.safeParse(queries).success;
};

// Helper schemas for individual components (if needed separately)
export const CubeFilterSchema = LogicalFilterSchema;
export const CubeTimeDimensionSchema = TimeDimensionSchema;

// Available members for runtime introspection
export const availableMembers = {
  measures: [], // fill in at runtime
  dimensions: [],
  timeDimensions: [],
  segments: []
} as const;
`;
