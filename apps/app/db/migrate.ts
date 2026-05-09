/**
 * Bylineship Wave 3 — database migration runner.
 *
 * Applies Drizzle migrations from ./migrations/ against the DATABASE_URL.
 * Run: `npx tsx db/migrate.ts`
 */

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}
const dbUrl: string = DATABASE_URL;

async function main() {
  const client = postgres(dbUrl, { max: 1 });
  const db = drizzle(client);

  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "./db/migrations" });
  console.log("Migrations complete.");

  await client.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
