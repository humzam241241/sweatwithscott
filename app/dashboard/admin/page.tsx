"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const links = [
  { href: "/dashboard/admin/classes", label: "Manage Classes" },
  { href: "/dashboard/admin/coaches", label: "Manage Coaches" },
  { href: "/dashboard/admin/timetable", label: "Manage Timetable" },
  { href: "/dashboard/admin/media", label: "Manage Media" },
  { href: "/dashboard/admin/members", label: "Manage Members" },
  { href: "/dashboard/admin/payments", label: "Payments" },
];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((user) => {
        if (!user || user.role !== "admin") {
          router.replace("/login");
        } else {
          setLoading(false);
        }
      });
  }, [router]);

  if (loading) return <div className="min-h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="mb-8 text-3xl font-bold">Admin Dashboard</h1>
      <StatsCards />
      <div className="mt-8">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-lg"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-12 space-y-6">
        <h2 className="text-xl font-semibold">Live Calendar</h2>
        <iframe title="admin-schedule" src="/admin/schedule/embed" className="w-full h-[800px] rounded border bg-white" />
      </div>
      <div className="mt-12">
        <InventoryPanel />
      </div>
    </div>
  );
}

function StatsCards() {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => { fetch('/api/admin/stats').then(r=>r.json()).then(setStats).catch(()=>setStats(null)); }, []);
  const items = [
    { label: 'Members', value: stats?.totalMembers },
    { label: 'Classes', value: stats?.totalClasses },
    { label: 'Upcoming', value: stats?.upcomingClasses },
    { label: 'Bookings', value: stats?.totalBookings },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((s, i) => (
        <div key={i} className="rounded-lg bg-white p-4 border border-gray-200">
          <div className="text-sm text-gray-500">{s.label}</div>
          <div className="text-2xl font-semibold">{s.value ?? '—'}</div>
        </div>
      ))}
    </div>
  );
}

function InventoryPanel() {
  const [data, setData] = useState<{ items: any[]; lowStock: any[] }>({ items: [], lowStock: [] });
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({ name: '', sku: '', category: '', price: 0, quantity: 0, min_threshold: 0 });

  const refresh = () => { fetch('/api/admin/inventory').then(r=>r.json()).then(setData).catch(()=>setData({ items: [], lowStock: [] })); };
  useEffect(() => { refresh(); }, []);

  const saveItem = async () => {
    await fetch('/api/admin/inventory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing ? { ...form, id: editing.id } : form) });
    setEditing(null); setForm({ name: '', sku: '', category: '', price: 0, quantity: 0, min_threshold: 0 }); refresh();
  };
  const adjustQty = async (item: any, delta: number) => {
    await fetch('/api/admin/inventory', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ item_id: item.id, delta, reason: delta > 0 ? 'restock' : 'sale' }) });
    refresh();
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-semibold">Inventory</h2>
        {data.lowStock.length > 0 && <span className="text-xs text-amber-600">Low stock: {data.lowStock.length}</span>}
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="text-sm text-gray-500 mb-2">Items</div>
          <div className="space-y-2 max-h-[420px] overflow-auto pr-2">
            {data.items.map((it) => (
              <div key={it.id} className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded p-2">
                <div className="min-w-0">
                  <div className="font-medium truncate">{it.name}</div>
                  <div className="text-xs text-gray-500 truncate">{it.sku || '—'} · {it.category || 'Uncategorized'}</div>
                </div>
                <div className="text-sm text-gray-700 whitespace-nowrap">${'{'}it.price?.toFixed?.(2) ?? it.price ?? 0{'}'}</div>
                <div className="text-xs">
                  <span className={`${'{'}it.quantity <= it.min_threshold ? 'bg-rose-600 text-white' : 'bg-gray-800 text-white'{'}'} px-2 py-0.5 rounded`}>{'{'}it.quantity{'}'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => adjustQty(it, -1)} className="px-2 text-sm bg-gray-200 rounded">-</button>
                  <button onClick={() => adjustQty(it, +1)} className="px-2 text-sm bg-gray-200 rounded">+</button>
                  <button onClick={() => { setEditing(it); setForm(it); }} className="px-2 text-sm underline">Edit</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500 mb-2">{editing ? 'Edit Item' : 'Add Item'}</div>
          <div className="space-y-2">
            {['name','sku','category'].map((k) => (
              <input key={k} className="w-full rounded bg-white border border-gray-200 px-3 py-2 text-sm" placeholder={k.toUpperCase()} value={form[k] ?? ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
            ))}
            <div className="grid grid-cols-3 gap-2">
              <input className="rounded bg-white border border-gray-200 px-3 py-2 text-sm" placeholder="PRICE" type="number" value={form.price ?? 0} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
              <input className="rounded bg-white border border-gray-200 px-3 py-2 text-sm" placeholder="QTY" type="number" value={form.quantity ?? 0} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
              <input className="rounded bg-white border border-gray-200 px-3 py-2 text-sm" placeholder="MIN" type="number" value={form.min_threshold ?? 0} onChange={(e) => setForm({ ...form, min_threshold: Number(e.target.value) })} />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={saveItem} className="px-3 py-2 bg-black text-white rounded">{editing ? 'Update' : 'Add'}</button>
              {editing && <button onClick={() => { setEditing(null); setForm({ name: '', sku: '', category: '', price: 0, quantity: 0, min_threshold: 0 }); }} className="px-3 py-2 bg-gray-200 rounded">Cancel</button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScheduleBoard({ className = "" }: { className?: string }) {
  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const hours = useMemo(() => {
    const list: string[] = [];
    for (let h = 6; h <= 22; h++) list.push(String(h).padStart(2,"0") + ":00");
    return list;
  }, []);

  const [classes, setClasses] = useState<any[]>([]);
  const load = () => {
    fetch('/api/classes', { cache: 'no-store' })
      .then(r=>r.json())
      .then((data)=> setClasses(Array.isArray(data) ? data : []));
  };
  useEffect(load, []);

  // Drag handlers
  const onDragStart = (e: React.DragEvent<HTMLDivElement>, cls: any) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ id: cls.id }));
  };
  const onDrop = async (e: React.DragEvent<HTMLDivElement>, day: string, time: string) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/json');
    if (!data) return;
    const { id } = JSON.parse(data);
    const endTime = addOneHour(time);
    await fetch('/api/classes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, day, time, endTime }),
    });
    load();
  };
  const allowDrop = (e: React.DragEvent) => e.preventDefault();

  // Helper
  const addOneHour = (t: string) => {
    const d = new Date(`2000-01-01 ${t}`);
    if (Number.isNaN(d.getTime())) return t;
    d.setHours(d.getHours() + 1);
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  };

  return (
    <div className={"" + className}>
      <h2 className="text-xl font-semibold mb-3">Live Schedule (Drag classes to reschedule)</h2>
      <div className="overflow-x-auto">
        <div className="grid grid-cols-8 min-w-[1000px]">
          {/* Header row */}
          <div></div>
          {days.map((d) => (
            <div key={d} className="py-2 text-center font-semibold bg-white border border-gray-200">{d}</div>
          ))}
          {/* Body rows */}
          {hours.map((h) => (
            <>
              <div key={`label-${h}`} className="h-16 flex items-start justify-end pr-2 text-sm text-gray-500 bg-gray-50 border border-gray-200">{h}</div>
              {days.map((d) => (
                <div
                  key={`${d}-${h}`}
                  className="h-16 bg-white border border-gray-200 p-1"
                  onDragOver={allowDrop}
                  onDrop={(e)=>onDrop(e,d,h)}
                >
                  {/* render any class that starts within this slot */}
                  {classes.filter((c:any)=> c.day_of_week===d && c.start_time?.slice(0,5)===h).map((c:any)=> (
                    <div
                      key={c.id}
                      draggable
                      onDragStart={(e)=>onDragStart(e,c)}
                      className="rounded text-white text-xs p-2 cursor-move"
                      style={{ backgroundColor: c.color || '#c90015' }}
                    >
                      <div className="font-semibold text-[11px]">{c.name}</div>
                      <div className="opacity-90">{c.start_time} - {c.end_time}</div>
                    </div>
                  ))}
                </div>
              ))}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
