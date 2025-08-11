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
      <section className="relative text-center text-white py-0">
        <div className="absolute inset-0">
          <img
            src={hero.bg}
            alt="Hero"
            className="w-full h-screen object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center h-screen">
          <h1 className="text-5xl md:text-6xl font-bold">{hero.title}</h1>
          <p className="text-lg md:text-2xl mt-4">{hero.subtitle}</p>
        </div>
      </section>

      {/* CLASSES */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Our Classes</h2>
         {Array.isArray(classes) && classes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from(new Map(classes.map((c:any)=>[c.slug ?? c.id, c])).values()).map((cls: any) => (
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

       {/* SCHEDULE (Google Calendar-like) */}
       <section id="schedule" className="py-16 px-6 bg-gray-50">
         <h2 className="text-3xl font-bold mb-8 text-center">Class Schedule</h2>
         <div className="max-w-7xl mx-auto">
           {/* Weekly grid */}
           <div className="grid grid-cols-7 gap-4 min-w-[900px] overflow-x-auto">
             {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map((day) => (
               <div key={day} className="bg-white rounded-lg shadow-sm p-3">
                 <h3 className="text-center font-semibold mb-3">{day}</h3>
                 <div className="flex flex-col gap-2">
                   {Array.isArray(scheduleData) && scheduleData
                     .filter((c: any) => c.day_of_week === day)
                     .sort((a: any,b: any) => String(a.start_time).localeCompare(String(b.start_time)))
                     .map((c: any) => (
                       <div key={`${c.id}-${c.start_time}`} className="event rounded-lg p-3" style={{backgroundColor:'#c90015'}}>
                         <div className="text-sm font-semibold">{c.start_time} - {c.end_time}</div>
                         <div className="text-sm">{c.name}</div>
                         {c.instructor && <div className="text-xs opacity-80">Coach: {c.instructor}</div>}
                       </div>
                   ))}
                 </div>
               </div>
             ))}
           </div>
         </div>
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
      <div className="max-w-4xl mx-auto">
        <ContactForm />
      </div>

      {/* FOOTER */}
      <Footer />
    </main>
  );
}
