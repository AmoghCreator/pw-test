import "server-only";
import { Logging, type Entry } from "@google-cloud/logging";
import { LOG_NAME } from "@/lib/constants";

const logging = new Logging();
const log = logging.log(LOG_NAME);

interface LogMeta {
  event: string;
  [key: string]: unknown;
}

/**
 * Writes a structured event to Google Cloud Logging.
 * Failures are logged via console.error — logging never breaks the main flow.
 * Import only in server-side route handlers.
 */
export async function writeLog(meta: LogMeta): Promise<void> {
  try {
    const entry: Entry = log.entry(
      { resource: { type: "cloud_run_revision" } },
      meta
    );
    await log.write(entry);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[CloudLogging] Non-fatal write failure: ${message}`);
  }
}
