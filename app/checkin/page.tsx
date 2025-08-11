"use client";
import React, { useState } from "react";

export default function CheckInPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<any | null>(null);
  const [message, setMessage] = useState<string>("");

  const search = async () => {
    setMessage("");
    const res = await fetch(`/api/user/profile?username=${encodeURIComponent(query)}`);
    setResult(res.ok ? await res.json() : null);
  };

  const mark = async () => {
    if (!result?.userId) return;
    await fetch('/api/admin/mark-attendance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingId: result.nextBookingId, attended: true }) });
    setMessage('Checked in');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-3">
        <h1 className="text-xl font-semibold">Check-in</h1>
        <div className="flex gap-2">
          <input className="flex-1 border rounded px-3 py-2" placeholder="Search name or email" value={query} onChange={(e)=>setQuery(e.target.value)} />
          <button className="px-3 py-2 bg-black text-white rounded" onClick={search}>Search</button>
        </div>
        {result && (
          <div className="rounded border p-3">
            <div className="font-medium">{result.fullName ?? result.username}</div>
            <div className="text-sm text-gray-500">{result.email}</div>
            <button className="mt-2 px-3 py-2 bg-red-600 text-white rounded" onClick={mark}>Mark attended</button>
          </div>
        )}
        {message && <div className="text-green-700 text-sm">{message}</div>}
      </div>
    </div>
  );
}


