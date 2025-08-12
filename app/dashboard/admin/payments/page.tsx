"use client";
import { useEffect, useState } from "react";

type OutstandingPayment = {
  id: number;
  user_id: number;
  username: string;
  full_name: string;
  email: string;
  phone: string;
  class_name: string;
  instructor: string;
  date: string;
  start_time: string;
  payment_amount: number;
  booking_date: string;
};

export default function PaymentsPage() {
  const [rows, setRows] = useState<OutstandingPayment[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const r = await fetch('/api/admin/outstanding-payments'); const j = await r.json(); setRows(Array.isArray(j) ? j : []); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const markPaid = async (id: number) => {
    await fetch('/api/admin/mark-payment-paid', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingId: id, paymentMethod: 'cash' }) });
    load();
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="mb-6 text-2xl font-semibold">Outstanding Payments</h1>
      <div className="rounded-lg bg-gray-900 border border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="text-left p-2">Member</th>
              <th className="text-left p-2">Contact</th>
              <th className="text-left p-2">Class</th>
              <th className="text-left p-2">Date</th>
              <th className="text-left p-2">Amount</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {rows.map(p => (
              <tr key={p.id}>
                <td className="p-2">
                  <div className="font-medium text-white">{p.full_name || p.username}</div>
                  <div className="text-gray-400 text-sm">@{p.username}</div>
                </td>
                <td className="p-2 text-gray-300">
                  <div>{p.email}</div>
                  <div className="text-gray-400 text-sm">{p.phone}</div>
                </td>
                <td className="p-2 text-gray-300">{p.class_name}</td>
                <td className="p-2 text-gray-300">{p.date} {p.start_time}</td>
                <td className="p-2 text-gray-300">${p.payment_amount.toFixed(2)}</td>
                <td className="p-2">
                  <button onClick={() => markPaid(p.id)} className="px-2 py-1 rounded border text-green-400 border-green-400">Mark Paid</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="p-8 text-center text-gray-400" colSpan={6}>{loading ? 'Loading…' : 'No outstanding payments'}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}



