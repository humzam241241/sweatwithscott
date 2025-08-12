import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

function getAdminEmails(): string[] {
  const set = new Set<string>();
  const list = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  list.forEach((e) => set.add(e));
  const single = (process.env.ADMIN_EMAIL || process.env.GOOGLE_ADMIN_EMAIL || "").trim().toLowerCase();
  if (single) set.add(single);
  return Array.from(set);
}

const providers: NextAuthOptions["providers"] = [
  Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: creds.email } });
        if (!user?.passwordHash) return null;
        const ok = await bcrypt.compare(creds.password, user.passwordHash);
        return ok ? { id: user.id, email: user.email ?? undefined, name: user.name ?? undefined } : null;
      },
  }),
];

// Add Google only when keys are present to avoid confusing invalid_client errors in dev
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers,
  pages: { signIn: "/signin" },
  callbacks: {
    async jwt({ token, user }) {
      // Mark admin based on email allowlist
      const adminEmails = getAdminEmails();
      const email = (user?.email || token.email || "").toLowerCase();
      const isAdmin = email && adminEmails.includes(email);
      if (typeof isAdmin === "boolean") (token as any).isAdmin = isAdmin;
      if (user?.id) (token as any).id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token as any).id;
        (session.user as any).isAdmin = Boolean((token as any).isAdmin);
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account }) {
      try {
        const adminEmails = getAdminEmails();
        const email = String((user as any)?.email || "").toLowerCase();
        const isAdmin = email && adminEmails.includes(email);
        if (!isAdmin && (account?.provider === "google")) {
          // Ensure a Member row exists for non-admin Google users
          await prisma.member.upsert({
            where: { userId: String((user as any).id) },
            update: {},
            create: { userId: String((user as any).id), status: "active" },
          });
        }
      } catch {}
    },
  },
};


