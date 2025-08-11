"use client";
import { useEffect } from "react";
import AdminSchedulePage from "../page";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AdminScheduleEmbed() {
  useEffect(() => {
    // Hide global navigation when embedded
    const nav = document.querySelector('.cave-navbar') as HTMLElement | null;
    if (nav) nav.style.display = 'none';
    const main = document.querySelector('main') as HTMLElement | null;
    if (main) main.style.paddingTop = '0px';
    return () => { if (nav) nav.style.display = ""; };
  }, []);
  return (
    <div className="p-0 m-0">
      <AdminSchedulePage />
    </div>
  );
}


