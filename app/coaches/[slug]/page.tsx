import Link from "next/link";
import type { CoachRecord, ClassRecord } from "@/lib/types";

const placeholderCoaches: CoachRecord[] = [
  {
    id: 0,
    slug: "sample-coach",
    name: "Sample Coach",
    bio: "This is a placeholder coach.",
    certifications: "Certified Trainer",
    image: "/images/coach-humza.png",
  },
];

const placeholderClasses: ClassRecord[] = [
  {
    id: 0,
    slug: "sample-class",
    name: "Sample Class",
    description: "Placeholder class",
    coach_name: "Sample Coach",
    day_of_week: "Monday",
    start_time: "09:00",
    end_time: "10:00",
    image: "/images/boxing-training.png",
  },
];

export default async function CoachPage({
  params,
}: {
  params: { slug: string };
}) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  let coaches: CoachRecord[] = [];
  try {
    const res = await fetch(`${base}/api/coaches`, { cache: "no-store" });
    coaches = (await res.json()) as CoachRecord[];
  } catch {
    coaches = [];
  }
  if (coaches.length === 0) {
    coaches = placeholderCoaches;
  }
  const coach = coaches.find((c) => c.slug === params.slug);
  if (!coach) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-8">
        <p className="mb-4 text-2xl font-bold text-brand">Coach Not Found</p>
        <Link href="/coaches" className="text-brand underline">
          ← Back to All Coaches
        </Link>
      </div>
    );
  }

  let classes: ClassRecord[] = [];
  try {
    const res = await fetch(`${base}/api/classes`, { cache: "no-store" });
    classes = (await res.json()) as ClassRecord[];
  } catch {
    classes = [];
  }
  if (classes.length === 0) {
    classes = placeholderClasses;
  }
  const related = classes.filter((cls) => cls.coach_name === coach.name);

  const image = coach.image || "/images/coach-humza.png";

  return (
    <div className="min-h-screen bg-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt={coach.name} className="h-96 w-full object-cover" />
      <div className="mx-auto max-w-4xl p-8">
        <h1 className="mb-4 text-4xl font-bold text-brand">{coach.name}</h1>
        {coach.bio && (
          <p className="mb-4 text-brand-dark/80">{coach.bio}</p>
        )}
        {coach.certifications && (
          <p className="mb-6 text-brand-dark/80">
            <strong>Certifications:</strong> {coach.certifications}
          </p>
        )}
        {related.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-2 text-xl font-semibold text-brand">Classes</h2>
            <ul className="list-disc list-inside space-y-1">
              {related.map((cls) => (
                <li key={cls.slug}>
                  <Link href={`/classes/${cls.slug}`} className="text-brand underline">
                    {cls.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Link href="/coaches" className="text-brand underline">
          ← Back to All Coaches
        </Link>
      </div>
    </div>
  );
}
