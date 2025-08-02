"use client";

import { useEffect, useState } from "react";

export default function AdminCoaches() {
  const [coaches, setCoaches] = useState<any[]>([]);
  const [form, setForm] = useState({
    slug: "",
    name: "",
    role: "",
    bio: "",
    image: "",
    certifications: "",
    fight_record: "",
  });
  const [editing, setEditing] = useState<string | null>(null);

  const fetchData = async () => {
    const res = await fetch("/api/coaches");
    const data = await res.json();
    setCoaches(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/coaches/${editing}` : "/api/coaches";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ slug: "", name: "", role: "", bio: "", image: "", certifications: "", fight_record: "" });
    setEditing(null);
    fetchData();
  };

  const edit = (c: any) => {
    setForm({
      slug: c.slug,
      name: c.name,
      role: c.role || "",
      bio: c.bio || "",
      image: c.image || "",
      certifications: c.certifications || "",
      fight_record: c.fight_record || "",
    });
    setEditing(c.slug);
  };

  const del = async (slug: string) => {
    await fetch(`/api/coaches/${slug}`, { method: "DELETE" });
    fetchData();
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-red-600">Manage Coaches</h1>
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
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          placeholder="role"
          className="border p-2 w-full"
        />
        <textarea
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          placeholder="bio"
          className="border p-2 w-full"
        />
        <input
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
          placeholder="image url"
          className="border p-2 w-full"
        />
        <input
          value={form.certifications}
          onChange={(e) => setForm({ ...form, certifications: e.target.value })}
          placeholder="certifications"
          className="border p-2 w-full"
        />
        <input
          value={form.fight_record}
          onChange={(e) => setForm({ ...form, fight_record: e.target.value })}
          placeholder="fight record"
          className="border p-2 w-full"
        />
        <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded">
          {editing ? "Update" : "Add"}
        </button>
      </form>
      <ul>
        {coaches.map((c) => (
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
