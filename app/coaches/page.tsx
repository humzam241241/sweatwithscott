import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function CoachesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <header className="bg-black text-white py-32 text-center animate-in fade-in">
        <h1 className="text-5xl font-bold mb-4">Meet Our Coaches</h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Learn from experienced trainers who bring passion, skill, and dedication to every class.
        </p>
      </header>

      {/* Coaches Grid */}
      <section className="max-w-6xl mx-auto py-20 px-4 animate-in fade-in slide-in-from-bottom-8">
        <div className="flex justify-center gap-8 flex-wrap">
          <Link href="/coach-kyle">
            <Card className="w-60 p-8 text-center rounded-lg shadow-md transition-transform hover:scale-105">
              <div className="mb-4">
                <img
                  src="/images/kyle-mclaughlin.png"
                  alt="Kyle McLaughlin"
                  className="w-24 h-24 mx-auto rounded-full object-cover"
                />
              </div>
              <CardContent className="p-0">
                <h4 className="text-lg font-bold mb-1">Kyle McLaughlin</h4>
                <p className="text-gray-600 mb-3">Head Boxing Coach</p>
                <span className="text-base border-b border-dotted border-red-600">View Profile</span>
              </CardContent>
            </Card>
          </Link>

          <Link href="/coach-humza">
            <Card className="w-60 p-8 text-center rounded-lg shadow-md transition-transform hover:scale-105">
              <div className="mb-4">
                <img
                  src="/images/coach-humza.png"
                  alt="Humza Muhammad"
                  className="w-24 h-24 mx-auto rounded-full object-cover"
                />
              </div>
              <CardContent className="p-0">
                <h4 className="text-lg font-bold mb-1">Humza Muhammad</h4>
                <p className="text-gray-600 mb-3">Strength & Conditioning Coach</p>
                <span className="text-base border-b border-dotted border-red-600">View Profile</span>
              </CardContent>
            </Card>
          </Link>

          <Link href="/coach-scott">
            <Card className="w-60 p-8 text-center rounded-lg shadow-md transition-transform hover:scale-105">
              <div className="mb-4">
                <img
                  src="/images/coach-scott.png"
                  alt="Scott McDonald"
                  className="w-24 h-24 mx-auto rounded-full object-cover"
                />
              </div>
              <CardContent className="p-0">
                <h4 className="text-lg font-bold mb-1">Scott McDonald</h4>
                <p className="text-gray-600 mb-3">Boxing & Fitness Coach</p>
                <span className="text-base border-b border-dotted border-red-600">View Profile</span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  )
}
