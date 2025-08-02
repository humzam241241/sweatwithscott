import Link from "next/link";

async function getCoaches() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/coaches`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function CoachesPage() {
  const coaches = await getCoaches();
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

      <section className="card-grid">
        {coaches.map((coach: any) => (
          <Link key={coach.slug} href={`/coaches/${coach.slug}`} className="card">
            <img src={coach.image || "/images/coach-humza.png"} alt={coach.name} />
            <div className="card-overlay">
              <h3>{coach.name}</h3>
              <p>{coach.role}</p>
              <span className="card-link">View Bio</span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
