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
  classInstanceId: number
}

interface Membership {
  fullName: string
  email: string
  membershipType: string
  membershipStatus: string
  membershipExpiry?: string
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [upcoming, setUpcoming] = useState<Booking[]>([])
  const [past, setPast] = useState<Booking[]>([])
  const [membership, setMembership] = useState<Membership | null>(null)
  const [payments, setPayments] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchSession = async () => {
      const resp = await fetch("/api/auth/me")
      if (resp.ok) {
        const session = await resp.json()
        setUser(session)
        loadBookings(session.userId)
        loadMembership(session.userId)
      } else {
        router.replace("/login")
      }
      setCheckingAuth(false)
    }
    fetchSession()
  }, [])

  const loadBookings = async (userId: number) => {
    const resp = await fetch(`/api/user/bookings?user_id=${userId}`)
    if (resp.ok) {
      const all = (await resp.json()) as Booking[]
      setBookings(all)
      const today = new Date()
      setUpcoming(all.filter((b) => new Date(b.date) >= today))
      setPast(all.filter((b) => new Date(b.date) < today))
    }
  }

  const loadMembership = async (userId: number) => {
    const resp = await fetch(`/api/user/profile?user_id=${userId}`)
    if (resp.ok) {
      setMembership(await resp.json())
    }
    const payResp = await fetch(`/api/user/payments`)
    if (payResp.ok) {
      setPayments(await payResp.json())
    }
  }

  const [profileData, setProfileData] = useState({ fullName: "", email: "", password: "" })
  const [profileMsg, setProfileMsg] = useState("")

  const handleProfileSave = async () => {
    if (!user) return
    setProfileMsg("")
    const resp = await fetch(`/api/user/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.userId,
        fullName: profileData.fullName || undefined,
        email: profileData.email || undefined,
        password: profileData.password || undefined,
      }),
    })
    const data = await resp.json()
    if (resp.ok) {
      setProfileMsg("Profile updated")
      loadMembership(user.userId)
    } else {
      setProfileMsg(data.errors ? data.errors.join(". ") : data.error)
    }
  }

  const handleCancelBooking = async (classInstanceId: number) => {
    if (!user) return
    const resp = await fetch("/api/classes/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.userId, class_instance_id: classInstanceId }),
    })
    if (resp.ok) {
      loadBookings(user.userId)
    }
  }

  if (checkingAuth) {
    return <div className="min-h-screen bg-black" />
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <div className="max-w-4xl mx-auto p-4">
        {user && (
          <h1 className="text-2xl font-bold mb-4">Welcome, {user.fullName}</h1>
        )}
        <BookableSchedule userMode userId={user?.userId} />

        {membership && (
          <div className="mt-8 border border-gray-700 p-4 rounded bg-gray-900">
            <h2 className="text-xl font-bold mb-2">Membership Details</h2>
            <p>Plan: {membership.membershipType}</p>
            <p>Status: {membership.membershipStatus}</p>
            {membership.membershipExpiry && (
              <p className="text-sm text-gray-400">
                Next billing date: {new Date(membership.membershipExpiry).toLocaleDateString()}
              </p>
            )}
            {payments.length > 0 && (
              <div className="mt-2">
                <h3 className="font-semibold">Payment History</h3>
                <ul className="list-disc ml-4 text-sm">
                  {payments.map((p) => (
                    <li key={p.id}>
                      {p.date} - ${'{'}p.amount{'}'} ({'{'}p.status{'}'})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <h2 className="text-xl font-bold mt-8 mb-4">Upcoming Classes</h2>
        {upcoming.length > 0 ? (
          <ul className="space-y-2">
            {upcoming.map((b) => (
              <li key={b.id} className="border border-gray-700 p-4 rounded bg-gray-900">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{b.className}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(b.date).toLocaleDateString()} {b.time}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCancelBooking(b.classInstanceId)}
                    className="text-red-500 text-sm hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No upcoming bookings.</p>
        )}

        <h2 className="text-xl font-bold mt-8 mb-4">Past Classes</h2>
        {past.length > 0 ? (
          <ul className="space-y-2">
            {past.map((b) => (
              <li key={b.id} className="border border-gray-700 p-4 rounded bg-gray-900">
                <p className="font-semibold">{b.className}</p>
                <p className="text-sm text-gray-400">
                  {new Date(b.date).toLocaleDateString()} {b.time}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No past bookings.</p>
        )}

        <h2 className="text-xl font-bold mt-8 mb-4">Edit Profile</h2>
        {profileMsg && <p className="mb-2 text-sm text-red-400">{profileMsg}</p>}
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Full name"
            value={profileData.fullName}
            onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
            className="w-full p-2 rounded text-black"
          />
          <input
            type="email"
            placeholder="Email"
            value={profileData.email}
            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
            className="w-full p-2 rounded text-black"
          />
          <input
            type="password"
            placeholder="New password"
            value={profileData.password}
            onChange={(e) => setProfileData({ ...profileData, password: e.target.value })}
            className="w-full p-2 rounded text-black"
          />
          <button
            onClick={handleProfileSave}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Save
          </button>
        </div>
      </div>
      <Footer />
    </div>
  )
}
