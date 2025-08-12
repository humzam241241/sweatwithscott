import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, account }) {
      // Enrich once; never return `user` directly as the token.
      if (user && account) {
        token.user = {
          name: user.name ?? null,
          email: user.email ?? null,
          image: user.image ?? null,
        } as any;
      }
      return token;
    },
    async session({ session, token }) {
      if ((token as any)?.user) session.user = (token as any).user as any;
      return session;
    },
  },
  pages: { signIn: "/signin" },
  secret: process.env.NEXTAUTH_SECRET,
  // debug: true, // enable temporarily if needed
};


