import Link from "next/link"
import { Button } from "@/components/ui/button"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"

export default function CoachHumzaPage() {
  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <header className="cave-hero py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-black mb-6">Humza Muhammad</h1>
          <div className="mb-8">
            <img
              src="/images/coach-humza.png"
              alt="Coach Humza"
              className="cave-hero-img mx-auto w-80 h-80 object-cover rounded-full border-4 border-red-600"
            />
          </div>
          <p className="text-xl">
            Strength & Conditioning Coach with a background in mechanical engineering, sports science, and advanced
            fitness programming.
          </p>
        </div>
      </header>

      {/* Content */}
      <section className="max-w-4xl mx-auto py-16 px-4">
        <div className="text-center mb-12">
          <h2 className="cave-section-title mb-6">Specialties</h2>
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <ul className="space-y-4 text-lg text-gray-700">
              <li className="flex items-center justify-center">
                <span className="w-2 h-2 bg-red-600 rounded-full mr-3"></span>
                Strength & Endurance Training
              </li>
              <li className="flex items-center justify-center">
                <span className="w-2 h-2 bg-red-600 rounded-full mr-3"></span>
                Technique Development
              </li>
              <li className="flex items-center justify-center">
                <span className="w-2 h-2 bg-red-600 rounded-full mr-3"></span>
                Custom Fitness Plans
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold mb-4">About Coach Humza</h3>
          <p className="text-gray-700 leading-relaxed mb-6">
            With a unique combination of mechanical engineering expertise and sports science knowledge, Humza brings a
            scientific approach to strength and conditioning. His programs are designed to maximize performance while
            minimizing injury risk, making him an invaluable asset to fighters at all levels.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Humza specializes in creating personalized training programs that address each athlete's specific needs,
            whether they're looking to build explosive power, improve endurance, or develop better movement patterns for
            boxing.
          </p>
        </div>

        <div className="text-center mt-12">
          <Link href="/register">
            <button className="cave-cta-btn">Train with Coach Humza</button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
