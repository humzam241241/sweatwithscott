import Link from "next/link";
import WeeklySchedule from "@/components/weekly-schedule";
import MembershipPackages from "@/components/membership-packages";
import ContactForm from "@/components/contact-form";

export default function Home() {
  return (
    <main className="bg-white text-black">
      {/* Hero Section */}
      <section className="relative h-screen w-full -mt-16" id="hero">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/images/hero-poster.jpg"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 animate-in fade-in">
            Welcome to The Cave Boxing
          </h1>
          <p className="text-xl md:text-2xl mb-8 animate-in fade-in slide-in-from-bottom-4">
            Train Hard. Fight Smart. Become Unstoppable.
          </p>
          <button
            onClick={() =>
              document.getElementById("classes")?.scrollIntoView({ behavior: "smooth" })
            }
            className="bg-white text-black px-8 py-3 rounded-full font-medium transition-transform hover:scale-105"
          >
            Explore Classes
          </button>
        </div>
      </section>

      <section
        id="classes"
        className="min-h-screen p-8 flex flex-col justify-center scroll-mt-16 animate-in fade-in slide-in-from-bottom-8"
      >
        <h2 className="text-4xl font-bold mb-4 text-red-600">Classes</h2>
        <p className="mb-6 text-lg max-w-xl">
          From Bootcamp to Beginner Boxing, our classes are designed for all skill levels to build technique and fitness.
        </p>
        <Link href="/classes" className="text-red-600 underline font-semibold">
          View All Classes
        </Link>
      </section>

      <section
        id="coaches"
        className="min-h-screen p-8 flex flex-col justify-center bg-gray-100 scroll-mt-16 animate-in fade-in slide-in-from-bottom-8"
      >
        <h2 className="text-4xl font-bold mb-4 text-red-600">Coaches</h2>
        <p className="mb-6 text-lg max-w-xl">
          Meet the experienced team that will push you to your limits and guide your boxing journey.
        </p>
        <Link href="/coaches" className="text-red-600 underline font-semibold">
          Meet Our Coaches
        </Link>
      </section>

      <section
        id="schedule"
        className="min-h-screen p-8 flex flex-col justify-center scroll-mt-16 animate-in fade-in slide-in-from-bottom-8"
      >
        <h2 className="text-4xl font-bold mb-8 text-red-600">Schedule</h2>
        <WeeklySchedule />
      </section>

      <section
        id="membership"
        className="min-h-screen p-8 flex flex-col justify-center bg-gray-100 scroll-mt-16 animate-in fade-in slide-in-from-bottom-8"
      >
        <h2 className="text-4xl font-bold mb-8 text-red-600">Membership</h2>
        <MembershipPackages />
      </section>

      <section
        id="about"
        className="min-h-screen p-8 flex flex-col justify-center scroll-mt-16 animate-in fade-in slide-in-from-bottom-8"
      >
        <h2 className="text-4xl font-bold mb-4 text-red-600">About</h2>
        <p className="mb-6 text-lg max-w-2xl">
          The Cave Boxing is a community where fighters of all levels come together to push their limits and achieve their goals.
        </p>
        <Link href="/about" className="text-red-600 underline font-semibold">
          Learn More
        </Link>
      </section>

      <section
        id="contact"
        className="min-h-screen p-8 flex flex-col justify-center bg-gray-100 scroll-mt-16 animate-in fade-in slide-in-from-bottom-8"
      >
        <h2 className="text-4xl font-bold mb-8 text-red-600">Contact</h2>
        <ContactForm />
      </section>
    </main>
  );
}

