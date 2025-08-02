"use client";

import Link from "next/link";
import Hero from "@/components/Hero";
import ClassCard from "@/components/ClassCard";
import CoachCard from "@/components/CoachCard";
import MediaGallery from "@/components/MediaGallery";
import Timetable from "@/components/Timetable";
import Footer from "@/components/footer";
import { useData } from "@/components/ui/data-provider";

export default function Home() {
  const { classes, coaches, loading } = useData();

  if (loading) return <p>Loading...</p>;

  const displayedClasses = classes.slice(0, 4);
  const displayedCoaches = coaches
    .map((coach) =>
      coach.name?.toLowerCase().includes("shannon")
        ? {
            ...coach,
            slug: "humza-muhammad",
            name: "Humza Muhammad",
            role: "Coach & Trainer",
            bio: "Dedicated boxing coach passionate about helping members reach peak performance.",
            image: "/images/coach-humza.png",
          }
        : coach
    )
    .slice(0, 3);

  return (
    <>
      <Hero />
      <main className="space-y-32 py-24">
        {/* Classes Section */}
        <section id="classes" className="px-4">
          <h2 className="mb-8 text-center text-3xl font-bold">Classes</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {displayedClasses.map((cls) => (
              <ClassCard key={cls.slug} cls={cls} />
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/classes" className="text-brand hover:underline">
              View All Classes
            </Link>
          </div>
        </section>

        {/* Coaches Section */}
        <section id="coaches" className="px-4">
          <h2 className="mb-8 text-center text-3xl font-bold">Coaches</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {displayedCoaches.map((coach) => (
              <CoachCard key={coach.slug} coach={coach} />
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/coaches" className="text-brand hover:underline">
              View All Coaches
            </Link>
          </div>
        </section>

        {/* Timetable Section */}
        <section id="timetable" className="px-4">
          <h2 className="mb-8 text-center text-3xl font-bold">Schedule</h2>
          <Timetable />
        </section>

        {/* Media Section */}
        <MediaGallery />
      </main>
      <Footer />
    </>
  );
}
