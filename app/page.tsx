"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import WeeklySchedule from "@/components/weekly-schedule";
import MembershipPackages from "@/components/membership-packages";
import ContactForm from "@/components/contact-form";
import MediaGallery from "@/components/media-gallery";
import ClassList from "@/components/ui/class-list";
import useData from "@/hooks/use-data";

export default function Home() {
  const { coaches } = useData();
  const [heroType, setHeroType] = useState<"video" | "image" | null>(null);
  const [heroSrc, setHeroSrc] = useState("");

  useEffect(() => {
    const determineHero = async () => {
      try {
        const videoRes = await fetch("/videos/hero.mp4");
        if (videoRes.ok) {
          setHeroType("video");
          setHeroSrc("/videos/hero.mp4");
          return;
        }
      } catch {}

      const imageCandidates = ["/images/hero.jpg", "/images/hero.png"]; // placeholder names
      for (const img of imageCandidates) {
        try {
          const imgRes = await fetch(img);
          if (imgRes.ok) {
            setHeroType("image");
            setHeroSrc(img);
            return;
          }
        } catch {}
      }
    };

    determineHero();
  }, []);

  return (
    <main className="bg-white text-black">
      {/* 🚀 Tailwind Test Box */}
      <div className="bg-brand text-white p-4 rounded-lg text-center">
        🚀 Tailwind brand color is working!
      </div>

      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center">
        {heroType === "video" ? (
          <video
            src={heroSrc}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : heroType === "image" ? (
          <img src={heroSrc} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/40" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white opacity-0 animate-in fade-in slide-in-from-bottom-4">
            Welcome to The Cave Boxing
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white opacity-0 animate-in fade-in slide-in-from-bottom-4 delay-150">
            Train Hard. Fight Smart. Become Unstoppable.
          </p>
          <Link
            href="#classes"
            className="inline-block bg-brand hover:bg-brand-dark text-white px-6 py-3 rounded opacity-0 animate-in fade-in slide-in-from-bottom-4 delay-300 transition-brand"
          >
            Explore Classes
          </Link>
        </div>
      </section>

      {/* Media Section */}
      <section id="media" className="min-h-screen p-8 flex flex-col justify-center bg-gray-100">
        <h2 className="text-4xl font-bold mb-8 text-brand">Media</h2>
        <MediaGallery />
      </section>

      {/* Classes Section */}
      <section id="classes" className="min-h-screen p-8 flex flex-col justify-center">
        <h2 className="text-4xl font-bold mb-4 text-brand">Classes</h2>
        <p className="mb-6 text-lg max-w-xl">
          From Bootcamp to Beginner Boxing, our classes are designed for all skill
          levels to build technique and fitness.
        </p>

        {/* ✅ Auto-refreshing Class List */}
        <ClassList />

        <Link href="/classes" className="text-brand underline font-semibold">
          View All Classes
        </Link>
      </section>

      {/* Coaches Section */}
      <section id="coaches" className="min-h-screen p-8 flex flex-col justify-center bg-gray-100">
        <h2 className="text-4xl font-bold mb-4 text-brand">Coaches</h2>
        <p className="mb-6 text-lg max-w-xl">
          Meet the experienced team that will push you to your limits and guide your boxing journey.
        </p>
        <div className="card-grid">
          {coaches?.map((coach: any) => (
            <Link key={coach.slug} href={`/coaches/${coach.slug}`} className="card">
              <img src={coach.image || "/images/coach-humza.png"} alt={coach.name} />
              <div className="card-overlay">
                <h3>{coach.name}</h3>
                <p>{coach.role}</p>
                <span className="card-link">View Bio</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Schedule Section */}
      <section id="schedule" className="min-h-screen p-8 flex flex-col justify-center">
        <h2 className="text-4xl font-bold mb-8 text-brand">Schedule</h2>
        <WeeklySchedule />
      </section>

      {/* Membership Section */}
      <section id="membership" className="min-h-screen p-8 flex flex-col justify-center bg-gray-100">
        <h2 className="text-4xl font-bold mb-8 text-brand">Membership</h2>
        <MembershipPackages />
      </section>

      {/* About Section */}
      <section id="about" className="min-h-screen p-8 flex flex-col justify-center">
        <h2 className="text-4xl font-bold mb-4 text-brand">About</h2>
        <p className="mb-6 text-lg max-w-2xl">
          The Cave Boxing is a community where fighters of all levels come together
          to push their limits and grow stronger.
        </p>
      </section>

      {/* Contact Section */}
      <section id="contact" className="min-h-screen p-8 flex flex-col justify-center bg-gray-100">
        <h2 className="text-4xl font-bold mb-8 text-brand">Contact Us</h2>
        <ContactForm />
      </section>
    </main>
  );
}

