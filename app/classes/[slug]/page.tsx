import Link from "next/link";
import { notFound } from "next/navigation";

async function getClass(slug: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/classes/${slug}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function ClassPage({ params }: { params: { slug: string } }) {
  const cls = await getClass(params.slug);
  if (!cls) notFound();
  const schedule = cls.schedule ? JSON.parse(cls.schedule) : [];
  return (
    <div className="min-h-screen bg-white">
      {cls.image && (
        <img src={cls.image} alt={cls.name} className="h-96 w-full object-cover" />
      )}
      <div className="mx-auto max-w-4xl p-8">
        <h1 className="mb-4 text-4xl font-bold text-brand">{cls.name}</h1>
        <p className="mb-6 text-brand-dark/80">{cls.description}</p>
        {schedule.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-2 text-2xl font-semibold">Schedule</h2>
            <ul>
              {schedule.map((s: any, idx: number) => (
                <li key={idx}>{`${s.day} ${s.time} (${s.spots} spots)`}</li>
              ))}
            </ul>
          </div>
        )}
        {cls.coach_slug && (
          <div className="mb-6">
            <h2 className="mb-2 text-2xl font-semibold">Coach</h2>
            <Link href={`/coaches/${cls.coach_slug}`} className="text-brand underline">
              {cls.coach_name}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
