import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ClassesPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <header className="bg-gradient-to-r from-red-600 to-red-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Our Classes</h1>
          <p className="text-xl mb-8">
            Choose from our wide range of classes to improve your boxing skills, fitness, and strength.
          </p>
          {/* Conditional user links - in a real app, check authentication state */}
          <div className="flex justify-center space-x-4 mt-6">
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="bg-white text-red-600 hover:bg-gray-100">
                View My Bookings
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="bg-white text-red-600 hover:bg-gray-100">
                Mark Attendance
              </Button>
            </Link>
          </div>
          <div className="flex justify-center space-x-4 mt-6">
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="bg-white text-red-600 hover:bg-gray-100">
                View My Bookings
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="bg-white text-red-600 hover:bg-gray-100">
                Book Classes
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Classes Grid */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Available Classes</h2>
        <div className="card-grid">
          {[
            {
              name: "Boxing",
              img: "/images/boxing-training.png",
              description: "Master the fundamentals and improve your technique",
              link: "/boxing",
            },
            {
              name: "Strength & Conditioning",
              img: "/images/strength-conditioning.png",
              description: "Build power and endurance for boxing",
              link: "/strength",
            },
            {
              name: "Junior Jabbers",
              img: "/images/junior-jabbers.png",
              description: "Boxing classes for young athletes",
              link: "/juniors",
            },
            {
              name: "Beginner Boxing",
              img: "/images/gym-training.png",
              description: "Perfect for those new to boxing",
              link: "/beginner",
            },
          ].map((cls) => (
            <Link key={cls.name} href={cls.link} className="card">
              <img src={cls.img} alt={cls.name} />
              <div className="card-info">
                <h3>{cls.name}</h3>
              </div>
              <div className="card-overlay">
                <p className="mb-4">{cls.description}</p>
                <span className="underline">Learn More</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
