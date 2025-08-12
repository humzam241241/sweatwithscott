"use client";
import Link from "next/link";

export default function ManageTimetablePage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="mb-6 text-2xl font-semibold">Manage Timetable</h1>
      <div className="rounded-lg bg-gray-900 border border-gray-700 overflow-hidden">
        <Toolbar />
        <iframe title="admin-schedule" src="/admin/schedule/embed" className="w-full h-[800px] bg-white" />
      </div>
    </div>
  );
}

function Toolbar() {
  async function regenerate() {
    await fetch('/api/admin/classes/instances/regenerate', { method: 'POST' });
    // reload iframe by force-changing src
    const ifr = document.querySelector('iframe[title="admin-schedule"]') as HTMLIFrameElement | null;
    if (ifr) {
      const src = ifr.src;
      ifr.src = src;
    }
  }
  return (
    <div className="p-3 text-sm text-gray-400 flex items-center justify-between">
      <span>Embedded live schedule editor</span>
      <div className="flex items-center gap-2">
        <button onClick={regenerate} className="px-3 py-1 rounded border border-gray-600 hover:bg-gray-800">Regenerate next 30 days</button>
        <Link href="/admin/schedule" className="px-3 py-1 rounded bg-red-600 hover:bg-red-700">Open Full Calendar</Link>
      </div>
    </div>
  );
}



