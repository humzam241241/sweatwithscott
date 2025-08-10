import "./globals.css";
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
        <DataProvider>
          {children}
        </DataProvider>
      </body>
    </html>
  );
}
