import "./globals.css";
import Navbar from "@/components/Navbar";
import { DataProvider } from "@/components/ui/data-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-brand-light text-brand-dark">
        <DataProvider>
          <Navbar />
          <div className="pt-24">{children}</div>
        </DataProvider>
      </body>
    </html>
  );
}
