"use client";

import Link from "next/link";
import Hero from "@/components/Hero";
import ClassCard from "@/components/ClassCard";
import CoachCard from "@/components/CoachCard";
import MediaGallery from "@/components/MediaGallery";
import Timetable from "@/components/Timetable";
import MembershipPackages from "@/components/membership-packages";
import ContactForm from "@/components/contact-form";
import Footer from "@/components/footer";
import { useData } from "@/components/ui/data-provider";

// The homepage displays a fixed number of class and coach cards. When the
// backend returns fewer items, placeholder cards are used to maintain the
// layout.
export default function Home() {
  const { classes, coaches, loading } = useData();

  if (loading) return <p>Loading...</p>;

  /**
   * Classes
   */
  const classPlaceholders = [
    { slug: "boxing-basics", name: "Boxing Basics", image: "/images/boxing-training.png" },
    {
      slug: "strength-conditioning",
      name: "Strength & Conditioning",
      image: "/images/strength-conditioning.png",
    },
    { slug: "junior-jabbers", name: "Junior Jabbers", image: "/images/junior-jabbers.png" },
    { slug: "beginner-boxing", name: "Beginner Boxing", image: "/images/boxing-training.png" },
  ];

  const displayedClasses = [...classes];
  const classNames = new Set(displayedClasses.map((c: any) => c.name));
  classPlaceholders.forEach((ph) => {
    if (displayedClasses.length < 4 && !classNames.has(ph.name)) {
      displayedClasses.push(ph);
    }
  });
  displayedClasses.splice(4);

  /**
   * Coaches
   * If any coach named "Shannon" is returned, replace with Humza Muhammad.
   */
  const normalizedCoaches = coaches.map((coach: any) => {
    const adjusted = coach.name?.toLowerCase().includes("shannon")
      ? {
          ...coach,
          slug: "humza-muhammad",
          name: "Humza Muhammad",
          role: "Coach & Trainer",
          bio: "Dedicated boxing coach passionate about helping members reach peak performance.",
          image: "/images/coach-humza.png",
        }
      : coach;
    return {
      ...adjusted,
      image:
        adjusted.image && adjusted.image !== "/images/logo.png"
          ? adjusted.image
          : "/images/coach-humza.png",
    };
  });

  const coachPlaceholders = [
    {
      slug: "humza-muhammad",
      name: "Humza Muhammad",
      role: "Coach & Trainer",
      bio: "Dedicated boxing coach passionate about helping members reach peak performance.",
      image: "/images/coach-humza.png",
    },
    {
      slug: "placeholder-coach-1",
      name: "Coach Placeholder 1",
      role: "Coach",
      image: "/images/coach-scott.png",
    },
    {
      slug: "placeholder-coach-2",
      name: "Coach Placeholder 2",
      role: "Coach",
      image: "/images/kyle-mclaughlin.png",
    },
  ];

  const displayedCoaches = normalizedCoaches.slice(0, 3);
  const coachNames = new Set(displayedCoaches.map((c: any) => c.name));
  coachPlaceholders.forEach((ph) => {
    if (displayedCoaches.length < 3 && !coachNames.has(ph.name)) {
      displayedCoaches.push(ph);
    }
  });

  return (
    <>
      <Hero />
      <main className="space-y-32 py-24">
        {/* Classes Section */}
        <section id="classes" className="px-4">
          <h2 className="mb-8 text-center text-3xl font-bold">Classes</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {displayedClasses.map((cls: any) => (
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
            {displayedCoaches.map((coach: any) => (
              <CoachCard key={coach.slug} coach={coach} />
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/coaches" className="text-brand hover:underline">
              Meet All Coaches
            </Link>
          </div>
        </section>

        {/* Media Gallery */}
        <MediaGallery />

        {/* Schedule Preview */}
        <section id="schedule" className="px-4">
          <h2 className="mb-8 text-center text-3xl font-bold">Schedule</h2>
          <Timetable />
          <div className="mt-6 text-center">
            <Link href="/schedule" className="text-brand hover:underline">
              View Full Schedule
            </Link>
          </div>
        </section>

        {/* Membership */}
        <section id="membership" className="px-4">
          <MembershipPackages />
        </section>

        {/* About */}
        <section id="about" className="px-4">
          <h2 className="mb-4 text-center text-3xl font-bold">About Us</h2>
          <p className="mx-auto max-w-2xl text-center text-brand-dark/80">
            The Cave Boxing Gym is built on community, discipline and hard work. Learn more
            about our story and values.
          </p>
          <div className="mt-6 text-center">
            <Link href="/about" className="text-brand hover:underline">
              Read Our Story
            </Link>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="px-4">
          <h2 className="mb-8 text-center text-3xl font-bold">Contact</h2>
          <div className="flex justify-center">
            <ContactForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

