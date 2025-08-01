import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function ClassesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <header className="bg-black text-white py-32 text-center animate-in fade-in">
        <h1 className="text-5xl font-bold mb-4">Our Classes</h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Choose from our wide range of classes to improve your boxing skills, fitness, and strength.
        </p>
      </header>

      {/* Classes Grid */}
      <section className="max-w-7xl mx-auto py-20 px-4 animate-in fade-in slide-in-from-bottom-8">
        <h2 className="text-3xl font-bold text-center mb-12">Available Classes</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Link href="/boxing">
            <Card className="group overflow-hidden rounded-lg shadow-md transition-transform hover:scale-105">
              <div className="aspect-video bg-gray-200">
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
            <Card className="group overflow-hidden rounded-lg shadow-md transition-transform hover:scale-105">
              <div className="aspect-video bg-gray-200">
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
            <Card className="group overflow-hidden rounded-lg shadow-md transition-transform hover:scale-105">
              <div className="aspect-video bg-gray-200">
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
            <Card className="group overflow-hidden rounded-lg shadow-md transition-transform hover:scale-105">
              <div className="aspect-video bg-gray-200">
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
