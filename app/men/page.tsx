import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

export default function MenPage() {
  return (
    <div className="min-h-screen">

      {/* Phone Banner */}
      <div className="bg-red-600 text-white text-center py-2 px-4">
        <span className="font-bold">Call Now! (289)892-5430</span>
      </div>

      {/* Hero Section */}
      <header className="cave-hero py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-black mb-6">Men's Boxing Programs</h1>
          <p className="text-xl">
            Intensive training programs designed for men who want to build strength, technique, and mental toughness.
          </p>
        </div>
      </header>

      {/* Programs Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="cave-section-title text-center mb-12">Programs for Men</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="cave-card p-8 text-center">
              <div className="mb-6">
                <img
                  src="/images/boxing-training.png"
                  alt="Men's Boxing"
                  className="cave-card-img w-24 h-24 mx-auto object-cover"
                />
              </div>
              <CardContent className="p-0">
                <h3 className="text-xl font-black mb-2">Boxing Technique</h3>
                <p className="text-gray-600 mb-4">Master proper form, footwork, and combinations</p>
                <p className="cave-price text-lg">$25 / session</p>
              </CardContent>
            </Card>

            <Card className="cave-card p-8 text-center">
              <div className="mb-6">
                <img
                  src="/images/strength-conditioning.png"
                  alt="Men's Strength Training"
                  className="cave-card-img w-24 h-24 mx-auto object-cover"
                />
              </div>
              <CardContent className="p-0">
                <h3 className="text-xl font-black mb-2">Boxing Bootcamp</h3>
                <p className="text-gray-600 mb-4">High-intensity conditioning and boxing drills</p>
                <p className="cave-price text-lg">$30 / session</p>
              </CardContent>
            </Card>

            <Card className="cave-card p-8 text-center">
              <div className="mb-6">
                <img
                  src="/images/gym-training.png"
                  alt="Personal Training"
                  className="cave-card-img w-24 h-24 mx-auto object-cover"
                />
              </div>
              <CardContent className="p-0">
                <h3 className="text-xl font-black mb-2">Personal Training</h3>
                <p className="text-gray-600 mb-4">One-on-one coaching tailored to your goals</p>
                <p className="cave-price text-lg">$75 / session</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="cave-section-title mb-6">Ready to Train?</h2>
          <p className="text-lg text-gray-700 mb-8">
            Join our community of dedicated athletes and take your fitness to the next level.
          </p>
          <div className="space-x-4">
            <Link href="/register">
              <button className="cave-cta-btn">Start Training Today</button>
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
