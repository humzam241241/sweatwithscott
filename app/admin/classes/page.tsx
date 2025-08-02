"use client";

import { useState, useEffect } from "react";
import useData from "@/hooks/use-data";

interface ClassType {
  slug: string;
  name: string;
  description: string;
  image?: string;
  coach_id?: number | null;
  schedule?: string | null;
  color?: string | null;
  day: string;
  time: string;
  spots: number;
}

export default function AdminSchedulePage() {
  const { classes, refreshData } = useData();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<ClassType>>({
    name: "",
    description: "",
    image: "",
    coach_id: null,
    schedule: "",
    color: "",
    day: "",
    time: "",
    spots: 0,
  });
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<ClassType>>({});

  // Create a new class instantly
  const createClass = async () => {
    try {
      const payload = {
        ...formData,
        slug: formData.name?.toLowerCase().replace(/\s+/g, "-") || "",
      };

      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create class");
      // Reset form
      setFormData({
        name: "",
        description: "",
        image: "",
        coach_id: null,
        schedule: "",
        color: "",
        day: "",
        time: "",
        spots: 0,
      });

      // Refresh global data
      await refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  // Save inline edit
  const saveEdit = async (slug: string) => {
    try {
      const res = await fetch(`/api/classes/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (!res.ok) throw new Error("Failed to update class");

      setEditingSlug(null);
      setEditData({});
      await refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete class
  const deleteClass = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this class?")) return;
    try {
      const res = await fetch(`/api/classes/${slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete class");
      await refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (classes !== null) {
      setLoading(false);
    }
  }, [classes]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Schedule Manager</h1>

      {/* Create Class Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Create New Class</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <input
            className="border p-2 rounded"
            placeholder="Class Name"
            value={formData.name || ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="Image URL"
            value={formData.image || ""}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="Day"
            value={formData.day || ""}
            onChange={(e) => setFormData({ ...formData, day: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="Time"
            value={formData.time || ""}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          />
          <input
            type="number"
            className="border p-2 rounded"
            placeholder="Spots"
            value={formData.spots || 0}
            onChange={(e) =>
              setFormData({ ...formData, spots: Number(e.target.value) })
            }
          />
          <input
            className="border p-2 rounded"
            placeholder="Color"
            value={formData.color || ""}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
          />
        </div>
        <textarea
          className="border p-2 rounded mt-4 w-full"
          placeholder="Description"
          value={formData.description || ""}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
        <button
          onClick={createClass}
          className="mt-4 px-6 py-2 bg-brand text-white rounded hover:bg-brand-dark"
        >
          Add Class
        </button>
      </div>

      {/* Class List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Existing Classes</h2>
        {loading ? (
          <p>Loading classes...</p>
        ) : classes && classes.length > 0 ? (
          <ul className="divide-y">
            {classes.map((cls) => (
              <li
                key={cls.slug}
                className="py-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4"
              >
                {editingSlug === cls.slug ? (
                  <div className="flex flex-col gap-2 w-full">
                    <input
                      className="border p-2 rounded"
                      value={editData.name ?? cls.name}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                    />
                    <textarea
                      className="border p-2 rounded"
                      value={editData.description ?? cls.description}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          description: e.target.value,
                        })
                      }
                    />
                    <div className="flex gap-2">
                      <input
                        className="border p-2 rounded"
                        value={editData.day ?? cls.day}
                        onChange={(e) =>
                          setEditData({ ...editData, day: e.target.value })
                        }
                      />
                      <input
                        className="border p-2 rounded"
                        value={editData.time ?? cls.time}
                        onChange={(e) =>
                          setEditData({ ...editData, time: e.target.value })
                        }
                      />
                      <input
                        type="number"
                        className="border p-2 rounded"
                        value={editData.spots ?? cls.spots}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            spots: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(cls.slug)}
                        className="px-4 py-1 bg-green-600 text-white rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingSlug(null)}
                        className="px-4 py-1 bg-gray-400 text-white rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="font-semibold">{cls.name}</p>
                      <p className="text-sm text-gray-600">
                        {cls.day} at {cls.time} — {cls.spots} spots
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingSlug(cls.slug);
                          setEditData(cls);
                        }}
                        className="px-3 py-1 bg-yellow-500 text-white rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteClass(cls.slug)}
                        className="px-3 py-1 bg-red-600 text-white rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No classes available.</p>
        )}
      </div>
    </div>
  );
}
