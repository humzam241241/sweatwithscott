"use client";

import { useEffect, useMemo, useState } from "react";

type Enrollment = {
  program_id: number;
  slug: string;
  title: string;
  program_type: "one_time" | "subscription";
  summary?: string;
};

type ProgramDay = {
  id: number;
  week_number: number;
  day_number: number;
  title: string;
  workout_description?: string;
  youtube_url?: string;
  is_rest_day: number;
  completed: number;
};

export default function MemberProgramsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [days, setDays] = useState<ProgramDay[]>([]);
  const [summary, setSummary] = useState<{ total_days: number; completed_days: number }>({
    total_days: 0,
    completed_days: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadEnrollments = async () => {
    const res = await fetch("/api/user/programs", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    const list = (data.enrollments ?? []) as Enrollment[];
    setEnrollments(list);
    if (!selectedSlug && list[0]?.slug) setSelectedSlug(list[0].slug);
  };

  const loadProgram = async (slug: string) => {
    if (!slug) return;
    const res = await fetch(`/api/user/programs?slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setDays((data.days ?? []) as ProgramDay[]);
    setSummary(data.summary ?? { total_days: 0, completed_days: 0 });
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadEnrollments();
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (selectedSlug) loadProgram(selectedSlug);
  }, [selectedSlug]);

  const completionPct = useMemo(() => {
    if (!summary.total_days) return 0;
    return Math.round((summary.completed_days / summary.total_days) * 100);
  }, [summary]);

  const markComplete = async (dayId: number) => {
    const res = await fetch("/api/user/programs/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dayId }),
    });
    if (res.ok) loadProgram(selectedSlug);
  };

  if (loading) return <div className="min-h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Online Coaching Hub</h1>
        <p className="text-gray-300 mb-6">Watch daily sessions, complete workout days, and keep your streak moving.</p>

        {enrollments.length === 0 ? (
          <div className="rounded border border-gray-700 bg-gray-900 p-6">
            <p className="mb-3">You are not enrolled in a program yet.</p>
            <a href="/online-coaching" className="inline-block rounded bg-brand px-4 py-2 text-white">
              View Offers
            </a>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap gap-3">
              {enrollments.map((enrollment) => (
                <button
                  key={enrollment.program_id}
                  onClick={() => setSelectedSlug(enrollment.slug)}
                  className={`rounded px-4 py-2 text-sm ${
                    selectedSlug === enrollment.slug ? "bg-brand text-white" : "bg-gray-800 text-gray-200"
                  }`}
                >
                  {enrollment.title}
                </button>
              ))}
            </div>

            <div className="mb-6 rounded border border-gray-700 bg-gray-900 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-gray-300">Progress</span>
                <span className="text-sm text-gray-300">
                  {summary.completed_days}/{summary.total_days}
                </span>
              </div>
              <div className="h-2 w-full rounded bg-gray-700">
                <div className="h-2 rounded bg-brand" style={{ width: `${completionPct}%` }} />
              </div>
            </div>

            <div className="space-y-4">
              {days.map((day) => (
                <div key={day.id} className="rounded border border-gray-700 bg-gray-900 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="font-semibold">
                      Week {day.week_number} - Day {day.day_number}: {day.title}
                    </h2>
                    <span className={`text-xs px-2 py-1 rounded ${day.completed ? "bg-green-700" : "bg-gray-700"}`}>
                      {day.completed ? "Completed" : "Pending"}
                    </span>
                  </div>
                  {day.workout_description ? <p className="mb-3 text-sm text-gray-300">{day.workout_description}</p> : null}
                  {day.youtube_url ? (
                    <div className="aspect-video w-full overflow-hidden rounded border border-gray-700">
                      <iframe
                        title={`Workout day ${day.id}`}
                        src={day.youtube_url}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="h-full w-full"
                      />
                    </div>
                  ) : null}
                  <div className="mt-3">
                    <button
                      onClick={() => markComplete(day.id)}
                      disabled={Boolean(day.completed)}
                      className="rounded bg-brand px-3 py-2 text-sm text-white disabled:opacity-50"
                    >
                      Mark Day Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {selectedSlug === "8-week-boxing-reset" ? (
              <div className="mt-8 rounded border border-brand/30 bg-gray-900 p-5">
                <h3 className="text-lg font-semibold mb-2">Ready for daily coaching?</h3>
                <p className="text-gray-300 mb-3">Upgrade to Sweat with Scott Daily for fresh drills every day.</p>
                <button
                  onClick={async () => {
                    const res = await fetch("/api/stripe/checkout", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ planCode: "DAILY_DRILLS_MONTHLY" }),
                    });
                    const data = await res.json();
                    if (data?.url) window.location.href = data.url;
                  }}
                  className="rounded bg-brand px-4 py-2 text-white"
                >
                  Upgrade to Daily
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
