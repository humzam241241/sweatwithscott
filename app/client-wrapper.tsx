"use client";

import { ReactNode, useEffect } from 'react';

export default function ClientWrapper({ children }: { children: ReactNode }) {
  useEffect(() => {
    console.log("Client-only logic runs here.");
  }, []);

  return <>{children}</>;
}
