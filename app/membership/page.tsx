import Link from "next/link"
import MembershipPackages from "@/components/membership-packages"

export default function MembershipPage() {
  return (
    <div className="min-h-screen">

      {/* Phone Banner */}
      <div className="bg-red-600 text-white text-center py-2 px-4">
        <span className="font-bold">Call Now! (289)892-5430</span>
      </div>

      {/* Hero Section */}
      <header className="cave-hero py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-black mb-6">Sweat with Scott Programs</h1>
          <p className="text-xl">
            Pick your starting point: the 8-week transformation, daily subscription coaching, or gym access.
          </p>
          <div className="mt-8">
            <Link href="/online-coaching" className="inline-flex rounded bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark">
              See Online Coaching Offer
            </Link>
          </div>
        </div>
      </header>

      {/* Membership Content */}
      <section className="max-w-7xl mx-auto py-16 px-4">
        <MembershipPackages />
      </section>

    </div>
  )
}
