import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { dbOperations, type ClassRecord } from "@/lib/database";

interface ClassPageProps {
  params: {
    slug: string;
  };
}

export default function ClassPage({ params }: ClassPageProps) {
  const cls: ClassRecord | null = dbOperations.getClassBySlug(params.slug);
  if (!cls) notFound();

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl p-8">
        <h1 className="mb-4 text-4xl font-bold text-brand">{cls.name}</h1>

        {cls.instructor && (
          <p className="mb-2 text-lg font-medium text-brand-dark">
            Coach: {cls.instructor}
          </p>
        )}

        {cls.description && (
          <p className="mb-6 text-brand-dark/80">{cls.description}</p>
        )}

        <ul className="mb-6 space-y-2">
          {cls.duration != null && <li>Duration: {cls.duration} minutes</li>}
          {cls.price != null && <li>{`Price: $${cls.price.toFixed(2)}`}</li>}
          {cls.day_of_week && cls.start_time && cls.end_time && (
            <li>
              Schedule: {cls.day_of_week} {cls.start_time} - {cls.end_time}
            </li>
          )}
          {cls.max_capacity != null && <li>Max Capacity: {cls.max_capacity}</li>}
        </ul>

        <Link href="#" className="inline-block">
          <Button>Book This Class</Button>
        </Link>
      </div>
    </div>
  );
}

