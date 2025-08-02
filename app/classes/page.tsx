import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getClasses() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/classes`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function ClassesPage() {
  const classes = await getClasses();
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-gradient-to-r from-brand to-brand-dark py-20 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="mb-6 text-5xl font-bold">Our Classes</h1>
          <p className="mb-8 text-xl">
            Choose from our wide range of classes to improve your boxing skills, fitness, and strength.
          </p>
          <div className="mt-6 flex justify-center space-x-4">
            <Link href="/dashboard/member">
              <Button size="lg" variant="outline" className="bg-white text-brand hover:bg-brand-light">
                View My Bookings
              </Button>
            </Link>
            <Link href="/dashboard/member">
              <Button size="lg" variant="outline" className="bg-white text-brand hover:bg-brand-light">
                Book Classes
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Available Classes</h2>
        <div className="card-grid">
          {classes.map((cls: any) => (
            <Link key={cls.slug} href={`/classes/${cls.slug}`} className="card">
              <img src={cls.image || "/images/gym-training.png"} alt={cls.name} />
              <div className="card-overlay">
                <h3>{cls.name}</h3>
                <p>{cls.description}</p>
                <span className="card-link">Learn More</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
