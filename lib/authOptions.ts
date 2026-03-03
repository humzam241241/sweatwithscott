import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";

function getAdminEmails(): string[] {
  // Hard-lock to a single admin email as requested
  const hardcoded = (process.env.ADMIN_EMAIL || process.env.GOOGLE_ADMIN_EMAIL || "mystrey827@gmail.com").trim().toLowerCase();
  return [hardcoded];
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      const email = String((user as any)?.email || token.email || "").toLowerCase();
      const isAdmin = email && getAdminEmails().includes(email);
      (token as any).isAdmin = Boolean(isAdmin);
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).isAdmin = Boolean((token as any).isAdmin);
      return session;
    },
    async redirect({ baseUrl, token }) {
      const isAdmin = Boolean((token as any)?.isAdmin);
      return isAdmin ? `${baseUrl}/dashboard/admin` : `${baseUrl}/dashboard/member`;
    },
  },
  events: {
    async signIn({ user, account }) {
      try {
        if (account?.provider === "google") {
          const email = String((user as any)?.email || "").toLowerCase();
          const isAdmin = email && getAdminEmails().includes(email);
          if (!isAdmin) {
            await prisma.member.upsert({
              where: { userId: String((user as any).id) },
              update: {},
              create: { userId: String((user as any).id), status: "active" },
            });
          }
        }
      } catch {}
    },
  },
  pages: { signIn: "/signin" },
  secret: process.env.NEXTAUTH_SECRET,
  // debug: true,
};


