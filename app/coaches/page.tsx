import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"

export default function CoachesPage() {
  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <header className="cave-hero py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-black mb-6">Meet Our Coaches</h1>
          <p className="text-xl">
            Learn from experienced trainers who bring passion, skill, and dedication to every class.
          </p>
        </div>
      </header>

      {/* Coaches Grid */}
      <section className="max-w-6xl mx-auto py-16 px-4">
        <div className="flex justify-center gap-8 flex-wrap">
          <Link href="/coach-kyle">
            <Card className="cave-card w-60 p-8 text-center">
              <div className="mb-4">
                <img
                  src="/images/kyle-mclaughlin.png"
                  alt="Kyle McLaughlin"
                  className="cave-coach-img w-24 h-24 mx-auto rounded-full object-cover"
                />
              </div>
              <CardContent className="p-0">
                <h4 className="text-lg font-black mb-1">Kyle McLaughlin</h4>
                <p className="text-gray-600 mb-3">Head Boxing Coach</p>
                <span className="cave-price text-base border-b border-dotted border-red-600">View Profile</span>
              </CardContent>
            </Card>
          </Link>

          <Link href="/coach-humza">
            <Card className="cave-card w-60 p-8 text-center">
              <div className="mb-4">
                <img
                  src="/images/coach-humza.png"
                  alt="Humza Muhammad"
                  className="cave-coach-img w-24 h-24 mx-auto rounded-full object-cover"
                />
              </div>
              <CardContent className="p-0">
                <h4 className="text-lg font-black mb-1">Humza Muhammad</h4>
                <p className="text-gray-600 mb-3">Strength & Conditioning Coach</p>
                <span className="cave-price text-base border-b border-dotted border-red-600">View Profile</span>
              </CardContent>
            </Card>
          </Link>

          <Link href="/coach-scott">
            <Card className="cave-card w-60 p-8 text-center">
              <div className="mb-4">
                <img
                  src="/images/coach-scott.png"
                  alt="Scott McDonald"
                  className="cave-coach-img w-24 h-24 mx-auto rounded-full object-cover"
                />
              </div>
              <CardContent className="p-0">
                <h4 className="text-lg font-black mb-1">Scott McDonald</h4>
                <p className="text-gray-600 mb-3">Boxing & Fitness Coach</p>
                <span className="cave-price text-base border-b border-dotted border-red-600">View Profile</span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
