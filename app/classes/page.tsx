import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

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
      <section className="max-w-7xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Available Classes</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Link href="/boxing">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                <img src="/images/boxing-training.png" alt="Boxing Classes" className="w-full h-full object-cover" />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Boxing</h3>
                <p className="text-gray-600 mb-4">Master the fundamentals and improve your technique</p>
                <p className="text-2xl font-bold text-red-600">$15 / drop-in</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/strength">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                <img
                  src="/images/strength-conditioning.png"
                  alt="Strength & Conditioning"
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Strength & Conditioning</h3>
                <p className="text-gray-600 mb-4">Build power and endurance for boxing</p>
                <p className="text-2xl font-bold text-red-600">$15 / drop-in</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/juniors">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                <img src="/images/junior-jabbers.png" alt="Junior Jabbers" className="w-full h-full object-cover" />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Junior Jabbers</h3>
                <p className="text-gray-600 mb-4">Boxing classes for young athletes</p>
                <p className="text-2xl font-bold text-red-600">$85 / 4-week program</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/beginner">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                <img src="/images/gym-training.png" alt="Beginner Boxing" className="w-full h-full object-cover" />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Beginner Boxing</h3>
                <p className="text-gray-600 mb-4">Perfect for those new to boxing</p>
                <p className="text-2xl font-bold text-red-600">$15 / drop-in</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      </div>
    )
  }
