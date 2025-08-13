import "./globals.css";
import Navigation from "@/components/navigation";
import { DataProvider } from "@/components/ui/data-provider";
import type { ReactNode } from "react";
import Script from "next/script";
import AuthSessionProvider from "@/components/auth-session-provider";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-brand-light text-brand-dark">
        {/* Remove auto-auth context on boot; site should start signed-out */}
        <Navigation />
        <AuthSessionProvider>
          <DataProvider>
            <main>
              {children}
            </main>
          </DataProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}

// Note: global styles loaded at top of file
