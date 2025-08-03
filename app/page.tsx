import Link from "next/link";
import ClassCard from "@/components/ClassCard";
import CoachCard from "@/components/CoachCard";
import MediaGallery from "@/components/MediaGallery";
import MembershipPackages from "@/components/membership-packages";
import ContactForm from "@/components/contact-form";
import Footer from "@/components/footer";
import { dbOperations, type ClassRecord, type CoachRecord } from "@/lib/database";

const PLACEHOLDER_IMAGE = "/images/placeholder.jpg";

type GymClass = ClassRecord & { image?: string | null };

interface ScheduleItem {
  id: number;
  class_id: number;
  class_name: string;
  date: string;
  start_time: string;
  end_time: string;
  coach_name: string;
  status?: string | null;
}

function withImage<T extends { image?: string | null }>(item: T): T {
  return {
    ...item,
    image:
      item.image && item.image !== "/images/logo.png" ? item.image : PLACEHOLDER_IMAGE,
  };
}

export default async function Home() {
  const classes = (dbOperations.getAllClasses() as GymClass[]) || [];
  const coaches =
    ((dbOperations as any).getAllCoaches?.() as CoachRecord[]) || [];
  const instances =
    ((dbOperations as any).getAllClassInstances?.() as any[]) || [];

  const schedule: ScheduleItem[] = Array.isArray(instances)
    ? instances.map((i) => ({
        id: i.id,
        class_id: i.class_id,
        class_name: i.class_name,
        date: i.date,
        start_time: i.start_time,
        end_time: i.end_time,
        coach_name: i.coach_name || i.instructor || i.class_instructor || "TBA",
        status: i.status,
      }))
    : [];

  const upcoming = schedule
    .filter((item) => new Date(item.date) >= new Date())
    .sort(
      (a, b) =>
        new Date(`${a.date}T${a.start_time}`).getTime() -
        new Date(`${b.date}T${b.start_time}`).getTime(),
    )
    .slice(0, 5);

  const displayedClasses = classes.map(withImage);
  const displayedCoaches = coaches.map(withImage);

  return (
    <>
      {/* Hero Section */}
      <section
        className="relative flex h-[80vh] items-center justify-center bg-cover bg-center text-white"
        style={{ backgroundImage: "url('/images/frontpic.png')" }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 space-y-6 text-center">
          <h1 className="text-4xl font-bold md:text-6xl">The Cave Boxing Gym</h1>
          <p className="text-lg md:text-2xl">Train like a champion.</p>
          <Link
            href="/membership"
            className="inline-block rounded bg-brand px-8 py-3 font-medium text-white transition-colors hover:bg-brand-accent"
          >
            Join Now
          </Link>
        </div>
      </section>

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
              Meet All Coaches
            </Link>
          </div>
        </section>

        {/* Media Gallery */}
        <MediaGallery />

        {/* Timetable Section */}
        <section id="timetable" className="px-4">
          <h2 className="mb-8 text-center text-3xl font-bold">Upcoming Classes</h2>
          <ul className="mx-auto max-w-3xl space-y-4">
            {upcoming.map((item) => (
              <li
                key={item.id}
                className="flex flex-col justify-between gap-2 border-b pb-4 sm:flex-row sm:gap-0"
              >
                <div>
                  <p className="font-semibold text-brand">{item.class_name}</p>
                  <p className="text-sm text-brand-dark/70">
                    {item.date} {item.start_time}-{item.end_time}
                  </p>
                </div>
                <span className="text-sm text-brand-dark/70">{item.coach_name}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 text-center">
            <Link href="/schedule" className="text-brand hover:underline">
              View Full Schedule
            </Link>
          </div>
        </section>

        {/* Membership Section */}
        <section id="membership" className="px-4">
          <MembershipPackages />
        </section>

        {/* Contact Section */}
        <section id="contact" className="px-4">
          <h2 className="mb-8 text-center text-3xl font-bold">Contact</h2>
          <div className="mx-auto max-w-xl space-y-4 text-center">
            <p>123 Fight St, Hamilton, ON</p>
            <p>
              <a href="tel:2898925430" className="text-brand hover:underline">
                (289) 892-5430
              </a>
            </p>
            <p>
              <a href="mailto:info@caveboxing.com" className="text-brand hover:underline">
                info@caveboxing.com
              </a>
            </p>
          </div>
          <div className="mt-8 flex justify-center">
            <ContactForm />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
