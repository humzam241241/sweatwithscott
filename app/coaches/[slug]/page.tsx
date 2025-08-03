import Link from "next/link";
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";

import { Button } from "@/components/ui/button";
import { dbOperations, type CoachRecord } from "@/lib/database";

interface CoachPageProps {
  params: {
    slug: string;
  };
}

export default function CoachPage({ params }: CoachPageProps) {
  const coach: CoachRecord | null = dbOperations.getCoachBySlug(params.slug);
  if (!coach) notFound();

  const imagePath =
    coach.image &&
    fs.existsSync(path.join(process.cwd(), "public", coach.image.replace(/^\/+/, "")))
      ? coach.image
      : "/images/coach-humza.png";

  return (
    <div className="min-h-screen bg-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imagePath} alt={coach.name} className="h-96 w-full object-cover" />
      <div className="mx-auto max-w-4xl p-8">
        <h1 className="mb-4 text-4xl font-bold text-brand">{coach.name}</h1>
        {coach.role && (
          <p className="mb-2 text-xl text-brand-dark/80">{coach.role}</p>
        )}
        {coach.bio && (
          <p className="mb-6 text-brand-dark/80">{coach.bio}</p>
        )}
        {coach.certifications && (
          <p className="mb-2 text-brand-dark/80">
            <strong>Certifications:</strong> {coach.certifications}
          </p>
        )}
        {coach.fight_record && (
          <p className="mb-6 text-brand-dark/80">
            <strong>Fight Record:</strong> {coach.fight_record}
          </p>
        )}

        <Link href="#" className="inline-block">
          <Button>Book a Session</Button>
        </Link>
      </div>
    </div>
  );
}

