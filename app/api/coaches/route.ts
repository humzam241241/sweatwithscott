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

const fallbackHero = {
  title: "The Cave Boxing Gym",
  subtitle: "Train like a champion.",
  bg: "/images/frontpic.png",
};

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
      fetch("/api/settings").then((r) => r.json()).catch(() => ({})),
      fetch("/api/classes", { cache: "no-store" }).then((r) => r.json()).catch(() => []),
      fetch("/api/coaches", { cache: "no-store" }).then((r) => r.json()).catch(() => []),
      fetch("/api/schedule", { cache: "no-store" }).then((r) => r.json()).catch(() => []),
      fetch("/api/media", { cache: "no-store" }).then((r) => r.json()).catch(() => []),
      fetch("/api/packages", { cache: "no-store" }).then((r) => r.json()).catch(() => []),
    ]);

  const heroTitle = (settings as any).hero_title ?? fallbackHero.title;
  const heroSubtitle = (settings as any).hero_subtitle ?? fallbackHero.subtitle;
  const heroBg = (settings as any).hero_bg ?? fallbackHero.bg;

  const classes = Array.isArray(classesData) ? classesData : [];
  const coaches = Array.isArray(coachesData) ? coachesData : [];
  const media = Array.isArray(mediaData) ? mediaData : [];
  const packages = Array.isArray(packagesData) ? packagesData : [];

  const seen = new Set();
  const uniqueClasses = classes.filter((cls) => {
    const lowerName = cls.name?.toLowerCase();
    if (!lowerName || seen.has(lowerName)) return false;
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
          start_time: i.start_time,
          end_time: i.end_time,
          coach_name: i.coach_name || "TBA",
          status: i.status,
        }))
      : [];

  const upcoming = schedule
    .filter((item) => new Date(item.date) >= new Date())
    .sort(
      (a, b) =>
        new Date(`${a.date}T${a.start_time}`).getTime() -
        new Date(`${b.date}T${b.start_time}`).getTime()
    )
    .slice(0, 5);

  return (
    <>
      {/* Hero */}
      <section
        className="relative flex h-[80vh] items-center justify-center bg-cover bg-center text-white"
        style={{ backgroundImage: `url('${heroBg}')` }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center space-y-6">
          <h1 className="text-4xl font-bold md:text-6xl">{heroTitle}</h1>
          <p className="text-lg md:text-2xl">{heroSubtitle}</p>
          <Link href="/membership" className="bg-brand px-8 py-3 rounded hover:bg-brand-accent">
            Join Now
          </Link>
        </div>
      </section>

      <main className="space-y-32 py-24">
        {/* Classes */}
        <section id="classes" className="px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Classes</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {finalClasses.length ? (
              finalClasses.map((cls) => (
                <ClassCard key={cls.slug ?? cls.name} cls={cls} />
              ))
            ) : (
              <p className="text-center col-span-full text-sm text-brand-dark/70">
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

        {/* Coaches */}
        <section id="coaches" className="px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Coaches</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {finalCoaches.length ? (
              finalCoaches.map((coach) => (
                <CoachCard key={coach.slug ?? coach.name} coach={coach} />
              ))
            ) : (
              <p className="text-center col-span-full text-sm text-brand-dark/70">
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

        {/* Media */}
        {finalMedia.length ? <MediaGallery items={finalMedia} /> : null}

        {/* Membership */}
        <section id="membership" className="px-4">
          <MembershipPackages packages={finalPackages} />
        </section>

        {/* Contact */}
        <section id="contact" className="px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Contact</h2>
          <div className="text-center space-y-4 max-w-xl mx-auto">
            <p>{settings.contact_address ?? "123 Fight St, Hamilton, ON"}</p>
            <p>
              <a href={`tel:${settings.contact_phone ?? "(289) 892-5430"}`}>
                {settings.contact_phone ?? "(289) 892-5430"}
              </a>
            </p>
            <p>
              <a href={`mailto:${settings.contact_email ?? "info@caveboxing.com"}`}>
                {settings.contact_email ?? "info@caveboxing.com"}
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
