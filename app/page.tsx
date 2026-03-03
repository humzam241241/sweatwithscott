import fs from "fs";
import path from "path";
import Link from "next/link";
import WeeklySchedule from "@/components/weekly-schedule";
import MembershipPackages from "@/components/membership-packages";
import ContactForm from "@/components/contact-form";
import MediaGallery from "@/components/media-gallery";

export default function Home() {
  const publicDir = path.join(process.cwd(), "public");
  let heroType: "video" | "image" | null = null;
  let heroSrc = "";

  if (fs.existsSync(path.join(publicDir, "videos", "hero.mp4"))) {
    heroType = "video";
    heroSrc = "/videos/hero.mp4";
  } else {
    try {
      const files = fs.readdirSync(path.join(publicDir, "images"));
      const img = files.find((f) => /\.(jpg|png)$/i.test(f));
      if (img) {
        heroType = "image";
        heroSrc = `/images/${img}`;
      }
    } catch {}
  }

  return (
    <main className="bg-white text-black">
      <section className="relative h-screen w-full flex items-center justify-center">
        {heroType === "video" ? (
          <video
            src={heroSrc}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : heroType === "image" ? (
          <img
            src={heroSrc}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/40" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white opacity-0 animate-in fade-in slide-in-from-bottom-4">
            Welcome to Sweat with Scott
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white opacity-0 animate-in fade-in slide-in-from-bottom-4 delay-150">
            Train Hard. Fight Smart. Become Unstoppable.
          </p>
          <Link
            href="#classes"
            className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded opacity-0 animate-in fade-in slide-in-from-bottom-4 delay-300"
          >
            Explore Classes
          </Link>
        </div>
      </section>

      <section
        id="media"
        className="min-h-screen p-8 flex flex-col justify-center bg-gray-100"
      >
        <h2 className="text-4xl font-bold mb-8 text-red-600">Media</h2>
        <MediaGallery />
      </section>

      <section id="classes" className="min-h-screen p-8 flex flex-col justify-center">
        <h2 className="text-4xl font-bold mb-4 text-red-600">Classes</h2>
        <p className="mb-6 text-lg max-w-xl">
          From Bootcamp to Beginner Boxing, our classes are designed for all skill levels to build technique and fitness.
        </p>
        <Link href="/classes" className="text-red-600 underline font-semibold">
          View All Classes
        </Link>
      </section>

      <section id="coaches" className="min-h-screen p-8 flex flex-col justify-center bg-gray-100">
        <h2 className="text-4xl font-bold mb-4 text-red-600">Coaches</h2>
        <p className="mb-6 text-lg max-w-xl">
          Meet the experienced team that will push you to your limits and guide your boxing journey.
        </p>
        <Link href="/coaches" className="text-red-600 underline font-semibold">
          Meet Our Coaches
        </Link>
      </section>

      <section id="schedule" className="min-h-screen p-8 flex flex-col justify-center">
        <h2 className="text-4xl font-bold mb-8 text-red-600">Schedule</h2>
        <WeeklySchedule />
      </section>

      <section id="membership" className="min-h-screen p-8 flex flex-col justify-center bg-gray-100">
        <h2 className="text-4xl font-bold mb-8 text-red-600">Membership</h2>
        <MembershipPackages />
      </section>

      <section id="about" className="min-h-screen p-8 flex flex-col justify-center">
        <h2 className="text-4xl font-bold mb-4 text-red-600">About</h2>
        <p className="mb-6 text-lg max-w-2xl">
          Sweat with Scott is a focused boxing community where people build skills, confidence, and consistency.
        </p>
        <Link href="/about" className="text-red-600 underline font-semibold">
          Learn More
        </Link>
      </section>

      <section id="contact" className="min-h-screen p-8 flex flex-col justify-center bg-gray-100">
        <h2 className="text-4xl font-bold mb-8 text-red-600">Contact</h2>
        <ContactForm />
      </section>
    </main>
  );
}

