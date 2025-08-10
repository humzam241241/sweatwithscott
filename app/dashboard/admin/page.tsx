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
      <ScheduleBoard className="mt-12" />
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
