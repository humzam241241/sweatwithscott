"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface ClassType {
  id?: number;
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
  const [classes, setClasses] = useState<ClassType[]>([]);
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

  // Fetch classes from API
  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/classes");
      if (!res.ok) throw new Error("Failed to fetch classes");
      const data = await res.json();
      setClasses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Create new class
  const createClass = async () => {
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to create class");
      await fetchClasses();
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
    } catch (err) {
      console.error(err);
    }
  };

  // Edit class
  const editClass = async (id: number, updatedData: Partial<ClassType>) => {
    try {
      const res = await fetch(`/api/classes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error("Failed to update class");
      await fetchClasses();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete class
  const deleteClass = async (id: number) => {
    if (!confirm("Are you sure you want to delete this class?")) return;
    try {
      const res = await fetch(`/api/classes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete class");
      await fetchClasses();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

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
        ) : classes.length > 0 ? (
          <ul className="divide-y">
            {classes.map((cls) => (
              <li key={cls.id} className="py-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{cls.name}</p>
                  <p className="text-sm text-gray-600">
                    {cls.day} at {cls.time} — {cls.spots} spots
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/schedule/edit/${cls.id}`}
                    className="px-3 py-1 bg-yellow-500 text-white rounded"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => deleteClass(cls.id!)}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                </div>
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
