import Link from "next/link";
import { notFound } from "next/navigation";

async function getCoach(slug: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/coaches/${slug}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

async function getClassesByCoach(coachSlug: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/classes`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.filter((c: any) => c.coach_slug === coachSlug);
}

export default async function CoachPage({ params }: { params: { slug: string } }) {
  const coach = await getCoach(params.slug);
  if (!coach) notFound();
  const classes = await getClassesByCoach(params.slug);
  return (
    <div className="min-h-screen bg-white">
      {coach.image && (
        <img src={coach.image} alt={coach.name} className="w-full h-96 object-cover" />
      )}
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-4 text-red-600">{coach.name}</h1>
        <p className="text-xl mb-2">{coach.role}</p>
        <p className="mb-6">{coach.bio}</p>
        {coach.certifications && (
          <p className="mb-2">
            <strong>Certifications:</strong> {coach.certifications}
          </p>
        )}
        {coach.fight_record && (
          <p className="mb-6">
            <strong>Fight Record:</strong> {coach.fight_record}
          </p>
        )}
        {classes.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-2">Upcoming Classes</h2>
            <ul>
              {classes.map((cls: any) => (
                <li key={cls.slug}>
                  <Link href={`/classes/${cls.slug}`} className="text-red-600 underline">
                    {cls.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
