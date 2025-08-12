import "./globals.css";
import Navigation from "@/components/navigation";
import { DataProvider } from "@/components/ui/data-provider";
import type { ReactNode } from "react";
import Script from "next/script";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-brand-light text-brand-dark">
        <Script id="current-user-id" strategy="beforeInteractive">
          {`
            (async function(){
              try{
                const resp = await fetch('/api/auth/me');
                if(resp.ok){ const s = await resp.json(); window.CURRENT_USER_ID = s.userId; }
              }catch{}
            })();
          `}
        </Script>
        <Navigation />
        <SessionProvider>
          <DataProvider>
            <main>
              {children}
            </main>
          </DataProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

// Note: global styles loaded at top of file
