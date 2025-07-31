import Link from "next/link"
import BookableSchedule from "@/components/bookable-schedule"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"

export default function SchedulePage() {
  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Phone Banner */}
      <div className="bg-red-600 text-white text-center py-2 px-4">
        <span className="font-bold">Call Now! (289)892-5430</span>
      </div>

      {/* Hero Section */}
      <header className="cave-hero py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-black mb-6">Class Schedule</h1>
          <p className="text-xl">Find the perfect class time that fits your schedule and start your boxing journey.</p>
        </div>
      </header>

      {/* Schedule Content */}
      <section className="max-w-6xl mx-auto py-16 px-4">
        <BookableSchedule />
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
