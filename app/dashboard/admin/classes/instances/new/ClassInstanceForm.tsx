"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ClassInfo {
  id: number;
  name: string;
  instructor?: string | null;
  coach_name?: string | null;
}

interface Props {
  classes: ClassInfo[];
}

interface ApiError {
  error: string;
}

export default function ClassInstanceForm({ classes }: Props) {
  const router = useRouter();
  const [classId, setClassId] = useState<number>(classes[0]?.id ?? 0);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [coachName, setCoachName] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/classes/instances/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId, date, startTime, endTime, coachName }),
    });

    if (res.ok) {
      router.push("/dashboard/admin/classes");
    } else {
      const data = (await res.json().catch(() => null)) as ApiError | null;
      alert(data?.error || "Failed to create class instance");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="mb-6 text-3xl font-bold text-brand">Create Class Instance</h1>
      <form onSubmit={submit} className="space-y-4 max-w-md">
        <div>
          <label className="mb-1 block font-medium">Class *</label>
          <select
            className="w-full rounded border p-2"
            value={classId}
            onChange={(e) => setClassId(Number(e.target.value))}
            required
          >
            <option value="" disabled>
              Select class
            </option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block font-medium">Date *</label>
          <input
            type="date"
            className="w-full rounded border p-2"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block font-medium">Start Time *</label>
          <input
            type="time"
            className="w-full rounded border p-2"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block font-medium">End Time *</label>
          <input
            type="time"
            className="w-full rounded border p-2"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block font-medium">Coach Name</label>
          <input
            className="w-full rounded border p-2"
            value={coachName}
            onChange={(e) => setCoachName(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="rounded bg-brand px-4 py-2 font-medium text-white"
        >
          Create Instance
        </button>
      </form>
    </div>
  );
}
