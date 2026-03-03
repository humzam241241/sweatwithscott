"use client";

import { FormEvent, useState } from "react";

export default function OnlineCoachingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string>("");
  const [leadStatus, setLeadStatus] = useState<string>("");

  const startCheckout = async (planCode: "EIGHT_WEEK_RESET" | "DAILY_DRILLS_MONTHLY") => {
    setLoadingPlan(planCode);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planCode }),
      });
      const data = await res.json();
      if (data?.url) window.location.href = data.url;
    } finally {
      setLoadingPlan("");
    }
  };

  const submitLead = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      fullName: String(form.get("fullName") || ""),
      instagramHandle: String(form.get("instagramHandle") || ""),
      email: String(form.get("email") || ""),
      interest: String(form.get("interest") || ""),
    };
    const res = await fetch("/api/instagram-leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLeadStatus(res.ok ? "Saved. We will follow up through DM/email." : "Could not save. Please try again.");
    if (res.ok) e.currentTarget.reset();
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-5xl px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-black mb-4">Sweat with Scott</h1>
        <p className="text-lg text-gray-300 mb-10">
          Built for Instagram followers who want real boxing results at home: start with 8 weeks, then continue daily.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded border border-gray-700 bg-gray-900 p-6">
            <h2 className="text-2xl font-bold mb-2">8-Week Boxing Reset</h2>
            <p className="text-gray-300 mb-4">One-time payment. Structured weekly roadmap and follow-along sessions.</p>
            <button
              onClick={() => startCheckout("EIGHT_WEEK_RESET")}
              disabled={loadingPlan === "EIGHT_WEEK_RESET"}
              className="rounded bg-brand px-4 py-2 text-white disabled:opacity-50"
            >
              {loadingPlan === "EIGHT_WEEK_RESET" ? "Loading..." : "Join for $197"}
            </button>
          </div>
          <div className="rounded border border-gray-700 bg-gray-900 p-6">
            <h2 className="text-2xl font-bold mb-2">Sweat with Scott Daily</h2>
            <p className="text-gray-300 mb-4">Monthly subscription with daily drills, workouts, and coaching cadence.</p>
            <button
              onClick={() => startCheckout("DAILY_DRILLS_MONTHLY")}
              disabled={loadingPlan === "DAILY_DRILLS_MONTHLY"}
              className="rounded bg-brand px-4 py-2 text-white disabled:opacity-50"
            >
              {loadingPlan === "DAILY_DRILLS_MONTHLY" ? "Loading..." : "Start at $39/mo"}
            </button>
          </div>
        </div>

        <div className="mt-10 rounded border border-gray-700 bg-gray-900 p-6">
          <h3 className="text-xl font-semibold mb-3">Not ready yet? Get a DM follow-up</h3>
          <form onSubmit={submitLead} className="grid gap-3 md:grid-cols-2">
            <input name="fullName" placeholder="Full name" className="rounded border border-gray-700 bg-black px-3 py-2" />
            <input name="instagramHandle" placeholder="@instagram" className="rounded border border-gray-700 bg-black px-3 py-2" />
            <input name="email" type="email" placeholder="Email" className="rounded border border-gray-700 bg-black px-3 py-2" />
            <input name="interest" placeholder="Goal (fat loss, boxing skills, confidence...)" className="rounded border border-gray-700 bg-black px-3 py-2" />
            <button type="submit" className="rounded bg-white px-4 py-2 text-black md:col-span-2">
              Save my spot
            </button>
          </form>
          {leadStatus ? <p className="mt-3 text-sm text-gray-300">{leadStatus}</p> : null}
        </div>
      </section>
    </main>
  );
}
