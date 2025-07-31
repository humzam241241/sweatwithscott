import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CoachScottPage() {
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
          <h1 className="text-5xl font-black mb-6">Scott McDonald</h1>
          <div className="mb-8">
            <img
              src="/images/coach-scott.png"
              alt="Coach Scott"
              className="cave-hero-img mx-auto w-80 h-80 object-cover rounded-full border-4 border-red-600"
            />
          </div>
          <p className="text-xl">
            Boxing Coach with a passion for helping athletes refine their technique and build mental toughness.
          </p>
        </div>
      </header>

      {/* Content */}
      <section className="max-w-4xl mx-auto py-16 px-4">
        <div className="text-center mb-12">
          <h2 className="cave-section-title mb-6">Coaching Focus</h2>
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <ul className="space-y-4 text-lg text-gray-700">
              <li className="flex items-center justify-center">
                <span className="w-2 h-2 bg-red-600 rounded-full mr-3"></span>
                Boxing Fundamentals
              </li>
              <li className="flex items-center justify-center">
                <span className="w-2 h-2 bg-red-600 rounded-full mr-3"></span>
                Advanced Technique
              </li>
              <li className="flex items-center justify-center">
                <span className="w-2 h-2 bg-red-600 rounded-full mr-3"></span>
                Footwork & Agility
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold mb-4">About Coach Scott</h3>
          <p className="text-gray-700 leading-relaxed mb-6">
            Scott McDonald is passionate about making boxing accessible to everyone, regardless of their fitness level
            or experience. As our Boxing & Fitness Coach, he specializes in creating welcoming, non-intimidating
            environments where beginners can learn and grow.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            With a focus on fitness boxing and beginner development, Scott helps people discover the physical and mental
            benefits of boxing training. His classes emphasize proper technique, safety, and most importantly, having
            fun while getting in great shape.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Whether you're looking to lose weight, relieve stress, or simply try something new, Coach Scott will guide
            you through every step of your boxing journey with patience and expertise.
          </p>
        </div>

        <div className="text-center mt-12">
          <Link href="/register">
            <button className="cave-cta-btn">Train with Coach Scott</button>
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
