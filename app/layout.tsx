import type { Metadata } from 'next';
import './globals.css';
import ClientWrapper from './client-wrapper';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="flex bg-white text-black">
        <Navigation />
        <ClientWrapper>
          <div className="flex-1 md:ml-56 min-h-screen flex flex-col">
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ClientWrapper>
      </body>
    </html>
  );
}
