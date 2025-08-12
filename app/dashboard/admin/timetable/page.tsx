"use client";
import Link from "next/link";

export default function ManageTimetablePage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="mb-6 text-2xl font-semibold">Manage Timetable</h1>
      <div className="rounded-lg bg-gray-900 border border-gray-700 overflow-hidden">
        <div className="p-3 text-sm text-gray-400 flex items-center justify-between">
          <span>Embedded live schedule editor</span>
          <Link href="/admin/schedule" className="px-3 py-1 rounded bg-red-600 hover:bg-red-700">Open Full Calendar</Link>
        </div>
        <iframe title="admin-schedule" src="/admin/schedule/embed" className="w-full h-[800px] bg-white" />
      </div>
    </div>
  );
}


