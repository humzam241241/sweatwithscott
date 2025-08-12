export { default } from "next-auth/middleware";

// Protect only private areas
export const config = {
  matcher: ["/dashboard/:path*"],
};


