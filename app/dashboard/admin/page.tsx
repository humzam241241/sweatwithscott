"use client";

import { useEffect, useState } from "react";
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
    </div>
  );
}
