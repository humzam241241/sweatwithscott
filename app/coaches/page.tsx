import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function CoachesPage() {
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
            <div className="flex items-center space-x-4">
              <Link href="/" className="cave-nav-link">
                Home
              </Link>
              <Link href="/classes" className="cave-nav-link">
                Classes
              </Link>
              <Link href="/coaches" className="cave-nav-link bg-red-600">
                Coaches
              </Link>
              <Link href="/contact" className="cave-nav-link">
                Contact
              </Link>
              <Link href="/about" className="cave-nav-link">
                About
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-gray-900 bg-transparent"
                >
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

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
      <footer className="text-center py-8">
        <p className="text-gray-500">&copy; 2025 The Cave Boxing Gym. All rights reserved.</p>
      </footer>
    </div>
  )
}
