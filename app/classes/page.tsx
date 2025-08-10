export const dynamic = 'force-dynamic';
import CoachCard from "@/components/CoachCard";
import ClassCard from "@/components/ClassCard";
import type { ClassRecord, CoachRecord } from "@/lib/types";

async function getClasses(): Promise<ClassRecord[]> {
  try {
    const { headers } = await import("next/headers");
    const h = await headers();
    const proto = h.get("x-forwarded-proto") ?? "http";
    const host = h.get("host") ?? "";
    const base = host ? `${proto}://${host}` : "";
    const res = await fetch(`${base}/api/classes`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Error fetching classes:", error);
    return [];
  }
}

async function getCoaches(): Promise<CoachRecord[]> {
  try {
    const { headers } = await import("next/headers");
    const h = await headers();
    const proto = h.get("x-forwarded-proto") ?? "http";
    const host = h.get("host") ?? "";
    const base = host ? `${proto}://${host}` : "";
    const res = await fetch(`${base}/api/coaches`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Error fetching coaches:", error);
    return [];
  }
}

export default async function HomePage() {
  const [classes, coaches] = await Promise.all([getClasses(), getCoaches()]);

  return (
    <div className="min-h-screen">
      {/* HERO / HEADER */}
      <header className="cave-hero py-20 text-center">
        <h1 className="text-5xl font-black mb-6">Our Classes</h1>
        <p className="text-xl">Find the perfect training program for your fitness journey.</p>
      </header>

      {/* CLASSES */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="mb-8 text-center text-3xl font-bold">Our Classes</h2>
        {classes.length ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls) => (
              <ClassCard key={cls.slug ?? cls.id} cls={cls} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No classes available.</p>
        )}
      </section>

      {/* COACHES */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="mb-8 text-center text-3xl font-bold">Meet Our Coaches</h2>
          {coaches.length ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {coaches.map((coach) => (
                <CoachCard key={coach.slug ?? coach.id} coach={coach} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No coaches available.</p>
          )}
        </div>
      </section>
    </div>
  );
}

