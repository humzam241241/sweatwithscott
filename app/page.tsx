import Link from "next/link";
import WeeklySchedule from "@/components/weekly-schedule";
import MembershipPackages from "@/components/membership-packages";
import ContactForm from "@/components/contact-form";

export default function Home() {
  return (
    <main className="bg-white text-black">
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
          The Cave Boxing is a community where fighters of all levels come together to push their limits and achieve their goals.
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

