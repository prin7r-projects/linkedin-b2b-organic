/**
 * Bylineship Wave 3 — instrumentation bootstrap.
 *
 * Called once at app startup (instrumentation.ts). Bootstraps BullMQ workers
 * when REDIS_URL is configured. Does NOT block the server from starting.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.REDIS_URL) {
    const { bootstrapWorkers } = await import("@/workers");
    bootstrapWorkers();
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: "info",
        event: "instrumentation_registered"
      })
    );
  }
}
