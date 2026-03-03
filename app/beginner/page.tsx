import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function BeginnerPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <header className="bg-gradient-to-r from-red-600 to-red-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Beginner Boxing</h1>
          <div className="mb-8">
            <img
              src="/images/gym-training.png"
              alt="Beginner Boxing"
              className="mx-auto rounded-lg shadow-lg max-w-2xl w-full"
            />
          </div>
          <p className="text-xl">
            No experience? No problem. Our beginner classes teach the basics in a friendly, supportive environment.
          </p>
        </div>
      </header>

      {/* Content */}
      <section className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Start Anytime</h2>
        <p className="text-lg text-gray-700 mb-8">Intro sessions weekly. Drop-in: $15</p>

        <div className="bg-gray-50 rounded-lg p-8 mb-8">
          <h3 className="text-2xl font-bold mb-4">Perfect for Beginners</h3>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div>
              <h4 className="font-semibold mb-2">What We Cover:</h4>
              <ul className="space-y-2">
                <li>• Basic boxing fundamentals</li>
                <li>• Proper form and technique</li>
                <li>• Safety and injury prevention</li>
                <li>• Building confidence</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">What to Expect:</h4>
              <ul className="space-y-2">
                <li>• Welcoming, non-intimidating environment</li>
                <li>• Patient, experienced instructors</li>
                <li>• Progressive skill development</li>
                <li>• Great workout and stress relief</li>
              </ul>
            </div>
          </div>
        </div>

        <Link href="/register">
          <Button size="lg" className="bg-red-600 hover:bg-red-700">
            Start Your Boxing Journey
          </Button>
        </Link>
      </section>

    </div>
  )
}
