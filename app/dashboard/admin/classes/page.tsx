"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ClassItem {
  id: number;
  slug: string;
  name: string;
  description: string;
  image?: string;
  price?: number | null;
}

export default function AdminClassesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [form, setForm] = useState<Partial<ClassItem>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((user) => {
        if (!user || user.role !== "admin") {
          router.replace("/login");
        } else {
          loadClasses();
        }
      });
  }, [router]);

  const loadClasses = () => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then((data) => {
        setClasses(Array.isArray(data) ? data : []);
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
      ...form,
      slug: form.name.toLowerCase().replace(/\s+/g, "-"),
    };
    if (editingId) body.id = editingId;
    const method = editingId ? "PUT" : "POST";
    const res = await fetch("/api/classes", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      resetForm();
      loadClasses();
    }
  };

  const startEdit = (cls: ClassItem) => {
    setEditingId(cls.id);
    setForm({
      name: cls.name,
      description: cls.description,
      image: cls.image,
      price: cls.price ?? undefined,
    });
    setPreview(cls.image ?? null);
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this class?")) return;
    const res = await fetch("/api/classes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) loadClasses();
  };

  if (loading) return <div className="min-h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="mb-6 text-3xl font-bold text-brand">Manage Classes</h1>
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
          <label className="mb-1 block font-medium">Description</label>
          <textarea
            className="w-full rounded border p-2"
            value={form.description ?? ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block font-medium">Price</label>
          <input
            type="number"
            className="w-full rounded border p-2"
            value={form.price ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                price: e.target.value ? parseFloat(e.target.value) : undefined,
              })
            }
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
            {editingId ? "Update" : "Add"} Class
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

      <h2 className="mb-4 text-xl font-bold">Existing Classes</h2>
      {classes.length === 0 ? (
          <p>No classes available.</p>
        ) : (
        <ul className="space-y-4">
          {classes.map((cls) => (
            <li
              key={cls.id}
              className="flex items-center justify-between rounded border p-4"
            >
              <div className="flex items-center gap-4">
                {cls.image && (
                  <img
                    src={cls.image}
                    alt={cls.name}
                    className="h-16 w-16 rounded object-cover"
                  />
                )}
                <div>
                  <p className="font-semibold">{cls.name}</p>
                  <p className="text-sm text-gray-600">{cls.description}</p>
                </div>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => startEdit(cls)}
                  className="rounded bg-brand px-3 py-1 text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(cls.id)}
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

