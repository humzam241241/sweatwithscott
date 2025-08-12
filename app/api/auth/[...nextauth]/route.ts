import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

const handler = NextAuth(authOptions);

// Force dynamic to ensure OAuth flow isn't statically optimized/cached
export const dynamic = "force-dynamic";

export { handler as GET, handler as POST };
