"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
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

  return (
    <>
      <Navbar />
      <Hero />
      <main className="space-y-32 py-24">
        {/* Classes Section */}
        <section id="classes" className="px-4">
          <h2 className="mb-8 text-center text-3xl font-bold">Classes</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls) => (
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
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {coaches.map((coach) => (
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
