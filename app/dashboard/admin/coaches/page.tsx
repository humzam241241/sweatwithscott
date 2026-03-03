"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface CoachItem {
  id: number;
  slug: string;
  name: string;
  role?: string;
  bio?: string;
  image?: string;
}

export default function AdminCoachesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [coaches, setCoaches] = useState<CoachItem[]>([]);
  const [form, setForm] = useState<Partial<CoachItem>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        const data = res.ok ? await res.json() : null;
        const isAdmin = Boolean(data?.user?.isAdmin);
        if (!isAdmin) throw new Error("not-admin");
        loadCoaches();
        return;
      } catch {}
      try {
        const legacy = await fetch("/api/auth/me");
        const user = legacy.ok ? await legacy.json() : null;
        if (!user || user.role !== "admin") throw new Error("not-admin");
        loadCoaches();
      } catch {
        router.replace("/login");
      }
    };
    check();
  }, [router]);

  const loadCoaches = () => {
    fetch("/api/coaches")
      .then((res) => res.json())
      .then((data) => {
        setCoaches(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/media", { method: "POST", body: fd });
    if (res.ok) {
      const data = await res.json();
      const url = `/uploads/media/${data.filename}`;
      setForm((f) => ({ ...f, image: url }));
      setPreview(url);
    }
  };

  const resetForm = () => {
    setForm({});
    setEditingId(null);
    setPreview(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    const body: any = {
      slug: form.name.toLowerCase().replace(/\s+/g, "-"),
      name: form.name,
      role: form.role || "",
      bio: form.bio || "",
      image: form.image || "",
      certifications: "",
      fight_record: "",
    };
    if (editingId) body.id = editingId;
    const method = editingId ? "PUT" : "POST";
    const res = await fetch("/api/coaches", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      resetForm();
      loadCoaches();
    }
  };

  const startEdit = (c: CoachItem) => {
    setEditingId(c.id);
    setForm({ name: c.name, role: c.role, bio: c.bio, image: c.image });
    setPreview(c.image ?? null);
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this coach?")) return;
    const res = await fetch("/api/coaches", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) loadCoaches();
  };

  if (loading) return <div className="min-h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="mb-6 text-3xl font-bold text-brand">Manage Coaches</h1>
      <form onSubmit={submit} className="mb-8 space-y-4 max-w-xl">
        <div>
          <label className="mb-1 block font-medium">Name *</label>
          <input
            className="w-full rounded border p-2"
            value={form.name ?? ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="mb-1 block font-medium">Title</label>
          <input
            className="w-full rounded border p-2"
            value={form.role ?? ""}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block font-medium">Bio</label>
          <textarea
            className="w-full rounded border p-2"
            value={form.bio ?? ""}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block font-medium">Image</label>
          <input type="file" accept="image/*" onChange={handleFile} />
          {preview && (
            <img
              src={preview}
              alt="preview"
              className="mt-2 h-32 w-32 rounded object-cover"
            />
          )}
        </div>
        <div className="space-x-2">
          <button
            type="submit"
            className="rounded bg-brand px-4 py-2 font-medium text-white"
          >
            {editingId ? "Update" : "Add"} Coach
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded bg-gray-300 px-4 py-2"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2 className="mb-4 text-xl font-bold">Existing Coaches</h2>
      {coaches.length === 0 ? (
          <p>No coaches available.</p>
        ) : (
        <ul className="space-y-4">
          {coaches.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between rounded border p-4"
            >
              <div className="flex items-center gap-4">
                {c.image && (
                  <img
                    src={c.image}
                    alt={c.name}
                    className="h-16 w-16 rounded object-cover"
                  />
                )}
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-sm text-gray-600">{c.role}</p>
                </div>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => startEdit(c)}
                  className="rounded bg-brand px-3 py-1 text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(c.id)}
                  className="rounded bg-red-600 px-3 py-1 text-white"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

