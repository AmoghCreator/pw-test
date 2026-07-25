import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

const client = new SecretManagerServiceClient();

/**
 * Fetches a secret from Google Cloud Secret Manager.
 * Falls back to process.env[secretName] for local development.
 *
 * This is the ONLY place in the codebase that reads GEMINI_API_KEY.
 * Import this in route handlers only (server-side).
 */
export async function getSecret(
  secretName: string,
  version: string = "latest"
): Promise<string> {
  const envValue = process.env[secretName];
  if (envValue) {
    return envValue;
  }

  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  if (!projectId) {
    throw new Error(
      `GOOGLE_CLOUD_PROJECT is not set and ${secretName} was not found in environment. ` +
        `Add ${secretName} to .env.local for local development.`
    );
  }

  const name = `projects/${projectId}/secrets/${secretName}/versions/${version}`;

  try {
    const [response] = await client.accessSecretVersion({ name });
    const payload = response.payload?.data?.toString();

    if (!payload) {
      throw new Error(`Empty payload for secret: ${secretName}`);
    }

    return payload;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[SecretManager] Failed to fetch ${secretName}:`, message);
    throw err;
  }
}
