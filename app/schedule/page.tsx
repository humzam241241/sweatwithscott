import Link from "next/link"
import ClassSchedule from "@/components/class-schedule"

export default function SchedulePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="cave-navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <img src="/images/cave-logo.png" alt="The Cave Boxing Logo" className="cave-logo mr-9" />
                <span className="text-2xl font-bold text-white">The Cave Boxing Gym</span>
              </Link>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/" className="cave-nav-link">
                HOME
              </Link>
              <Link href="/classes" className="cave-nav-link">
                CLASSES
              </Link>
              <Link href="/men" className="cave-nav-link">
                MEN
              </Link>
              <Link href="/women" className="cave-nav-link">
                WOMEN
              </Link>
              <Link href="/kids" className="cave-nav-link">
                KIDS
              </Link>
            </div>
          </div>
        </div>
      </nav>

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
        <ClassSchedule />
      </section>

      {/* Footer */}
      <footer className="text-center py-8">
        <p className="text-gray-500">&copy; 2025 The Cave Boxing Gym. All rights reserved.</p>
      </footer>
    </div>
  )
}
