"use client";
import { useData } from "@/components/ui/data-provider";
import Link from "next/link";

export default function Home() {
  const { classes, coaches, loading } = useData();

  if (loading) return <p>Loading...</p>;

  return (
    <main>
      <section id="classes">
        <h2>Classes</h2>
        <div className="card-grid">
          {classes.map((cls) => (
            <Link key={cls.slug} href={`/classes/${cls.slug}`} className="card">
              <img src={cls.image || "/images/default.png"} alt={cls.name} />
              <h3>{cls.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      <section id="coaches">
        <h2>Coaches</h2>
        <div className="card-grid">
          {coaches.map((coach) => (
            <Link key={coach.slug} href={`/coaches/${coach.slug}`} className="card">
              <img src={coach.image || "/images/default.png"} alt={coach.name} />
              <h3>{coach.name}</h3>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
