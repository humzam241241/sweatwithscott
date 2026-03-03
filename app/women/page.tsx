import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

export default function WomenPage() {
  return (
    <div className="min-h-screen">

      {/* Phone Banner */}
      <div className="bg-red-600 text-white text-center py-2 px-4">
        <span className="font-bold">Call Now! (289)892-5430</span>
      </div>

      {/* Hero Section */}
      <header className="cave-hero py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-black mb-6">Women's Boxing Programs</h1>
          <p className="text-xl">
            Empowering women through boxing - build confidence, strength, and self-defense skills in a supportive
            environment.
          </p>
        </div>
      </header>

      {/* Programs Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="cave-section-title text-center mb-12">Programs for Women</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="cave-card p-8 text-center">
              <div className="mb-6">
                <img
                  src="/images/boxing-training.png"
                  alt="Women's Boxing"
                  className="cave-card-img w-24 h-24 mx-auto object-cover"
                />
              </div>
              <CardContent className="p-0">
                <h3 className="text-xl font-black mb-2">Women's Boxing</h3>
                <p className="text-gray-600 mb-4">Learn boxing fundamentals in a women-only environment</p>
                <p className="cave-price text-lg">$25 / session</p>
              </CardContent>
            </Card>

            <Card className="cave-card p-8 text-center">
              <div className="mb-6">
                <img
                  src="/images/strength-conditioning.png"
                  alt="Women's Fitness"
                  className="cave-card-img w-24 h-24 mx-auto object-cover"
                />
              </div>
              <CardContent className="p-0">
                <h3 className="text-xl font-black mb-2">Fitness Boxing</h3>
                <p className="text-gray-600 mb-4">High-energy cardio workout with boxing techniques</p>
                <p className="cave-price text-lg">$20 / session</p>
              </CardContent>
            </Card>

            <Card className="cave-card p-8 text-center">
              <div className="mb-6">
                <img
                  src="/images/gym-training.png"
                  alt="Self Defense"
                  className="cave-card-img w-24 h-24 mx-auto object-cover"
                />
              </div>
              <CardContent className="p-0">
                <h3 className="text-xl font-black mb-2">Self-Defense</h3>
                <p className="text-gray-600 mb-4">Practical self-defense techniques and situational awareness</p>
                <p className="cave-price text-lg">$30 / session</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="cave-section-title mb-8">Why Women Choose The Cave</h2>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div>
              <h3 className="text-xl font-bold mb-4 text-red-600">Safe & Supportive Environment</h3>
              <p className="text-gray-700">
                Our women's programs provide a comfortable, non-intimidating space where you can learn and grow at your
                own pace.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-red-600">Build Confidence</h3>
              <p className="text-gray-700">
                Boxing training builds both physical and mental strength, boosting your confidence in all areas of life.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-red-600">Amazing Workout</h3>
              <p className="text-gray-700">
                Burn calories, build lean muscle, and improve cardiovascular health with our dynamic boxing workouts.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-red-600">Stress Relief</h3>
              <p className="text-gray-700">
                Release tension and stress while learning valuable self-defense skills in a fun, energetic environment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="cave-section-title mb-6">Join Our Women's Community</h2>
          <p className="text-lg text-gray-700 mb-8">Take the first step towards a stronger, more confident you.</p>
          <div className="space-x-4">
            <Link href="/register">
              <button className="cave-cta-btn">Start Your Journey</button>
            </Link>
            <Link href="tel:2898925430">
              <button className="cave-cta-btn bg-transparent border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white">
                Call (289)892-5430
              </button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
