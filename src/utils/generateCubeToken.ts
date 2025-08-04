import jwt from "jsonwebtoken";

/**
 * Generates a JWT token by signing the provided security context with the given secret.
 *
 * @param securityContext - The payload to be signed and included in the JWT.
 * @param secret - The secret key used to sign the JWT.
 * @returns A promise that resolves to the signed JWT token as a string.
 * @throws {Error} If signing the security context fails.
 */
export async function generateCubeToken(
  securityContext: any,
  secret: string
): Promise<string> {
  try {
    return jwt.sign(securityContext, secret);
  } catch (err) {
    throw new Error(`Failed to sign security context: ${err}`);
  }
}
