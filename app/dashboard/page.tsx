"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import BookableSchedule from "@/components/bookable-schedule"

interface Booking {
  id: number
  className: string
  date: string
  time: string
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchSession = async () => {
      const resp = await fetch("/api/auth/me")
      if (resp.ok) {
        const session = await resp.json()
        setUser(session)
        loadBookings(session.userId)
      } else {
        router.push("/login")
      }
    }
    fetchSession()
  }, [])

  const loadBookings = async (userId: number) => {
    const resp = await fetch(`/api/user/bookings?user_id=${userId}`)
    if (resp.ok) {
      setBookings(await resp.json())
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <div className="max-w-4xl mx-auto p-4">
        {user && (
          <h1 className="text-2xl font-bold mb-4">Welcome, {user.fullName}</h1>
        )}
        <BookableSchedule userMode userId={user?.userId} />
        <h2 className="text-xl font-bold mt-8 mb-4">My Booked Classes</h2>
        {bookings.length > 0 ? (
          <ul className="space-y-2">
            {bookings.map((b) => (
              <li key={b.id} className="border border-gray-700 p-4 rounded bg-gray-900">
                <p className="font-semibold">{b.className}</p>
                <p className="text-sm text-gray-400">
                  {new Date(b.date).toLocaleDateString()} {b.time}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No bookings yet.</p>
        )}
      </div>
      <Footer />
    </div>
  )
}
