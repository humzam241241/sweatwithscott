"use client";

import { useEffect, useState } from "react";

type QueueRow = {
  id: number;
  recipient_handle?: string;
  full_name?: string;
  email?: string;
  interest?: string;
  message_template?: string;
  status: "pending" | "sent" | "skipped";
  created_at: string;
};

export default function DmQueueAdminPage() {
  const [rows, setRows] = useState<QueueRow[]>([]);

  const load = async () => {
    const res = await fetch("/api/admin/dm-queue", { cache: "no-store" });
    if (!res.ok) return;
    setRows(await res.json());
  };

  const updateStatus = async (id: number, status: QueueRow["status"]) => {
    await fetch("/api/admin/dm-queue", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    load();
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Instagram DM Follow-up Queue</h1>
        <p className="text-gray-300 mb-6">Manual-first queue for leads captured from your online coaching funnel.</p>
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.id} className="rounded border border-gray-700 bg-gray-900 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{row.recipient_handle || row.full_name || "Unnamed lead"}</p>
                  <p className="text-sm text-gray-300">{row.email || "No email"}</p>
                  <p className="text-sm text-gray-400">Goal: {row.interest || "N/A"}</p>
                  <p className="mt-2 text-sm">{row.message_template || ""}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => updateStatus(row.id, "sent")} className="rounded bg-green-700 px-3 py-1 text-sm">
                    Mark Sent
                  </button>
                  <button onClick={() => updateStatus(row.id, "skipped")} className="rounded bg-gray-700 px-3 py-1 text-sm">
                    Skip
                  </button>
                  <span className="rounded bg-gray-800 px-3 py-1 text-sm capitalize">{row.status}</span>
                </div>
              </div>
            </div>
          ))}
          {rows.length === 0 ? <p className="text-gray-400">No DM tasks yet.</p> : null}
        </div>
      </div>
    </div>
  );
}
