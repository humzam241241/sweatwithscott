export const dynamic = 'force-dynamic';
import Link from "next/link";
import { filterUniqueCoaches } from "@/lib/filterUniqueCoaches";

async function getCoaches() {
  try {
    const { headers } = await import("next/headers");
    const h = await headers();
    const proto = h.get("x-forwarded-proto") ?? "http";
    const host = h.get("host") ?? "";
    const base = host ? `${proto}://${host}` : "";
    const res = await fetch(`${base}/api/coaches`, { cache: "no-store" });
    if (!res.ok) return [] as any[];
    return res.json();
  } catch (error) {
    console.error("Error fetching coaches:", error);
    return [] as any[];
  }
}

export default async function CoachesPage() {
  const fetched = await getCoaches();
  const filtered = filterUniqueCoaches(fetched as any[]);

  const coaches = filtered.map((coach: any) => {
    const adjusted = coach.name?.toLowerCase().includes("shannon")
      ? {
          ...coach,
          slug: "humza-muhammad",
          name: "Humza Muhammad",
          role: "Coach & Trainer",
          bio: "Dedicated boxing coach passionate about helping members reach peak performance.",
          image: "/images/coach-humza.png",
        }
      : coach;

    return {
      ...adjusted,
      image:
        adjusted.image && adjusted.image !== "/images/logo.png"
          ? adjusted.image
          : "/images/coach-humza.png",
    } as any;
  });

  return (
    <div className="min-h-screen">
      <header className="cave-hero py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-black mb-6">Meet Our Coaches</h1>
          <p className="text-xl">
            Learn from experienced trainers who bring passion, skill, and dedication to every class.
          </p>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {coaches.map((coach: any) => (
          <Link key={coach.slug} href={`/coaches/${coach.slug}`} className="group rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow bg-white">
            <img src={coach.image || "/images/coach-humza.png"} alt={coach.name} className="h-56 w-full object-cover" />
            <div className="p-4">
              <h3 className="font-semibold text-lg group-hover:text-red-600">{coach.name}</h3>
              <p className="text-sm text-gray-600">{coach.role}</p>
              <span className="text-sm text-red-600 underline">View Bio</span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
