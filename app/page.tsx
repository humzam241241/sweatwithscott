export const dynamic = 'force-dynamic';

import CoachCard from "@/components/CoachCard";
import MediaGallery from "@/components/MediaGallery";
import MembershipPackages from "@/components/membership-packages";
import ContactForm from "@/components/contact-form";
import Footer from "@/components/footer";
import Link from "next/link";
import { headers } from "next/headers";

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
    image: item.image && item.image !== "/images/logo.png" ? item.image : PLACEHOLDER_IMAGE,
  };
}

async function getData(endpoint: string) {
  try {
    const h = headers();
    const proto = h.get("x-forwarded-proto") ?? "http";
    const host = h.get("host");
    const base = host ? `${proto}://${host}` : "";
    const res = await fetch(`${base}${endpoint}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
    return res.json();
  } catch (err) {
    console.error(`Error loading ${endpoint}:`, err);
    return [];
  }
}

async function getSchedule() {
  try {
    const h = headers();
    const proto = h.get("x-forwarded-proto") ?? "http";
    const host = h.get("host");
    const base = host ? `${proto}://${host}` : "";
    const res = await fetch(`${base}/api/classes`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch schedule`);
    return res.json();
  } catch (err) {
    console.error(`Error loading schedule:`, err);
    return [];
  }
}

export default async function Home() {
  const [classes, coaches, packagesData, mediaData, settings, scheduleData] = await Promise.all([
    getData("/api/classes"),
    getData("/api/coaches"),
    getData("/api/packages"),
    getData("/api/media"),
    getData("/api/settings"),
    getSchedule(),
  ]);

  const hero = {
    title: (settings as any)?.hero_title ?? fallbackHero.title,
    subtitle: (settings as any)?.hero_subtitle ?? fallbackHero.subtitle,
    bg: (settings as any)?.hero_bg ?? fallbackHero.bg,
  };

  return (
    <main className="min-h-screen bg-white text-black">
      {/* HERO SECTION */}
      <section className="relative text-center text-white">
        <div className="absolute inset-0">
          <img
            src={hero.bg}
            alt="Hero"
            className="w-full h-[85vh] md:h-[92vh] object-cover object-top"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center h-[85vh] md:h-[92vh]">
          <h1 className="text-5xl md:text-6xl font-bold">{hero.title}</h1>
          <p className="text-lg md:text-2xl mt-4">{hero.subtitle}</p>
        </div>
      </section>

      {/* CLASSES */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Our Classes</h2>
        {Array.isArray(classes) && classes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {classes.map((cls: any) => (
              <Link key={cls.id ?? cls.slug} href={`/classes/${cls.slug}`}>
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
                  <img src={cls.image || PLACEHOLDER_IMAGE} alt={cls.name} className="h-56 w-full object-cover" />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold">{cls.name}</h3>
                    <p className="mt-2 text-gray-600 line-clamp-3">{cls.description || "No description available."}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No classes available.</p>
        )}
      </section>

      {/* COACHES */}
      <section className="py-16 px-6 bg-gray-50">
        <h2 className="text-3xl font-bold mb-8 text-center">Meet Our Coaches</h2>
        {Array.isArray(coaches) && coaches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {coaches.map((coach: any) => (
              <CoachCard key={coach.id ?? coach.slug} coach={withImage(coach)} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No coaches available.</p>
        )}
      </section>

      {/* MEDIA GALLERY */}
      <MediaGallery items={(Array.isArray(mediaData) ? mediaData : []).map((m: any) => ({
        id: m.id,
        fileUrl: m.url ?? m.fileUrl,
        title: m.title ?? "",
        category: m.type ?? "all",
      }))} />

      {/* SCHEDULE */}
      <section id="schedule" className="py-16 px-6 bg-gray-50">
        <h2 className="text-3xl font-bold mb-8 text-center">Class Schedule</h2>
        {Array.isArray(scheduleData) && scheduleData.length > 0 ? (
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scheduleData.map((cls: any) => (
                <div key={cls.id ?? cls.slug} className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold mb-2">{cls.name}</h3>
                  {cls.description && (
                    <p className="text-gray-600 mb-3 text-sm">{cls.description}</p>
                  )}
                  <div className="space-y-1 text-sm">
                    {cls.day_of_week && <p><strong>Day:</strong> {cls.day_of_week}</p>}
                    {cls.start_time && cls.end_time && (
                      <p><strong>Time:</strong> {cls.start_time} - {cls.end_time}</p>
                    )}
                    {cls.instructor && <p><strong>Coach:</strong> {cls.instructor}</p>}
                    {cls.max_capacity && <p><strong>Capacity:</strong> {cls.max_capacity} spots</p>}
                    {cls.price && <p><strong>Price:</strong> ${cls.price}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">No classes scheduled.</p>
        )}
      </section>

      {/* MEMBERSHIP PACKAGES */}
      <MembershipPackages
        packages={(Array.isArray(packagesData) ? packagesData : []).map((p: any) => ({
          name: p.name,
          price: `$${p.price ?? 0}`,
          period: "",
          description: p.description ?? "",
          features: p.features ? (() => { try { return JSON.parse(p.features); } catch { return []; } })() : [],
          popular: false,
          buttonText: "Join Now",
          buttonLink: "/membership",
        }))}
      />

      {/* CONTACT FORM */}
      <ContactForm />

      {/* FOOTER */}
      <Footer />
    </main>
  );
}
