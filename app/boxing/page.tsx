import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function BoxingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <img src="/images/cave-logo.png" alt="The Cave Boxing Logo" className="h-10 w-10 mr-2" />
                <span className="text-2xl font-bold text-red-600">The Cave Boxing Gym</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-700 hover:text-red-600">
                Home
              </Link>
              <Link href="/classes" className="text-gray-700 hover:text-red-600">
                Classes
              </Link>
              <Link href="/coaches" className="text-gray-700 hover:text-red-600">
                Coaches
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-red-600">
                Contact
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-red-600">
                About
              </Link>
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-gradient-to-r from-red-600 to-red-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Boxing Classes</h1>
          <div className="mb-8">
            <img
              src="/images/boxing-training.png"
              alt="Boxing Classes"
              className="mx-auto rounded-lg shadow-lg max-w-2xl w-full"
            />
          </div>
          <p className="text-xl">
            All levels welcome. Master the fundamentals, improve your fitness, and join our passionate boxing family.
          </p>
        </div>
      </header>

      {/* Content */}
      <section className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Class Schedule</h2>
        <p className="text-lg text-gray-700 mb-8">Classes run Monday–Saturday. Drop-in: $15 | Monthly: $90</p>

        {/* Call-to-Action Section */}
        <div className="bg-gray-50 rounded-lg p-8 mb-8">
          <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-lg text-gray-700 mb-6">Join our boxing community today!</p>
          <Link href="/register">
            <Button size="lg" className="bg-red-600 hover:bg-red-700">
              Register Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2025 The Cave Boxing Gym. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
