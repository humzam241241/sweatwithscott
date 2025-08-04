import Link from "next/link";
import ClassCard from "@/components/ClassCard";
import CoachCard from "@/components/CoachCard";
import MediaGallery from "@/components/MediaGallery";
import MembershipPackages from "@/components/membership-packages";
import ContactForm from "@/components/contact-form";
import Footer from "@/components/footer";
import type {
  ClassRecord,
  CoachRecord,
  MediaRecord,
  MembershipPackageRecord,
} from "@/lib/types";

const PLACEHOLDER_IMAGE = "/images/placeholder.jpg";

// ----- FALLBACK HERO DATA -----
const fallbackHero = {
  title: "The Cave Boxing Gym",
  subtitle: "Train like a champion.",
  bg: "/images/frontpic.png",
};

// ----- IMAGE HELPER -----
function withImage<T extends { image?: string | null }>(item: T): T {
  return {
    ...item,
    image:
      item.image && item.image !== "/images/logo.png"
        ? item.image
        : PLACEHOLDER_IMAGE,
  };
}

export default async function Home() {
  const [settings, classesData, coachesData, scheduleData, mediaData, packagesData] =
    await Promise.all([
      fetch("/api/settings")
        .then((r) => r.json())
        .catch(() => ({} as Record<string, string>)),
      fetch("/api/classes", { cache: "no-store" })
        .then((r) => r.json())
        .catch(() => [] as ClassRecord[]),
      fetch("/api/coaches", { cache: "no-store" })
        .then((r) => r.json())
        .catch(() => [] as CoachRecord[]),
      fetch("/api/schedule", { cache: "no-store" })
        .then((r) => r.json())
        .catch(() => []),
      fetch("/api/media", { cache: "no-store" })
        .then((r) => r.json())
        .catch(() => [] as MediaRecord[]),
      fetch("/api/packages", { cache: "no-store" })
        .then((r) => r.json())
        .catch(() => [] as MembershipPackageRecord[]),
    ]);

  const heroTitle = (settings as any).hero_title ?? fallbackHero.title;
  const heroSubtitle = (settings as any).hero_subtitle ?? fallbackHero.subtitle;
  const heroBg = (settings as any).hero_bg ?? fallbackHero.bg;

  const classes = Array.isArray(classesData) ? classesData : [];
  const coaches = Array.isArray(coachesData) ? coachesData : [];
  const media = Array.isArray(mediaData) ? mediaData : [];
  const packages = Array.isArray(packagesData) ? packagesData : [];

  const contactAddress =
    (settings as any).contact_address ?? "123 Fight St, Hamilton, ON";
  const contactPhone =
    (settings as any).contact_phone ?? "(289) 892-5430";
  const contactEmail =
    (settings as any).contact_email ?? "info@caveboxing.com";

  // Prepare data with images and fallbacks
  // Show only one unique class per name
  const seen = new Set();
  const uniqueClasses = classes.filter(cls => {
    const lowerName = cls.name?.toLowerCase();
    if (!lowerName) return false;
    if (seen.has(lowerName)) return false;
    seen.add(lowerName);
    return true;
  });
  const finalClasses = uniqueClasses.map(withImage);

  const finalCoaches = coaches.map(withImage);
  const finalMedia = media;
  const finalPackages = packages;

  const schedule =
    Array.isArray(scheduleData) && scheduleData.length
      ? scheduleData.map((i: any) => ({
          id: i.id,
          class_id: i.class_id,
          class_name: i.class_name,
          date: i.date,
          day_of_week: i.day_of_week ?? "",
          start_time: i.start_time,
          end_time: i.end_time,
          coach_name: i.coach_name || "TBA",
          status: i.status,
        }))
      : [];

  const mediaItems = finalMedia.length
    ? finalMedia.map((m) => ({
        id: m.id,
        fileUrl: (m as any).url ?? (m as any).fileUrl,
        title: m.title ?? "",
        category: (m as any).type ?? "all",
      }))
    : [];

  const packageItems = finalPackages.length
    ? finalPackages.map((p) => ({
        name: p.name,
        price: `$${p.price ?? 0}`,
        period: "",
        description: p.description ?? "",
        features: p.features ? JSON.parse(p.features) : [],
        popular: false,
        buttonText: "Join Now",
        buttonLink: "/membership",
      }))
    : undefined;

  const upcoming = schedule
    .filter((item) => new Date(item.date) >= new Date())
    .sort(
      (a, b) =>
        new Date(`${a.date}T${a.start_time}`).getTime() -
        new Date(`${b.date}T${b.start_time}`).getTime(),
    )
    .slice(0, 5);

  return (
    <>
      {/* Hero Section */}
      <section
        className="relative flex h-[80vh] items-center justify-center bg-cover bg-center text-white"
        style={{ backgroundImage: `url('${heroBg}')` }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 space-y-6 text-center">
          <h1 className="text-4xl font-bold md:text-6xl">{heroTitle}</h1>
          <p className="text-lg md:text-2xl">{heroSubtitle}</p>
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
            {finalClasses.length ? (
              finalClasses.map((cls) => <ClassCard key={cls.slug ?? cls.name} cls={cls} />)
            ) : (
              <p className="col-span-full text-center text-sm text-brand-dark/70">
                No classes available.
              </p>
            )}
          </div>
          <div className="mt-6 text-center">
            <Link href="/classes" className="text-brand hover:underline">
              View All Classes
            </Link>
          </div>
        </section>

        {/* Weekly Schedule Section */}
        <section id="weekly-schedule" className="px-4 mt-16">
          <h2 className="mb-8 text-center text-3xl font-bold">Weekly Schedule</h2>
          {schedule.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Day</th>
                    <th className="px-4 py-2 text-left">Class</th>
                    <th className="px-4 py-2 text-left">Time</th>
                    <th className="px-4 py-2 text-left">Coach</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="px-4 py-2">
                        {item.date
                          ? new Date(item.date).toLocaleDateString("en-US", {
                              weekday: "long",
                            })
                          : item.day_of_week || "TBA"}
                      </td>
                      <td className="px-4 py-2">{item.class_name}</td>
                      <td className="px-4 py-2">
                        {item.start_time} - {item.end_time}
                      </td>
                      <td className="px-4 py-2">{item.coach_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-sm text-gray-500">
              No schedule available yet — check back soon!
            </p>
          )}
        </section>

        {/* Coaches Section */}
        <section id="coaches" className="px-4">
          <h2 className="mb-8 text-center text-3xl font-bold">Coaches</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {finalCoaches.length ? (
              finalCoaches.map((coach) => <CoachCard key={coach.slug ?? coach.name} coach={coach} />)
            ) : (
              <p className="col-span-full text-center text-sm text-brand-dark/70">
                No coaches available.
              </p>
            )}
          </div>
          <div className="mt-6 text-center">
            <Link href="/coaches" className="text-brand hover:underline">
              Meet All Coaches
            </Link>
          </div>
        </section>

        {/* Media Gallery */}
        {mediaItems.length ? (
          <MediaGallery items={mediaItems} />
        ) : (
          <p className="text-center text-sm text-brand-dark/70">
            No media available.
          </p>
        )}

        {/* Timetable Section */}
        {upcoming.length > 0 && (
          <section id="timetable" className="px-4">
            <h2 className="mb-8 text-center text-3xl font-bold">
              Upcoming Classes
            </h2>
            <ul className="mx-auto max-w-3xl space-y-4">
              {upcoming.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col justify-between gap-2 border-b pb-4 sm:flex-row sm:gap-0"
                >
                  <div>
                    <p className="font-semibold text-brand">
                      {item.class_name}
                    </p>
                    <p className="text-sm text-brand-dark/70">
                      {item.date} {item.start_time}-{item.end_time}
                    </p>
                  </div>
                  <span className="text-sm text-brand-dark/70">
                    {item.coach_name}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-6 text-center">
              <Link href="/schedule" className="text-brand hover:underline">
                View Full Schedule
              </Link>
            </div>
          </section>
        )}

        {/* Membership Section */}
        <section id="membership" className="px-4">
          <MembershipPackages packages={packageItems} />
        </section>

        {/* Contact Section */}
        <section id="contact" className="px-4">
          <h2 className="mb-8 text-center text-3xl font-bold">Contact</h2>
          <div className="mx-auto max-w-xl space-y-4 text-center">
            <p>{contactAddress}</p>
            <p>
              <a href={`tel:${contactPhone}`} className="text-brand hover:underline">
                {contactPhone}
              </a>
            </p>
            <p>
              <a
                href={`mailto:${contactEmail}`}
                className="text-brand hover:underline"
              >
                {contactEmail}
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
