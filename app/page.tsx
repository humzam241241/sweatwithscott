import Link from "next/link";
import ClassCard from "@/components/ClassCard";
import CoachCard from "@/components/CoachCard";
import MediaGallery from "@/components/MediaGallery";
import MembershipPackages from "@/components/membership-packages";
import ContactForm from "@/components/contact-form";
import Footer from "@/components/footer";

interface GymClass {
  slug: string;
  name: string;
  description?: string | null;
  image?: string | null;
}

interface Coach {
  slug: string;
  name: string;
  role?: string | null;
  bio?: string | null;
  image?: string | null;
}

interface ScheduleItem {
  id: number;
  class_name: string;
  date: string;
  start_time: string;
  end_time: string;
  coach_name: string;
}

async function fetchClasses(): Promise<GymClass[]> {
  const res = await fetch("/api/classes/all", { next: { revalidate: 60 } });
  if (!res.ok) return [];
  return (await res.json()) as GymClass[];
}

async function fetchCoaches(): Promise<Coach[]> {
  const urls = ["/api/coaches/all", "/api/coaches"];
  for (const url of urls) {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (res.ok) {
      return (await res.json()) as Coach[];
    }
  }
  return [];
}

async function fetchSchedule(): Promise<ScheduleItem[]> {
  const res = await fetch("/api/schedule", { next: { revalidate: 60 } });
  if (!res.ok) return [];
  return (await res.json()) as ScheduleItem[];
}

function ensureClassImage(image?: string | null) {
  return image && image !== "/images/logo.png" ? image : "/images/boxing-training.png";
}

function ensureCoachImage(image?: string | null) {
  return image && image !== "/images/logo.png" ? image : "/images/coach-humza.png";
}

export default async function Home() {
  const [classes, coaches, schedule] = await Promise.all([
    fetchClasses(),
    fetchCoaches(),
    fetchSchedule(),
  ]);

  const displayedClasses = classes.map((c) => ({ ...c, image: ensureClassImage(c.image) }));
  const displayedCoaches = coaches.map((c) => ({ ...c, image: ensureCoachImage(c.image) }));
  const upcoming = schedule.slice(0, 5);

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

        {/* Schedule Section */}
        <section id="schedule" className="px-4">
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

