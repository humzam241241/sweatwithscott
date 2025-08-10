export const dynamic = 'force-dynamic';
import Link from "next/link";
import type { ClassRecord } from "@/lib/types";

const placeholderClasses: ClassRecord[] = [
  {
    id: 0,
    slug: "sample-class",
    name: "Sample Class",
    description: "This is a placeholder class.",
    coach_name: "Sample Coach",
    day_of_week: "Monday",
    start_time: "09:00",
    end_time: "10:00",
    image: "/images/boxing-training.png",
  },
];

export default async function ClassPage({
  params,
}: {
  params: { slug: string };
}) {
  let classes: ClassRecord[] = [];
  try {
    const res = await fetch(`/api/classes`, { cache: "no-store" });
    classes = (await res.json()) as ClassRecord[];
  } catch {
    classes = [];
  }
  if (classes.length === 0) {
    classes = placeholderClasses;
  }
  const cls = classes.find((c) => c.slug === params.slug);
  if (!cls) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-8">
        <p className="text-2xl font-bold text-brand mb-4">Class Not Found</p>
        <Link href="/classes" className="text-brand underline">
          ← Back to All Classes
        </Link>
      </div>
    );
  }

  const schedule =
    cls.day_of_week && cls.start_time && cls.end_time
      ? `${cls.day_of_week} ${cls.start_time} - ${cls.end_time}`
      : null;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl p-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cls.image || "/images/boxing-training.png"}
          alt={cls.name}
          className="mb-6 h-80 w-full object-cover"
        />
        <h1 className="mb-4 text-4xl font-bold text-brand">{cls.name}</h1>
        {cls.coach_name && (
          <p className="mb-2 text-lg text-brand-dark">
            Coach: {cls.coach_name}
          </p>
        )}
        {cls.description && (
          <p className="mb-6 text-brand-dark/80">{cls.description}</p>
        )}
        <ul className="mb-6 space-y-2">
          {schedule && <li>Schedule: {schedule}</li>}
        </ul>
        <Link href="/classes" className="text-brand underline">
          ← Back to All Classes
        </Link>
      </div>
    </div>
  );
}
