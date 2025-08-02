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
      <header className="bg-gradient-to-r from-red-600 to-red-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Our Classes</h1>
          <p className="text-xl mb-8">
            Choose from our wide range of classes to improve your boxing skills, fitness, and strength.
          </p>
          <div className="flex justify-center space-x-4 mt-6">
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="bg-white text-red-600 hover:bg-gray-100">
                View My Bookings
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="bg-white text-red-600 hover:bg-gray-100">
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
