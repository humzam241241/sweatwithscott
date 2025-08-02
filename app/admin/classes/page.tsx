"use client";

import { useEffect, useState } from "react";

export default function AdminClasses() {
  const [classes, setClasses] = useState<any[]>([]);
  const [form, setForm] = useState({
    slug: "",
    name: "",
    description: "",
    image: "",
    coach_id: "",
    schedule: "",
  });
  const [editing, setEditing] = useState<string | null>(null);

  const fetchData = async () => {
    const res = await fetch("/api/classes");
    const data = await res.json();
    setClasses(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/classes/${editing}` : "/api/classes";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        coach_id: form.coach_id ? Number(form.coach_id) : null,
        schedule: form.schedule ? JSON.parse(form.schedule) : [],
      }),
    });
    setForm({ slug: "", name: "", description: "", image: "", coach_id: "", schedule: "" });
    setEditing(null);
    fetchData();
  };

  const edit = (cls: any) => {
    setForm({
      slug: cls.slug,
      name: cls.name,
      description: cls.description || "",
      image: cls.image || "",
      coach_id: cls.coach_id ? String(cls.coach_id) : "",
      schedule: cls.schedule || "",
    });
    setEditing(cls.slug);
  };

  const del = async (slug: string) => {
    await fetch(`/api/classes/${slug}`, { method: "DELETE" });
    fetchData();
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-red-600">Manage Classes</h1>
      <form onSubmit={submit} className="space-y-2 mb-8">
        <input
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          placeholder="slug"
          className="border p-2 w-full"
          required={!editing}
        />
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="name"
          className="border p-2 w-full"
          required
        />
        <input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="description"
          className="border p-2 w-full"
        />
        <input
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
          placeholder="image url"
          className="border p-2 w-full"
        />
        <input
          value={form.coach_id}
          onChange={(e) => setForm({ ...form, coach_id: e.target.value })}
          placeholder="coach id"
          className="border p-2 w-full"
        />
        <input
          value={form.schedule}
          onChange={(e) => setForm({ ...form, schedule: e.target.value })}
          placeholder='schedule JSON'
          className="border p-2 w-full"
        />
        <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded">
          {editing ? "Update" : "Add"}
        </button>
      </form>
      <ul>
        {classes.map((c) => (
          <li key={c.slug} className="mb-2 flex items-center justify-between">
            <span>{c.name}</span>
            <div className="space-x-2">
              <button onClick={() => edit(c)} className="text-blue-600">
                Edit
              </button>
              <button onClick={() => del(c.slug)} className="text-red-600">
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
