import Image from "next/image"
import Link from "next/link"
import Navigation from "@/components/navigation"
import ContactForm from "@/components/contact-form"
import ClassSchedule from "@/components/class-schedule"
import MembershipPackages from "@/components/membership-packages"
import Testimonials from "@/components/testimonials"
import FrontPoster from "@/components/front-poster"

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <FrontPoster />
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 text-red-500">THE CAVE</h1>
          <p className="text-2xl md:text-3xl mb-8 font-light">WHERE CHAMPIONS ARE FORGED</p>
          <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto">
            Step into The Cave and discover your inner fighter. Our world-class facility offers professional boxing
            training, strength conditioning, and youth programs in a supportive community environment.
          </p>
          <div className="space-x-4">
            <Link
              href="/classes"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-semibold rounded transition-colors inline-block"
            >
              VIEW ALL CLASSES
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white hover:bg-white hover:text-black text-white px-8 py-4 text-lg font-semibold rounded transition-colors inline-block"
            >
              GET STARTED
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Training Images */}
      <section className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative h-64">
              <Image
                src="/images/boxing-training.png"
                alt="Intense boxing training"
                fill
                className="object-cover rounded-lg shadow-lg"
              />
            </div>
            <div className="relative h-64">
              <Image
                src="/images/strength-conditioning.png"
                alt="Strength and conditioning"
                fill
                className="object-cover rounded-lg shadow-lg"
              />
            </div>
            <div className="relative h-64">
              <Image
                src="/images/gym-training.png"
                alt="Training at the gym"
                fill
                className="object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-red-500">WELCOME TO THE CAVE</h2>
              <p className="text-lg mb-6 leading-relaxed">
                The Cave Boxing is more than just a gym – it's a community where fighters of all levels come together to
                push their limits and achieve their goals. Our state-of-the-art facility features professional-grade
                equipment, experienced coaches, and a supportive atmosphere that welcomes everyone from beginners to
                seasoned athletes.
              </p>
              <p className="text-lg mb-8 leading-relaxed">
                Whether you're looking to get in the best shape of your life, learn self-defense, compete at the highest
                level, or simply find a new passion, The Cave provides the perfect environment to unleash your
                potential.
              </p>
              <Link
                href="/about"
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 font-semibold rounded transition-colors inline-block"
              >
                LEARN MORE
              </Link>
            </div>
            <div className="relative">
              <Image
                src="/images/gym-training.png"
                alt="Boxing training at The Cave"
                width={600}
                height={400}
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Classes Preview */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-red-500">OUR CLASSES</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              From beginner-friendly fundamentals to advanced competitive training, we offer classes for every skill
              level and goal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-900 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-transform">
              <Image
                src="/images/boxing-training.png"
                alt="Boxing Fundamentals"
                width={300}
                height={200}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-red-500">Boxing Fundamentals</h3>
                <p className="text-gray-300 mb-4">
                  Learn proper technique, footwork, and basic combinations in a supportive environment.
                </p>
                <Link href="/boxing" className="text-red-500 hover:text-red-400 font-semibold">
                  Learn More →
                </Link>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-transform">
              <Image
                src="/images/strength-conditioning.png"
                alt="Strength & Conditioning"
                width={300}
                height={200}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-red-500">Strength & Conditioning</h3>
                <p className="text-gray-300 mb-4">
                  Build functional strength and endurance specifically designed for combat sports.
                </p>
                <Link href="/strength" className="text-red-500 hover:text-red-400 font-semibold">
                  Learn More →
                </Link>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-transform">
              <Image
                src="/images/junior-jabbers.png"
                alt="Junior Jabbers"
                width={300}
                height={200}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-red-500">Junior Jabbers</h3>
                <p className="text-gray-300 mb-4">
                  Youth boxing program focusing on discipline, fitness, and fundamental skills.
                </p>
                <Link href="/juniors" className="text-red-500 hover:text-red-400 font-semibold">
                  Learn More →
                </Link>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-transform">
              <div className="h-48 bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                <span className="text-3xl font-bold">1-ON-1</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-red-500">Personal Training</h3>
                <p className="text-gray-300 mb-4">
                  Customized one-on-one training sessions tailored to your specific goals.
                </p>
                <Link href="/contact" className="text-red-500 hover:text-red-400 font-semibold">
                  Book Now →
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/classes"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-semibold rounded transition-colors inline-block"
            >
              VIEW ALL CLASSES
            </Link>
          </div>
        </div>
      </section>

      {/* Coaches Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-red-500">MEET OUR COACHES</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our experienced team of professional coaches brings decades of combined experience in boxing, fitness, and
              athlete development.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="relative mb-6">
                <Image
                  src="/images/coach-humza.png"
                  alt="Coach Humza"
                  width={250}
                  height={250}
                  className="rounded-full mx-auto shadow-2xl"
                />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-red-500">Coach Humza</h3>
              <p className="text-gray-300 mb-4">Head Coach & Founder</p>
              <p className="text-sm text-gray-400">
                Former professional boxer with 15+ years of coaching experience. Specializes in technique development
                and competitive training.
              </p>
              <Link href="/coach-humza" className="text-red-500 hover:text-red-400 font-semibold mt-4 inline-block">
                Learn More →
              </Link>
            </div>

            <div className="text-center">
              <div className="relative mb-6">
                <Image
                  src="/images/kyle-mclaughlin.png"
                  alt="Coach Kyle"
                  width={250}
                  height={250}
                  className="rounded-full mx-auto shadow-2xl"
                />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-red-500">Coach Kyle</h3>
              <p className="text-gray-300 mb-4">Advanced Boxing Coach</p>
              <p className="text-sm text-gray-400">
                Professional fighter and certified trainer. Expert in advanced techniques, sparring, and competition
                preparation.
              </p>
              <Link href="/coach-kyle" className="text-red-500 hover:text-red-400 font-semibold mt-4 inline-block">
                Learn More →
              </Link>
            </div>

            <div className="text-center">
              <div className="relative mb-6">
                <Image
                  src="/images/coach-scott.png"
                  alt="Coach Scott"
                  width={250}
                  height={250}
                  className="rounded-full mx-auto shadow-2xl"
                />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-red-500">Coach Scott</h3>
              <p className="text-gray-300 mb-4">Strength & Conditioning</p>
              <p className="text-sm text-gray-400">
                Certified strength coach specializing in functional fitness and athletic performance for combat sports.
              </p>
              <Link href="/coach-scott" className="text-red-500 hover:text-red-400 font-semibold mt-4 inline-block">
                Learn More →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-red-500">CLASS SCHEDULE</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Find the perfect class time that fits your schedule. We offer morning, afternoon, and evening sessions
              throughout the week.
            </p>
          </div>
          <ClassSchedule />
          <div className="text-center mt-12">
            <Link
              href="/schedule"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-semibold rounded transition-colors inline-block"
            >
              VIEW FULL SCHEDULE
            </Link>
          </div>
        </div>
      </section>

      {/* Membership Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-red-500">MEMBERSHIP PACKAGES</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Choose the membership that best fits your training goals and schedule. All memberships include access to
              our full facility and equipment.
            </p>
          </div>
          <MembershipPackages />
          <div className="text-center mt-12">
            <Link
              href="/membership"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-semibold rounded transition-colors inline-block"
            >
              JOIN TODAY
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-red-500">WHAT OUR MEMBERS SAY</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Don't just take our word for it. Here's what our community has to say about their experience at The Cave.
            </p>
          </div>
          <Testimonials />
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-red-500">GET STARTED TODAY</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Ready to begin your journey? Contact us to schedule your first class or ask any questions about our
              programs.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <ContactForm />
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-red-500">Visit Us</h3>
                <p className="text-gray-300 mb-2">123 Fighter Street</p>
                <p className="text-gray-300 mb-2">Boxing District, BD 12345</p>
                <p className="text-gray-300 mb-4">Phone: (555) 123-CAVE</p>
                <p className="text-gray-300">Email: info@thecaveboxing.com</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4 text-red-500">Hours</h3>
                <div className="space-y-2 text-gray-300">
                  <p>Monday - Friday: 6:00 AM - 10:00 PM</p>
                  <p>Saturday: 8:00 AM - 8:00 PM</p>
                  <p>Sunday: 10:00 AM - 6:00 PM</p>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4 text-red-500">First Class Free</h3>
                <p className="text-gray-300">
                  New to boxing? Try your first class absolutely free! No commitment required.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Image src="/images/cave-logo.png" alt="The Cave Boxing" width={40} height={40} className="mr-2" />
                <span className="font-bold text-xl text-red-500">THE CAVE</span>
              </div>
              <p className="text-gray-400">Where champions are forged through dedication, discipline, and community.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-red-500">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/classes" className="hover:text-white transition-colors">
                    Classes
                  </Link>
                </li>
                <li>
                  <Link href="/coaches" className="hover:text-white transition-colors">
                    Coaches
                  </Link>
                </li>
                <li>
                  <Link href="/membership" className="hover:text-white transition-colors">
                    Membership
                  </Link>
                </li>
                <li>
                  <Link href="/schedule" className="hover:text-white transition-colors">
                    Schedule
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-red-500">Programs</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/boxing" className="hover:text-white transition-colors">
                    Boxing
                  </Link>
                </li>
                <li>
                  <Link href="/strength" className="hover:text-white transition-colors">
                    Strength Training
                  </Link>
                </li>
                <li>
                  <Link href="/juniors" className="hover:text-white transition-colors">
                    Youth Programs
                  </Link>
                </li>
                <li>
                  <Link href="/beginner" className="hover:text-white transition-colors">
                    Beginner Classes
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-red-500">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>123 Fighter Street</li>
                <li>Boxing District, BD 12345</li>
                <li>(555) 123-CAVE</li>
                <li>info@thecaveboxing.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 The Cave Boxing. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
