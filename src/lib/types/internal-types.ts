export interface CubeTypesConfig {
  apiUrl?: string;
  apiSecret?: string;
  securityContext?: Record<string, any>;
  groupDelimiter?: string;
}

export interface MetaApiResponse {
  message?: string;
  cubes?: Array<CubeMetadata>;
  [key: string]: any;
}

// Response from Cube Meta Api
export interface CubeMetadata {
  segments: any;
  dimensions: any;
  measures: any;
  name: string;
  title: string;
}

// Options for the generate command
export interface GenerateOptions {
  config: string;
  url?: string;
  secret?: string;
  output: string;
  cube?: string;
  zodSchema?: string;
  delimiter?: string;
}

export interface ProcessedOptions extends GenerateOptions {
  resolvedUrl: string;
  resolvedSecret?: string;
  token?: string;
}
