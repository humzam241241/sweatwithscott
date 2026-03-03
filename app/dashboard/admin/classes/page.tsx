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
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
  max_capacity?: number;
  instructor?: string;
  color?: string | null;
}

export default function AdminClassesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [form, setForm] = useState<Partial<ClassItem>>({ day_of_week: "Monday", color: "#c90015" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        const data = res.ok ? await res.json() : null;
        const isAdmin = Boolean(data?.user?.isAdmin);
        if (!isAdmin) throw new Error("not-admin");
        loadClasses();
        return;
      } catch {}
      try {
        const legacy = await fetch("/api/auth/me");
        const user = legacy.ok ? await legacy.json() : null;
        if (!user || user.role !== "admin") throw new Error("not-admin");
        loadClasses();
      } catch {
        router.replace("/login");
      }
    };
    check();
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
      // Notify other views (member/admin calendars) to refresh
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('classes:changed'));
      }
    }
  };

  const startEdit = (cls: ClassItem) => {
    setEditingId(cls.id);
    setForm({
      name: cls.name,
      description: cls.description,
      image: cls.image,
      price: cls.price ?? undefined,
      day_of_week: cls.day_of_week,
      start_time: cls.start_time,
      end_time: cls.end_time,
      max_capacity: cls.max_capacity,
      instructor: cls.instructor,
      color: cls.color ?? undefined,
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
      <form onSubmit={submit} className="mb-8 space-y-4 max-w-2xl">
        <div>
          <label className="mb-1 block font-medium">Name *</label>
          <input
            className="w-full rounded border p-2"
            value={form.name ?? ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block font-medium">Day *</label>
            <select className="w-full rounded border p-2" value={form.day_of_week ?? "Monday"} onChange={(e)=>setForm({...form, day_of_week: e.target.value})}>
              {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d=> (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block font-medium">Start Time *</label>
            <input type="time" className="w-full rounded border p-2" value={form.start_time ?? ""} onChange={(e)=>setForm({...form, start_time: e.target.value})} required />
          </div>
          <div>
            <label className="mb-1 block font-medium">End Time *</label>
            <input type="time" className="w-full rounded border p-2" value={form.end_time ?? ""} onChange={(e)=>setForm({...form, end_time: e.target.value})} required />
          </div>
          <div>
            <label className="mb-1 block font-medium">Spots</label>
            <input type="number" className="w-full rounded border p-2" value={form.max_capacity ?? 0} onChange={(e)=>setForm({...form, max_capacity: parseInt(e.target.value || '0',10)})} />
          </div>
          <div>
            <label className="mb-1 block font-medium">Coach</label>
            <input className="w-full rounded border p-2" value={form.instructor ?? ""} onChange={(e)=>setForm({...form, instructor: e.target.value})} />
          </div>
          <div>
            <label className="mb-1 block font-medium">Color</label>
            <input type="color" list="class-colors" className="w-full h-10 rounded border p-1" value={form.color ?? "#c90015"} onChange={(e)=>setForm({...form, color: e.target.value})} />
            <datalist id="class-colors">
              {['#c90015','#1d4ed8','#059669','#0ea5e9','#f59e0b','#7c3aed','#ef4444','#14b8a6','#f97316','#84cc16'].map(c=> (
                <option key={c} value={c}>{c}</option>
              ))}
            </datalist>
          </div>
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
                  <p className="text-xs text-gray-500">{cls.day_of_week} · {cls.start_time} - {cls.end_time} · Coach: {cls.instructor || '—'}</p>
                </div>
              </div>
              <div className="space-x-2">
                <button onClick={() => startEdit(cls)} className="rounded bg-blue-600 px-3 py-1 text-white">
                  Edit
                </button>
                <button onClick={() => remove(cls.id)} className="rounded bg-blue-600/20 border border-blue-600 px-3 py-1 text-blue-700">
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

