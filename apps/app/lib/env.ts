/**
 * Bylineship Wave 3 — env helpers.
 *
 * Pattern matched from apps/landing/lib/env.ts.
 * All secrets live in process.env (never committed). The app reads them at
 * request time; no startup-time env validation that prevents cold boots.
 */

export class MissingEnvError extends Error {
  envName: string;
  constructor(envName: string) {
    super(`Missing required environment variable: ${envName}`);
    this.name = "MissingEnvError";
    this.envName = envName;
  }
}

export function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new MissingEnvError(name);
  return value;
}

export function optionalEnv(name: string): string | undefined {
  return process.env[name] || undefined;
}

export function appUrlFromRequest(request: Request): string {
  const header = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "localhost:3001";
  const proto = (request.headers.get("x-forwarded-proto") ?? "https").split(",")[0].trim();
  return `${proto}://${header}`;
}
