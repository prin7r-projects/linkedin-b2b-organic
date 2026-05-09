/**
 * Bylineship Wave 3 — database connection (Drizzle + Postgres.js).
 *
 * Single connection pool per process. The DATABASE_URL env var points to the
 * Postgres instance on Coolify (server 144.91.94.91).
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";
import { requiredEnv } from "@/lib/env";

const connectionString = requiredEnv("DATABASE_URL");

// Pool used by all server-side queries
const client = postgres(connectionString, {
  max: 10, // cohort cap = 6 retainers/month; 10 concurrent is generous
  idle_timeout: 20,
  connect_timeout: 10
});

export const db = drizzle(client, { schema });

export type DbClient = typeof db;
export type DrizzleSchema = typeof schema;
