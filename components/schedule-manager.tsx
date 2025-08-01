"use client";

import { useEffect, useState } from "react";
import { mutate } from "swr";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ClassItem {
  id?: number;
  day: string;
  name: string;
  time: string;
  spots: number;
  coach?: string;
  color?: string;
}

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function ScheduleManager() {
  const emptyForm: ClassItem = {
    day: "Monday",
    name: "",
    time: "",
    spots: 0,
    coach: "",
    color: "",
  };

  const [form, setForm] = useState<ClassItem>(emptyForm);
  const [classes, setClasses] = useState<ClassItem[]>([]);

  const load = async () => {
    const resp = await fetch("/api/schedule");
    if (resp.ok) {
      const data: Record<string, ClassItem[]> = await resp.json();
      const flat = Object.values(data).flat();
      setClasses(flat);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success(form.id ? "Class updated" : "Class added");
      setForm(emptyForm);
      await load();
      mutate("/api/schedule");
    } else {
      toast.error("Failed to save class");
    }
  };

  const handleEdit = (cls: ClassItem) => {
    setForm({ ...cls });
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    const res = await fetch(`/api/schedule/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Class deleted");
      await load();
      mutate("/api/schedule");
    } else {
      toast.error("Failed to delete class");
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm mb-1">Day</label>
            <select
              value={form.day}
              onChange={(e) => setForm({ ...form, day: e.target.value })}
              className="w-full p-2 rounded bg-gray-800 text-white"
            >
              {days.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Class Name</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-gray-800 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Time</label>
            <Input
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              placeholder="6:00 AM"
              className="bg-gray-800 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Spots</label>
            <Input
              type="number"
              value={form.spots}
              onChange={(e) =>
                setForm({ ...form, spots: parseInt(e.target.value || "0") })
              }
              className="bg-gray-800 text-white"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Coach</label>
            <Input
              value={form.coach}
              onChange={(e) => setForm({ ...form, coach: e.target.value })}
              className="bg-gray-800 text-white"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Color</label>
            <input
              type="color"
              value={form.color || "#c90015"}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="w-full h-10 p-1 rounded bg-gray-800"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" className="bg-red-600 hover:bg-red-700">
            {form.id ? "Update" : "Add"} Class
          </Button>
          {form.id && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setForm(emptyForm)}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>

      <Table className="bg-gray-900">
        <TableHeader>
          <TableRow>
            <TableHead>Day</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Spots</TableHead>
            <TableHead>Coach</TableHead>
            <TableHead>Color</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classes.map((c) => (
            <TableRow key={c.id}>
              <TableCell>{c.day}</TableCell>
              <TableCell>{c.time}</TableCell>
              <TableCell>{c.name}</TableCell>
              <TableCell>{c.spots}</TableCell>
              <TableCell>{c.coach}</TableCell>
              <TableCell>
                <span
                  className="inline-block w-4 h-4 rounded"
                  style={{ backgroundColor: c.color || "#c90015" }}
                />
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(c)}
                  className="text-white"
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(c.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
