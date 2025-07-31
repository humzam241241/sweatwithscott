"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  UserCheck,
  CalendarDays,
  History,
} from "lucide-react"
import Navigation from "@/components/navigation"

interface GymStats {
  total_members: number
  total_bookings: number
  total_attended: number
  upcoming_classes: number
  pending_payments: number
  total_revenue: number
}

interface ClassData {
  id: number
  class_name: string
  instructor: string
  date: string
  start_time: string
  end_time: string
  max_capacity: number
  current_bookings: number
  total_bookings: number
  attended_count: number
  pending_payments: number
  status: string
}

interface AttendeeData {
  id: number
  user_id: number
  username: string
  full_name: string
  email: string
  phone: string
  payment_status: string
  payment_amount: number
  attended: number
  booking_date: string
  notes: string
}

interface OutstandingPayment {
  id: number
  user_id: number
  username: string
  full_name: string
  email: string
  phone: string
  class_name: string
  instructor: string
  date: string
  start_time: string
  payment_amount: number
  booking_date: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<GymStats>({
    total_members: 0,
    total_bookings: 0,
    total_attended: 0,
    upcoming_classes: 0,
    pending_payments: 0,
    total_revenue: 0,
  })
  const [currentClasses, setCurrentClasses] = useState<ClassData[]>([])
  const [futureClasses, setFutureClasses] = useState<ClassData[]>([])
  const [pastClasses, setPastClasses] = useState<ClassData[]>([])
  const [selectedClassAttendees, setSelectedClassAttendees] = useState<AttendeeData[]>([])
  const [outstandingPayments, setOutstandingPayments] = useState<OutstandingPayment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      // Fetch gym statistics
      const statsResponse = await fetch("/api/admin/stats")
      if (statsResponse.status === 401) {
        router.push("/login")
        return
      }
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch current classes
      const currentResponse = await fetch("/api/admin/classes/current")
      if (currentResponse.status === 401) {
        router.push("/login")
        return
      }
      if (currentResponse.ok) {
        const currentData = await currentResponse.json()
        setCurrentClasses(currentData)
      }

      // Fetch future classes
      const futureResponse = await fetch("/api/admin/classes/future")
      if (futureResponse.status === 401) {
        router.push("/login")
        return
      }
      if (futureResponse.ok) {
        const futureData = await futureResponse.json()
        setFutureClasses(futureData)
      }

      // Fetch past classes
      const pastResponse = await fetch("/api/admin/classes/past")
      if (pastResponse.status === 401) {
        router.push("/login")
        return
      }
      if (pastResponse.ok) {
        const pastData = await pastResponse.json()
        setPastClasses(pastData)
      }

      // Fetch outstanding payments
      const paymentsResponse = await fetch("/api/admin/outstanding-payments")
      if (paymentsResponse.status === 401) {
        router.push("/login")
        return
      }
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json()
        setOutstandingPayments(paymentsData)
      }
    } catch (error) {
      console.error("Error fetching admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchClassAttendees = async (classInstanceId: number) => {
    try {
      const response = await fetch(`/api/admin/classes/${classInstanceId}/attendees`)
      if (response.status === 401) {
        router.push("/login")
        return
      }
      if (response.ok) {
        const data = await response.json()
        setSelectedClassAttendees(data)
      }
    } catch (error) {
      console.error("Error fetching class attendees:", error)
    }
  }

  const markAttendance = async (bookingId: number, attended: boolean) => {
    try {
      const response = await fetch("/api/admin/mark-attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          attended,
        }),
      })

      if (response.status === 401) {
        router.push("/login")
        return
      }

      if (response.ok) {
        // Refresh data
        fetchAdminData()
        if (selectedClassAttendees.length > 0) {
          const classId = selectedClassAttendees[0]?.id
          if (classId) {
            fetchClassAttendees(classId)
          }
        }
      }
    } catch (error) {
      console.error("Error marking attendance:", error)
    }
  }

  const markPaymentPaid = async (bookingId: number) => {
    try {
      const response = await fetch("/api/admin/mark-payment-paid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          paymentMethod: "cash",
        }),
      })

      if (response.status === 401) {
        router.push("/login")
        return
      }

      if (response.ok) {
        // Refresh data
        fetchAdminData()
      }
    } catch (error) {
      console.error("Error marking payment as paid:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p>Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-red-500 mb-2">Admin Dashboard</h1>
          <p className="text-gray-300">Comprehensive gym management - track classes, attendance, and payments</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Members</CardTitle>
              <Users className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.total_members}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Today's Classes</CardTitle>
              <Calendar className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{currentClasses.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${(stats.total_revenue || 0).toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Attendance Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats.total_bookings > 0 ? Math.round((stats.total_attended / stats.total_bookings) * 100) : 0}%
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Pending Payments</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.pending_payments}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Bookings</CardTitle>
              <UserCheck className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.total_bookings}</div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="current" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-900">
            <TabsTrigger value="current" className="data-[state=active]:bg-red-600">
              <CalendarDays className="h-4 w-4 mr-2" />
              Today's Classes
            </TabsTrigger>
            <TabsTrigger value="future" className="data-[state=active]:bg-red-600">
              <Calendar className="h-4 w-4 mr-2" />
              Future Classes
            </TabsTrigger>
            <TabsTrigger value="past" className="data-[state=active]:bg-red-600">
              <History className="h-4 w-4 mr-2" />
              Past Classes
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-red-600">
              <CreditCard className="h-4 w-4 mr-2" />
              Outstanding Payments
            </TabsTrigger>
          </TabsList>

          {/* Current Classes */}
          <TabsContent value="current" className="space-y-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-red-500">Today's Classes</CardTitle>
                <CardDescription className="text-gray-400">
                  Classes scheduled for {new Date().toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentClasses.length > 0 ? (
                  <div className="space-y-4">
                    {currentClasses.map((classItem) => (
                      <div key={classItem.id} className="p-4 bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-white text-lg">{classItem.class_name}</h4>
                            <p className="text-gray-400">
                              {classItem.instructor} • {formatTime(classItem.start_time)} -{" "}
                              {formatTime(classItem.end_time)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-sm font-medium text-white">
                                {classItem.current_bookings}/{classItem.max_capacity}
                              </p>
                              <p className="text-xs text-gray-400">Bookings</p>
                            </div>
                            <Badge
                              variant="outline"
                              className={
                                classItem.current_bookings >= classItem.max_capacity
                                  ? "text-red-400 border-red-400"
                                  : "text-green-400 border-green-400"
                              }
                            >
                              {classItem.current_bookings >= classItem.max_capacity ? "Full" : "Available"}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Attended</p>
                            <p className="text-white font-medium">{classItem.attended_count || 0}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Pending Payments</p>
                            <p className="text-yellow-400 font-medium">{classItem.pending_payments || 0}</p>
                          </div>
                          <div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white bg-transparent"
                              onClick={() => fetchClassAttendees(classItem.id)}
                            >
                              View Attendees
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No classes scheduled for today</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Selected Class Attendees */}
            {selectedClassAttendees.length > 0 && (
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-red-500">Class Attendees</CardTitle>
                  <CardDescription className="text-gray-400">Manage attendance for selected class</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-gray-300">Member</TableHead>
                        <TableHead className="text-gray-300">Contact</TableHead>
                        <TableHead className="text-gray-300">Payment</TableHead>
                        <TableHead className="text-gray-300">Attendance</TableHead>
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedClassAttendees.map((attendee) => (
                        <TableRow key={attendee.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-white">{attendee.full_name || attendee.username}</p>
                              <p className="text-sm text-gray-400">@{attendee.username}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p className="text-gray-300">{attendee.email}</p>
                              <p className="text-gray-400">{attendee.phone}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                attendee.payment_status === "paid"
                                  ? "text-green-400 border-green-400"
                                  : "text-yellow-400 border-yellow-400"
                              }
                            >
                              ${attendee.payment_amount} {attendee.payment_status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {attendee.attended === 1 ? (
                                <CheckCircle className="h-5 w-5 text-green-400" />
                              ) : (
                                <Clock className="h-5 w-5 text-gray-400" />
                              )}
                              <span className="text-sm text-gray-300">
                                {attendee.attended === 1 ? "Present" : "Pending"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-400 border-green-400 hover:bg-green-400 hover:text-white bg-transparent"
                                onClick={() => markAttendance(attendee.id, true)}
                                disabled={attendee.attended === 1}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white bg-transparent"
                                onClick={() => markAttendance(attendee.id, false)}
                                disabled={attendee.attended === 0}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Future Classes */}
          <TabsContent value="future" className="space-y-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-red-500">Upcoming Classes</CardTitle>
                <CardDescription className="text-gray-400">Future scheduled classes and bookings</CardDescription>
              </CardHeader>
              <CardContent>
                {futureClasses.length > 0 ? (
                  <div className="space-y-4">
                    {futureClasses.map((classItem) => (
                      <div key={classItem.id} className="p-4 bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-white text-lg">{classItem.class_name}</h4>
                            <p className="text-gray-400">
                              {classItem.instructor} • {formatDate(classItem.date)} at{" "}
                              {formatTime(classItem.start_time)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-sm font-medium text-white">
                                {classItem.current_bookings}/{classItem.max_capacity}
                              </p>
                              <p className="text-xs text-gray-400">Bookings</p>
                            </div>
                            <Badge
                              variant="outline"
                              className={
                                classItem.current_bookings >= classItem.max_capacity
                                  ? "text-red-400 border-red-400"
                                  : "text-green-400 border-green-400"
                              }
                            >
                              {classItem.current_bookings >= classItem.max_capacity ? "Full" : "Available"}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Total Bookings</p>
                            <p className="text-white font-medium">{classItem.total_bookings || 0}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Pending Payments</p>
                            <p className="text-yellow-400 font-medium">{classItem.pending_payments || 0}</p>
                          </div>
                          <div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white bg-transparent"
                              onClick={() => fetchClassAttendees(classItem.id)}
                            >
                              View Bookings
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No upcoming classes scheduled</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Past Classes */}
          <TabsContent value="past" className="space-y-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-red-500">Past Classes</CardTitle>
                <CardDescription className="text-gray-400">
                  Historical class data and attendance records
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pastClasses.length > 0 ? (
                  <div className="space-y-4">
                    {pastClasses.map((classItem) => (
                      <div key={classItem.id} className="p-4 bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-white text-lg">{classItem.class_name}</h4>
                            <p className="text-gray-400">
                              {classItem.instructor} • {formatDate(classItem.date)} at{" "}
                              {formatTime(classItem.start_time)}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-gray-400 border-gray-400">
                            Completed
                          </Badge>
                        </div>

                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Total Bookings</p>
                            <p className="text-white font-medium">{classItem.total_bookings || 0}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Attended</p>
                            <p className="text-green-400 font-medium">{classItem.attended_count || 0}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Attendance Rate</p>
                            <p className="text-blue-400 font-medium">
                              {classItem.total_bookings > 0
                                ? Math.round(((classItem.attended_count || 0) / classItem.total_bookings) * 100)
                                : 0}
                              %
                            </p>
                          </div>
                          <div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white bg-transparent"
                              onClick={() => fetchClassAttendees(classItem.id)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No past classes found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Outstanding Payments */}
          <TabsContent value="payments" className="space-y-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-red-500">Outstanding Payments</CardTitle>
                <CardDescription className="text-gray-400">
                  Members with pending payments for booked classes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {outstandingPayments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-gray-300">Member</TableHead>
                        <TableHead className="text-gray-300">Contact</TableHead>
                        <TableHead className="text-gray-300">Class</TableHead>
                        <TableHead className="text-gray-300">Date</TableHead>
                        <TableHead className="text-gray-300">Amount</TableHead>
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {outstandingPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-white">{payment.full_name || payment.username}</p>
                              <p className="text-sm text-gray-400">@{payment.username}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p className="text-gray-300">{payment.email}</p>
                              <p className="text-gray-400">{payment.phone}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-white">{payment.class_name}</p>
                              <p className="text-sm text-gray-400">{payment.instructor}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-white">{formatDate(payment.date)}</p>
                              <p className="text-sm text-gray-400">{formatTime(payment.start_time)}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                              ${payment.payment_amount.toFixed(2)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-400 border-green-400 hover:bg-green-400 hover:text-white bg-transparent"
                              onClick={() => markPaymentPaid(payment.id)}
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              Mark Paid
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No outstanding payments</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
