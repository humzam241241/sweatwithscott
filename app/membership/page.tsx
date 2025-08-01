import Link from "next/link"
import MembershipPackages from "@/components/membership-packages"

export default function MembershipPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <header className="bg-black text-white py-32 text-center animate-in fade-in">
        <h1 className="text-5xl font-bold mb-4">Membership Options</h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Choose the membership that fits your lifestyle and goals. All memberships include access to our world-class
          facilities.
        </p>
      </header>

      {/* Membership Content */}
      <section className="max-w-7xl mx-auto py-20 px-4 animate-in fade-in slide-in-from-bottom-8">
        <MembershipPackages />
      </section>
    </div>
  )
}
