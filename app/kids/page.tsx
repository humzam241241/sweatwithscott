import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

export default function KidsPage() {
  return (
    <div className="min-h-screen">

      {/* Phone Banner */}
      <div className="bg-red-600 text-white text-center py-2 px-4">
        <span className="font-bold">Call Now! (289)892-5430</span>
      </div>

      {/* Hero Section */}
      <header className="cave-hero py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-black mb-6">Junior Jabbers Program</h1>
          <p className="text-xl">
            Fun, safe boxing classes designed specifically for young athletes ages 6-16. Building confidence,
            discipline, and fitness!
          </p>
        </div>
      </header>

      {/* Programs Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="cave-section-title text-center mb-12">Youth Programs</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="cave-card p-8 text-center">
              <div className="mb-6">
                <img
                  src="/images/junior-jabbers.png"
                  alt="Junior Jabbers"
                  className="cave-card-img w-24 h-24 mx-auto object-cover"
                />
              </div>
              <CardContent className="p-0">
                <h3 className="text-xl font-black mb-2">Junior Jabbers (Ages 6-12)</h3>
                <p className="text-gray-600 mb-4">Introduction to boxing fundamentals in a fun, safe environment</p>
                <p className="cave-price text-lg">$85 / 4-week program</p>
              </CardContent>
            </Card>

            <Card className="cave-card p-8 text-center">
              <div className="mb-6">
                <img
                  src="/images/boxing-training.png"
                  alt="Teen Boxing"
                  className="cave-card-img w-24 h-24 mx-auto object-cover"
                />
              </div>
              <CardContent className="p-0">
                <h3 className="text-xl font-black mb-2">Teen Boxing (Ages 13-16)</h3>
                <p className="text-gray-600 mb-4">Advanced techniques and conditioning for teenage athletes</p>
                <p className="cave-price text-lg">$20 / session</p>
              </CardContent>
            </Card>

            <Card className="cave-card p-8 text-center">
              <div className="mb-6">
                <img
                  src="/images/gym-training.png"
                  alt="Youth Fitness"
                  className="cave-card-img w-24 h-24 mx-auto object-cover"
                />
              </div>
              <CardContent className="p-0">
                <h3 className="text-xl font-black mb-2">Youth Fitness</h3>
                <p className="text-gray-600 mb-4">General fitness and conditioning for young athletes</p>
                <p className="cave-price text-lg">$15 / session</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="cave-section-title mb-8">What Your Child Will Learn</h2>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div>
              <h3 className="text-xl font-bold mb-4 text-red-600">Boxing Fundamentals</h3>
              <ul className="text-gray-700 space-y-2">
                <li>• Proper stance and footwork</li>
                <li>• Basic punching techniques</li>
                <li>• Hand-eye coordination</li>
                <li>• Defensive movements</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-red-600">Life Skills</h3>
              <ul className="text-gray-700 space-y-2">
                <li>• Discipline and respect</li>
                <li>• Confidence building</li>
                <li>• Goal setting</li>
                <li>• Teamwork and sportsmanship</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-red-600">Physical Development</h3>
              <ul className="text-gray-700 space-y-2">
                <li>• Improved fitness and strength</li>
                <li>• Better coordination and balance</li>
                <li>• Increased flexibility</li>
                <li>• Healthy lifestyle habits</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-red-600">Safety First</h3>
              <ul className="text-gray-700 space-y-2">
                <li>• Non-contact training environment</li>
                <li>• Age-appropriate equipment</li>
                <li>• Qualified youth instructors</li>
                <li>• Focus on fun and learning</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section className="py-16 px-4 bg-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="cave-section-title mb-8">Class Schedule</h2>
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Junior Jabbers (Ages 6-12)</h3>
                <p className="text-gray-700 mb-2">
                  <strong>Saturdays:</strong> 10:00 AM - 11:00 AM
                </p>
                <p className="text-gray-700">
                  <strong>Duration:</strong> 4-week programs
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">Teen Boxing (Ages 13-16)</h3>
                <p className="text-gray-700 mb-2">
                  <strong>Tuesdays & Thursdays:</strong> 4:00 PM - 5:00 PM
                </p>
                <p className="text-gray-700">
                  <strong>Saturdays:</strong> 11:30 AM - 12:30 PM
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="cave-section-title mb-6">Enroll Your Child Today</h2>
          <p className="text-lg text-gray-700 mb-8">
            Give your child the gift of confidence, fitness, and valuable life skills through boxing.
          </p>
          <div className="space-x-4">
            <Link href="/register">
              <button className="cave-cta-btn">Register Now</button>
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
