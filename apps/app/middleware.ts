/**
 * Bylineship Wave 3 — auth middleware.
 *
 * Protects dashboard routes. The API routes handle their own auth checks.
 */
export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"]
};
