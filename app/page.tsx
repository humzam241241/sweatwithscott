"use client";

import { useData } from "@/components/ui/data-provider";
import Link from "next/link";

export default function Home() {
  const { classes, coaches, loading } = useData();

  if (loading) return <p>Loading...</p>;

  return (
    <main className="space-y-24">
      {/* Classes Section */}
      <section id="classes" className="px-4">
        <h2 className="mb-8 text-center text-3xl font-bold">Classes</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <Link
              key={cls.slug}
              href={`/classes/${cls.slug}`}
              className="group overflow-hidden rounded-xl bg-white shadow transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <img
                src={cls.image || "/images/default.png"}
                alt={cls.name}
                className="h-48 w-full object-cover"
              />
              <div className="p-6">
                <h3 className="mb-2 text-xl font-semibold">{cls.name}</h3>
                {cls.description && (
                  <p className="text-sm text-gray-600">
                    {cls.description.length > 100
                      ? cls.description.substring(0, 100) + "..."
                      : cls.description}
                  </p>
                )}
              </div>
            </Link>
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
            <Link
              key={coach.slug}
              href={`/coaches/${coach.slug}`}
              className="group rounded-xl bg-white shadow transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex flex-col items-center p-6 text-center">
                <img
                  src={coach.image || "/images/default.png"}
                  alt={coach.name}
                  className="mb-4 h-32 w-32 rounded-full object-cover"
                />
                <h3 className="text-xl font-semibold">{coach.name}</h3>
                {coach.role && (
                  <p className="text-sm text-gray-500">{coach.role}</p>
                )}
                {coach.bio && (
                  <p className="mt-2 text-sm text-gray-600">
                    {coach.bio.length > 100
                      ? coach.bio.substring(0, 100) + "..."
                      : coach.bio}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href="/coaches" className="text-brand hover:underline">
            View All Coaches
          </Link>
        </div>
      </section>

      {/* Media Section */}
      <section id="media" className="px-4 text-center">
        <h2 className="mb-4 text-3xl font-bold">Media</h2>
        <p className="mx-auto max-w-2xl text-gray-600">
          Explore highlights from our gym and community.
        </p>
        <div className="mt-6">
          <Link href="/media" className="text-brand hover:underline">
            View Media
          </Link>
        </div>
      </section>

      {/* Schedule Section */}
      <section id="schedule" className="px-4 text-center">
        <h2 className="mb-4 text-3xl font-bold">Schedule</h2>
        <p className="mx-auto max-w-2xl text-gray-600">
          Find the perfect class time that fits your routine.
        </p>
        <div className="mt-6">
          <Link href="/schedule" className="text-brand hover:underline">
            View Schedule
          </Link>
        </div>
      </section>

      {/* Membership Section */}
      <section id="membership" className="px-4 text-center">
        <h2 className="mb-4 text-3xl font-bold">Membership</h2>
        <p className="mx-auto max-w-2xl text-gray-600">
          Flexible membership options for every goal.
        </p>
        <div className="mt-6">
          <Link href="/membership" className="text-brand hover:underline">
            View Memberships
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="px-4 text-center">
        <h2 className="mb-4 text-3xl font-bold">About</h2>
        <p className="mx-auto max-w-2xl text-gray-600">
          Learn more about Cave Boxing and our mission.
        </p>
        <div className="mt-6">
          <Link href="/about" className="text-brand hover:underline">
            About Us
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="mb-24 px-4 text-center">
        <h2 className="mb-4 text-3xl font-bold">Contact</h2>
        <p className="mx-auto max-w-2xl text-gray-600">
          Have questions? Get in touch with our team.
        </p>
        <div className="mt-6">
          <Link href="/contact" className="text-brand hover:underline">
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
}

