"use client";

import { useEffect, useState } from "react";

type MemberRow = {
  id: number;
  full_name: string;
  username: string;
  email: string;
  phone: string;
  plan: string;
  start_date: string;
  renew_date?: string;
  next_payment_due: string;
  next_payment_amount: number;
  subscription_status: string;
  overdue: boolean;
  paid?: boolean;
};

export default function ManageMembersPage() {
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [term, setTerm] = useState("");
  const [asc, setAsc] = useState(true);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/members");
      const j = await r.json();
      setMembers(Array.isArray(j) ? j : []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const markPaid = async (m: MemberRow) => {
    await fetch("/api/admin/mark-membership-paid", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: m.id, months: 1, method: "cash", plan: m.plan }) });
    load();
  };
  const suspend = async (m: MemberRow, suspend: boolean) => {
    await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: m.id, suspend }) });
    load();
  };

  const rows = members
    .filter((m) => (`${m.full_name} ${m.username}`.toLowerCase()).includes(term.toLowerCase()))
    .sort((a, b) => (asc ? a.full_name.localeCompare(b.full_name) : b.full_name.localeCompare(a.full_name)));

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="mb-6 text-2xl font-semibold">Manage Members</h1>
      <div className="rounded-lg bg-gray-900 border border-gray-700">
        <div className="flex items-center justify-between p-4">
          <div className="font-semibold">Members</div>
          <div className="flex gap-2">
            <input value={term} onChange={(e)=>setTerm(e.target.value)} placeholder="Search" className="rounded bg-black border border-gray-700 px-3 py-1 text-sm" />
            <button onClick={()=>setAsc(!asc)} className="px-3 py-1 rounded border border-gray-600 text-sm">Sort {asc ? '▼' : '▲'}</button>
          </div>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 text-gray-300">
              <tr>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Username</th>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Phone</th>
                <th className="text-left p-2">Plan</th>
                <th className="text-left p-2">Start</th>
                <th className="text-left p-2">Renewal</th>
                <th className="text-left p-2">Amount</th>
                <th className="text-left p-2">Paid</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {rows.map((m) => (
                <tr key={m.id} className={m.overdue ? "bg-red-900/20" : ""}>
                  <td className="p-2 text-white font-medium">{m.full_name}</td>
                  <td className="p-2 text-gray-300">@{m.username}</td>
                  <td className="p-2 text-gray-300">{m.email}</td>
                  <td className="p-2 text-gray-300">{m.phone}</td>
                  <td className="p-2 text-gray-300 capitalize">{m.plan}</td>
                  <td className="p-2 text-gray-300">{m.start_date?.split("T")[0]}</td>
                  <td className="p-2 text-gray-300">{m.renew_date || m.next_payment_due}</td>
                  <td className="p-2 text-gray-300">${m.next_payment_amount.toFixed(2)}</td>
                  <td className="p-2">
                    <span className={`px-2 py-0.5 rounded border text-xs ${m.paid ? "text-green-400 border-green-400" : "text-yellow-400 border-yellow-400"}`}>
                      {m.paid ? "Paid" : "Unpaid"}
                    </span>
                  </td>
                  <td className={`p-2 ${m.overdue ? "text-red-400" : "text-gray-300"}`}>{m.subscription_status}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button onClick={() => markPaid(m)} className="px-2 py-1 rounded border text-green-400 border-green-400">Mark Paid</button>
                      <button onClick={() => suspend(m, true)} className="px-2 py-1 rounded border text-red-400 border-red-400">Suspend</button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="p-8 text-center text-gray-400" colSpan={11}>{loading ? "Loading…" : "No members found"}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


