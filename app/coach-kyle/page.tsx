import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CoachKylePage() {
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
              <Link href="/coaches" className="text-red-600 font-semibold">
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
          <h1 className="text-5xl font-bold mb-6">Kyle McLaughlin</h1>
          <div className="mb-8">
            <img
              src="/images/kyle-mclaughlin.png"
              alt="Coach Kyle"
              className="mx-auto rounded-lg shadow-lg w-80 h-80 object-cover"
            />
          </div>
          <p className="text-xl">
            Owner and Head Coach. Certified Level 1 Boxing Coach and Professional Trainer with over 17 years of
            experience.
          </p>
        </div>
      </header>

      {/* Content */}
      <section className="max-w-4xl mx-auto py-16 px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Achievements</h2>
          <div className="bg-gray-50 rounded-lg p-8">
            <ul className="space-y-4 text-lg text-gray-700">
              <li className="flex items-start">
                <span className="font-semibold text-red-600 mr-2">Professional Boxer:</span>
                <span>Undefeated 6-0 record.</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-red-600 mr-2">50+ Amateur Matches:</span>
                <span>Experienced at national level.</span>
              </li>
              <li className="flex items-center justify-center">
                <span className="w-2 h-2 bg-red-600 rounded-full mr-3"></span>
                2015 Golden Gloves Medalist
              </li>
              <li className="flex items-center justify-center">
                <span className="w-2 h-2 bg-red-600 rounded-full mr-3"></span>
                2014 WBC Canada Amateur Champion
              </li>
              <li className="flex items-center justify-center">
                <span className="w-2 h-2 bg-red-600 rounded-full mr-3"></span>
                2010 Brampton Cup Gold Medal
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-8 shadow-sm">
          <h3 className="text-2xl font-bold mb-4">About Coach Kyle</h3>
          <p className="text-gray-700 leading-relaxed mb-6">
            Kyle McLaughlin brings a wealth of competitive boxing experience to The Cave Boxing Gym. As our Head Boxing
            Coach, he has dedicated his career to developing fighters at all levels, from complete beginners to
            competitive athletes.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            His coaching philosophy emphasizes proper technique, mental toughness, and respect for the sport. Kyle
            believes that boxing is not just about physical training, but also about building character and discipline
            that extends beyond the gym.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Whether you're looking to learn the basics, improve your fitness, or compete at a high level, Coach Kyle
            will help you achieve your goals with personalized training and expert guidance.
          </p>
        </div>

        <div className="text-center mt-12">
          <Link href="/register">
            <Button size="lg" className="bg-red-600 hover:bg-red-700">
              Train with Coach Kyle
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
