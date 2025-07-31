"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, TrendingUp, CreditCard, CheckCircle, XCircle } from "lucide-react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import BookableSchedule from "@/components/bookable-schedule"

interface UserBooking {
  id: number
  class_name: string
  coach: string
  date: string
  start_time: string
  end_time: string
  level: string
  booking_status: string
  payment_status: string
  attendance_status?: string
}

interface UserStats {
  total_bookings: number
  attended_classes: number
  cancelled_bookings: number
}

interface Payment {
  id: number
  amount: number
  payment_type: string
  status: string
  created_at: string
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [bookings, setBookings] = useState<UserBooking[]>([])
  const [stats, setStats] = useState<UserStats>({ total_bookings: 0, attended_classes: 0, cancelled_bookings: 0 })
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock user data - in real app, get from auth context
    setUser({
      id: 1,
      username: "john_doe",
      email: "john@example.com",
      membership_status: "active",
    })

    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      // Fetch user bookings
      const bookingsResponse = await fetch("/api/user/bookings")
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json()
        setBookings(bookingsData)
      }

      // Fetch user payments
      const paymentsResponse = await fetch("/api/user/payments")
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json()
        setPayments(paymentsData)
      }

      // Calculate stats from bookings
      const totalBookings = bookings.length
      const attendedClasses = bookings.filter((b) => b.attendance_status === "attended").length
      const cancelledBookings = bookings.filter((b) => b.booking_status === "cancelled").length

      setStats({
        total_bookings: totalBookings,
        attended_classes: attendedClasses,
        cancelled_bookings: cancelledBookings,
      })
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const upcomingBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.date)
    const today = new Date()
    return bookingDate >= today && booking.booking_status === "confirmed"
  })

  const pastBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.date)
    const today = new Date()
    return bookingDate < today
  })

  const attendanceRate =
    stats.total_bookings > 0 ? Math.round((stats.attended_classes / stats.total_bookings) * 100) : 0
  const totalSpent = payments.reduce((sum, payment) => sum + payment.amount, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p>Loading your dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-red-500 mb-2">Welcome back, {user?.username}!</h1>
          <p className="text-gray-300">
            Manage your classes, track your progress, and stay connected with The Cave community.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Classes</CardTitle>
              <Calendar className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.total_bookings}</div>
              <p className="text-xs text-gray-400">Classes booked</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Attendance Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{attendanceRate}%</div>
              <p className="text-xs text-gray-400">{stats.attended_classes} attended</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Spent</CardTitle>
              <CreditCard className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${totalSpent.toFixed(2)}</div>
              <p className="text-xs text-gray-400">This year</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Membership</CardTitle>
              <User className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white capitalize">{user?.membership_status}</div>
              <p className="text-xs text-gray-400">Status</p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Classes */}
        <Card className="bg-gray-900 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-red-500">Upcoming Classes</CardTitle>
            <CardDescription className="text-gray-400">Your next scheduled training sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingBookings.length > 0 ? (
              <div className="space-y-4">
                {upcomingBookings.slice(0, 3).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="bg-red-600 rounded-full p-2">
                        <Clock className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{booking.class_name}</h4>
                        <p className="text-sm text-gray-400">
                          {booking.coach} • {new Date(booking.date).toLocaleDateString()} at {booking.start_time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        {booking.level}
                      </Badge>
                      <Badge variant="outline" className="text-blue-400 border-blue-400">
                        {booking.payment_status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No upcoming classes scheduled</p>
                <p className="text-sm text-gray-500 mt-2">Book a class to get started!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="book" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-900">
            <TabsTrigger value="book" className="data-[state=active]:bg-red-600">
              Book Classes
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-red-600">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-red-600">
              History
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-red-600">
              Payments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="book" className="space-y-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-red-500">Book a Class</CardTitle>
                <CardDescription className="text-gray-400">
                  Select a class from our schedule to book your spot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BookableSchedule />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-red-500">Upcoming Classes</CardTitle>
                <CardDescription className="text-gray-400">Your confirmed future training sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingBookings.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="bg-red-600 rounded-full p-2">
                            <Clock className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">{booking.class_name}</h4>
                            <p className="text-sm text-gray-400">
                              {booking.coach} • {new Date(booking.date).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-400">
                              {booking.start_time} - {booking.end_time}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-green-400 border-green-400">
                            {booking.level}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white bg-transparent"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No upcoming classes</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-red-500">Class History</CardTitle>
                <CardDescription className="text-gray-400">
                  Your past training sessions and attendance record
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pastBookings.length > 0 ? (
                  <div className="space-y-4">
                    {pastBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div
                            className={`rounded-full p-2 ${
                              booking.attendance_status === "attended"
                                ? "bg-green-600"
                                : booking.attendance_status === "missed"
                                  ? "bg-red-600"
                                  : "bg-gray-600"
                            }`}
                          >
                            {booking.attendance_status === "attended" ? (
                              <CheckCircle className="h-4 w-4 text-white" />
                            ) : booking.attendance_status === "missed" ? (
                              <XCircle className="h-4 w-4 text-white" />
                            ) : (
                              <Clock className="h-4 w-4 text-white" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">{booking.class_name}</h4>
                            <p className="text-sm text-gray-400">
                              {booking.coach} • {new Date(booking.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="outline"
                            className={
                              booking.attendance_status === "attended"
                                ? "text-green-400 border-green-400"
                                : booking.attendance_status === "missed"
                                  ? "text-red-400 border-red-400"
                                  : "text-gray-400 border-gray-400"
                            }
                          >
                            {booking.attendance_status || "Pending"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No class history yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-red-500">Payment History</CardTitle>
                <CardDescription className="text-gray-400">Your membership and class payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white">Current Membership</h3>
                      <p className="text-sm text-gray-400">Status: {user?.membership_status}</p>
                    </div>
                    <Button className="bg-red-600 hover:bg-red-700">Manage Membership</Button>
                  </div>
                </div>

                {payments.length > 0 ? (
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="bg-green-600 rounded-full p-2">
                            <CreditCard className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">${payment.amount.toFixed(2)}</h4>
                            <p className="text-sm text-gray-400">
                              {payment.payment_type} • {new Date(payment.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-green-400 border-green-400">
                          {payment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No payment history</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  )
}
