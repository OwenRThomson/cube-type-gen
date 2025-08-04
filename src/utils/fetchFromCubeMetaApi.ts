import fetch from "node-fetch";
import { MetaApiResponse } from "../lib/types/internal-types";

/**
 * Fetches metadata from the Cube.js API.
 *
 * @param url - The base URL of the Cube.js API.
 * @param token - Optional Bearer token for authentication.
 * @returns A promise that resolves to the metadata response from the API.
 * @throws {Error} If the HTTP response is not OK.
 */
export async function fetchFromCubeMetaApi(
  url: string,
  token?: string
): Promise<MetaApiResponse> {
  const headers: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const response = await fetch(`${url}/cubejs-api/v1/meta`, { headers });

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
  }

  return (await response.json()) as MetaApiResponse;
}
