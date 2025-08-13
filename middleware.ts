import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only handle dashboard routes
  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();

  // Read NextAuth JWT if present
  let isAdmin = false;
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    isAdmin = Boolean((token as any)?.isAdmin);
  } catch {}

  // Fallback to legacy cookie session
  if (!isAdmin) {
    try {
      const legacy = req.cookies.get("session")?.value;
      if (legacy) {
        const parsed = JSON.parse(legacy);
        isAdmin = Boolean(parsed?.isAdmin);
      }
    } catch {}
  }

  // Block non-admins from accessing admin dashboard
  if (pathname.startsWith("/dashboard/admin") && !isAdmin) {
    url.pathname = "/dashboard/member";
    return NextResponse.redirect(url);
  }

  // For all dashboard routes, ensure user is authenticated via either method
  const isAuthed = isAdmin || Boolean(req.cookies.get("session")?.value) || Boolean(await getToken({ req, secret: process.env.NEXTAUTH_SECRET }));
  if (!isAuthed) {
    url.pathname = "/signin";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};


