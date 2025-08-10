import "./globals.css";
import Navigation from "@/components/navigation";
import { DataProvider } from "@/components/ui/data-provider";
import type { ReactNode } from "react";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-brand-light text-brand-dark">
        <Navigation />
        <DataProvider>
          <main>
            {children}
          </main>
        </DataProvider>
      </body>
    </html>
  );
}

import './globals.css'
