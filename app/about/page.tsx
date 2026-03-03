import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
    <div className="min-h-[120vh] bg-white">

      {/* Hero Section */}
      <header className="bg-gradient-to-r from-red-600 to-red-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">About Sweat with Scott</h1>
          <p className="text-xl">
            Discover our story, values, and what makes us the go-to gym for boxing and fitness enthusiasts.
          </p>
        </div>
      </header>

      {/* Content */}
      <section className="max-w-4xl mx-auto py-16 px-4">
        <div className="space-y-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Sweat with Scott was founded with a deep love for boxing and a commitment to creating a community where
              everyone feels empowered. From beginners taking their first steps into the ring to seasoned athletes
              looking to refine their craft, we welcome all skill levels.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              We believe boxing is more than just a sport — it's a way to build confidence, discipline, and mental
              resilience. Our mission is to provide professional coaching in a safe, supportive, and motivating
              environment.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Choose Us?</h2>
            <ul className="space-y-4 text-lg text-gray-700">
              <li className="flex items-start">
                <span className="font-semibold text-red-600 mr-2">World-Class Coaches:</span>
                <span>Learn from certified trainers and professional fighters.</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-red-600 mr-2">Tailored Programs:</span>
                <span>We offer classes for all ages and experience levels.</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-red-600 mr-2">Community Spirit:</span>
                <span>Be part of a tight-knit, supportive group of athletes.</span>
              </li>
            </ul>
          </div>

          <div className="text-center pt-8">
            <Link href="/register">
              <Button size="lg" className="bg-red-600 hover:bg-red-700">
                Join Our Community Today
              </Button>
            </Link>
          </div>
        </div>
      </section>

      </div>
    )
  }
