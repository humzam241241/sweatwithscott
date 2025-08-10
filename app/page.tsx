export const dynamic = 'force-dynamic';

import CoachCard from "@/components/CoachCard";
import MediaGallery from "@/components/MediaGallery";
import MembershipPackages from "@/components/membership-packages";
import ContactForm from "@/components/contact-form";
import Footer from "@/components/footer";
import Link from "next/link";

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
    const res = await fetch(`${endpoint}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
    return res.json();
  } catch (err) {
    console.error(`Error loading ${endpoint}:`, err);
    return [];
  }
}

export default async function Home() {
  const [classes, coaches] = await Promise.all([
    getData("/api/classes"),
    getData("/api/coaches"),
  ]);

  const hero = fallbackHero;

  return (
    <main className="min-h-screen bg-white text-black">
      {/* HERO SECTION */}
      <section
        className="relative flex flex-col items-center justify-center h-[70vh] bg-cover bg-center text-center text-white"
        style={{ backgroundImage: `url(${hero.bg})` }}
      >
        <div className="bg-black/50 absolute inset-0" />
        <h1 className="text-5xl md:text-6xl font-bold z-10">{hero.title}</h1>
        <p className="text-lg md:text-2xl mt-4 z-10">{hero.subtitle}</p>
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
      <MediaGallery />

      {/* MEMBERSHIP PACKAGES */}
      <MembershipPackages />

      {/* CONTACT FORM */}
      <ContactForm />

      {/* FOOTER */}
      <Footer />
    </main>
  );
}
