/**
 * Bylineship Wave 3 — health check endpoint.
 * GET /api/healthz
 *
 * Returns DB connectivity, Redis status, and uptime. Used by Traefik
 * health checks and Coolify monitoring. No auth.
 */

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  let dbOk = false;
  let redisOk = false;
  const checks: Record<string, string> = {};

  // DB check
  try {
    const { db } = await import("@/db");
    await db.execute("SELECT 1");
    dbOk = true;
    checks.db = "ok";
  } catch (err) {
    checks.db = `error: ${(err as Error).message.slice(0, 100)}`;
  }

  // Redis check
  try {
    const REDIS_URL = process.env.REDIS_URL;
    if (REDIS_URL) {
      const { Redis } = await import("ioredis");
      const redis = new Redis(REDIS_URL, { connectTimeout: 2000, maxRetriesPerRequest: 1 });
      await redis.ping();
      redis.disconnect();
      redisOk = true;
      checks.redis = "ok";
    } else {
      checks.redis = "not_configured";
    }
  } catch (err) {
    checks.redis = `error: ${(err as Error).message.slice(0, 100)}`;
  }

  const healthy = dbOk; // Redis is optional at Phase 0

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      version: "0.1.0",
      checks
    },
    { status: healthy ? 200 : 503 }
  );
}
