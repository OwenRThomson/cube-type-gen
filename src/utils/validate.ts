import { MetaApiResponse } from "../lib/types/internal-types";
/**
 * Validates the structure of the Meta API response.
 * @param data - The Meta API response data.
 * @returns True if the response is valid, false otherwise.
 */
export function isValidMetaResponse(data: MetaApiResponse): boolean {
  return Array.isArray(data?.cubes) && data.cubes.length > 0;
}
