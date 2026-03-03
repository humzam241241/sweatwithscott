"use client";
import React, { useState } from "react";

export default function CheckInPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<any | null>(null);
  const [message, setMessage] = useState<string>("");
  const [waiverNeeded, setWaiverNeeded] = useState(false);
  const [waiverAccept, setWaiverAccept] = useState(false);

  const search = async () => {
    setMessage("");
    const res = await fetch(`/api/user/profile?username=${encodeURIComponent(query)}`);
    const j = res.ok ? await res.json() : null;
    setResult(j);
    setWaiverNeeded(Boolean(j && !j.waiver_signed_at));
  };

  const mark = async (opts?: { paid?: boolean }) => {
    if (!result?.username && !result?.email) return;
    const r = await fetch('/api/admin/checkin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identifier: result.email || result.username, markPaid: Boolean(opts?.paid) }) });
    if (r.ok) setMessage('Checked in'); else setMessage('Failed to check in');
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
              {waiverNeeded && (
                <div className="mt-3 p-3 rounded bg-yellow-50 border border-yellow-200 text-sm text-yellow-900">
                  <p className="mb-2 font-medium">Waiver required</p>
                  <div className="h-24 overflow-auto p-2 bg-white border text-xs text-gray-700 rounded">
                    By checking this box, I agree to the Cave Boxing liability waiver (v1)...
                  </div>
                  <label className="mt-2 flex items-center gap-2">
                    <input type="checkbox" checked={waiverAccept} onChange={(e)=>setWaiverAccept(e.target.checked)} />
                    I accept the waiver (v1)
                  </label>
                  <button
                    className="mt-2 px-3 py-2 bg-black text-white rounded disabled:opacity-50"
                    disabled={!waiverAccept}
                    onClick={async ()=>{
                      await fetch('/api/user/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: result.userId, waiverAccept: true }) });
                      setWaiverNeeded(false);
                    }}
                  >
                    Save Waiver
                  </button>
                </div>
              )}
            <div className="mt-2 flex gap-2">
              <button className="px-3 py-2 bg-red-600 text-white rounded" onClick={()=>mark()}>Mark attended</button>
              <button className="px-3 py-2 bg-green-600 text-white rounded" onClick={()=>mark({ paid:true })}>Check-in + Paid</button>
            </div>
          </div>
        )}
        {message && <div className="text-green-700 text-sm">{message}</div>}
      </div>
    </div>
  );
}


