/**
 * Bylineship Wave 3 — NextAuth v5 (Auth.js) configuration.
 *
 * Magic-link email auth for principals and writers. Wasp roles map:
 *   admin        → system operators (Keer, on-call)
 *   head_writer  → Lila (and future head writers)
 *   senior_writer → 2-4 senior writers
 *   principal    → paying retainers (Maya, Diego, Jordan, etc.)
 *
 * Per doc 12 §6:
 *   - Principal can read/write only their own retainer's resources.
 *   - Senior writer can read/write their assigned retainers.
 *   - Head writer can read/write all retainers.
 *   - Admin can rotate keys, view audit logs, trigger backup restore.
 */

import NextAuth from "next-auth";
import type { DefaultSession } from "next-auth";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { users } from "@/db/schema";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users
  } as any),
  providers: [
    // Magic-link email via Resend (or any Nodemailer transport)
    Resend({
      from: "Bylineship <writers@linkedin-b2b-organic.prin7r.com>"
    })
  ],
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = (user as any).role ?? "principal";
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/login?verify=1",
    error: "/login?error=1"
  }
});

/**
 * Role check helpers for use in API routes / server components.
 */
export type UserRole = "admin" | "head_writer" | "senior_writer" | "principal";

export function hasRole(role: string | undefined | null, required: UserRole): boolean {
  const hierarchy: Record<UserRole, number> = {
    admin: 4,
    head_writer: 3,
    senior_writer: 2,
    principal: 1
  };
  const userLevel = hierarchy[role as UserRole] ?? 0;
  return userLevel >= hierarchy[required];
}
