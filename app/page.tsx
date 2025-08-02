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

  console.log("Fetched classes:", classes);
  console.log("Fetched coaches:", coaches);

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
  const classPlaceholders = [
    {
      slug: "boxing-basics",
      name: "Boxing Basics",
      image: "/images/boxing-basics.png",
    },
    {
      slug: "strength-conditioning",
      name: "Strength & Conditioning",
      image: "/images/strength-conditioning.png",
    },
    {
      slug: "junior-jabbers",
      name: "Junior Jabbers",
      image: "/images/junior-jabbers.png",
    },
    {
      slug: "beginner-boxing",
      name: "Beginner Boxing",
      image: "/images/beginner-boxing.png",
    },
  ];

  const displayedClasses = [...classes];
  const classNames = new Set(displayedClasses.map((c) => c.name));
  classPlaceholders.forEach((ph) => {
    if (displayedClasses.length < 4 && !classNames.has(ph.name)) {
      displayedClasses.push(ph);
    }
  });
  displayedClasses.splice(4);

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
      image: "/images/coach-placeholder-1.jpg",
    },
    {
      slug: "placeholder-coach-2",
      name: "Coach Placeholder 2",
      role: "Coach",
      image: "/images/coach-placeholder-2.jpg",
    },
  ];

  const normalizedCoaches = coaches.map((coach) =>
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
  );

  const displayedCoaches = normalizedCoaches.slice(0, 3);
  const coachNames = new Set(displayedCoaches.map((c) => c.name));
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