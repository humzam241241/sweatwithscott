import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { dbOperations } from "@/lib/database";

interface CoachRecord {
  id: number;
  slug: string;
  name: string;
  role?: string | null;
  bio?: string | null;
  image?: string | null;
  certifications?: string | null;
  fight_record?: string | null;
}

interface CoachPageProps {
  params: {
    slug: string;
  };
}

export default function CoachPage({ params }: CoachPageProps) {
  const coach: CoachRecord | null = dbOperations.getCoachBySlug(params.slug);
  if (!coach) notFound();

  return (
    <div className="min-h-screen bg-white">
      {coach.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coach.image} alt={coach.name} className="h-96 w-full object-cover" />
      )}
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

