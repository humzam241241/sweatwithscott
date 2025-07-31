import Image from "next/image"
import Link from "next/link"
import Navigation from "@/components/navigation"
import ContactForm from "@/components/contact-form"
import ClassSchedule from "@/components/class-schedule"
import MembershipPackages from "@/components/membership-packages"
import Testimonials from "@/components/testimonials"

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <Image
            src="/images/frontpic.png"
            alt="Intense boxing match"
            fill
            className="object-cover"
            priority
          />
        </div>

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
    </div>
  )
}
