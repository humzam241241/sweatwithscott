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
      <body className="bg-brand-light text-brand-dark pt-20 md:pt-24">
        <Navigation />
        <DataProvider>
          {children}
        </DataProvider>
      </body>
    </html>
  );
}
