"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Users, Clock, Phone, Mail, CheckCircle, XCircle, Clock3 } from "lucide-react"
import { format } from "date-fns"

interface Attendee {
  id: number
  user_id: number
  name: string
  email: string
  phone: string
  booking_status: string
  payment_status: string
  payment_method: string
  booking_date: string
  attendance_status: string | null
  notes: string
}

interface ClassRoster {
  id: number
  class_name: string
  coach: string
  date: string
  start_time: string
  end_time: string
  max_capacity: number
  current_bookings: number
  attendees: Attendee[]
  waitlist: any[]
}

export default function AdminClassRoster() {
  const [rosters, setRosters] = useState<ClassRoster[]>([])
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [loading, setLoading] = useState(true)
  const [attendanceNotes, setAttendanceNotes] = useState("")

  useEffect(() => {
    fetchClassRosters()
  }, [selectedDate])

  const fetchClassRosters = async () => {
    try {
      const response = await fetch(`/api/admin/class-rosters?date=${selectedDate}`)
      const data = await response.json()
      setRosters(data)
    } catch (error) {
      console.error("Error fetching class rosters:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAttendance = async (bookingId: number, status: string, notes = "") => {
    try {
      await fetch("/api/admin/mark-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: bookingId,
          attendance_status: status,
          notes,
        }),
      })
      fetchClassRosters() // Refresh data
    } catch (error) {
      console.error("Error marking attendance:", error)
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "refunded":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-red-100 text-red-800"
    }
  }

  const getAttendanceIcon = (status: string | null) => {
    switch (status) {
      case "attended":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "no_show":
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock3 className="h-5 w-5 text-gray-400" />
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading class rosters...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Class Rosters</h2>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Date:</label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
        </div>
      </div>

      {rosters.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No classes scheduled for this date.</p>
          </CardContent>
        </Card>
      ) : (
        rosters.map((roster) => (
          <Card key={roster.id} className="overflow-hidden">
            <CardHeader className="bg-red-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{roster.class_name}</CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-sm opacity-90">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {roster.start_time} - {roster.end_time}
                    </span>
                    <span>Coach: {roster.coach}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-lg font-bold">
                    <Users className="h-5 w-5" />
                    {roster.current_bookings}/{roster.max_capacity}
                  </div>
                  <p className="text-sm opacity-90">
                    {roster.waitlist.length > 0 && `${roster.waitlist.length} on waitlist`}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {roster.attendees.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No bookings for this class.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Booked</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roster.attendees.map((attendee) => (
                      <TableRow key={attendee.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{attendee.name}</p>
                            {attendee.notes && <p className="text-sm text-gray-500">{attendee.notes}</p>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              <a href={`mailto:${attendee.email}`} className="text-blue-600 hover:underline">
                                {attendee.email}
                              </a>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              <a href={`tel:${attendee.phone}`} className="text-blue-600 hover:underline">
                                {attendee.phone}
                              </a>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge className={getPaymentStatusColor(attendee.payment_status)}>
                              {attendee.payment_status}
                            </Badge>
                            <p className="text-xs text-gray-500 capitalize">{attendee.payment_method}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{format(new Date(attendee.booking_date), "MMM d, h:mm a")}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getAttendanceIcon(attendee.attendance_status)}
                            <span className="text-sm capitalize">{attendee.attendance_status || "pending"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAttendance(attendee.id, "attended")}
                              className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
                            >
                              Present
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAttendance(attendee.id, "no_show")}
                              className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                            >
                              No Show
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  Notes
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Add Attendance Notes - {attendee.name}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium">Attendance Status</label>
                                    <Select
                                      onValueChange={(value) => markAttendance(attendee.id, value, attendanceNotes)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="attended">Attended</SelectItem>
                                        <SelectItem value="no_show">No Show</SelectItem>
                                        <SelectItem value="late">Late</SelectItem>
                                        <SelectItem value="left_early">Left Early</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Notes</label>
                                    <Textarea
                                      value={attendanceNotes}
                                      onChange={(e) => setAttendanceNotes(e.target.value)}
                                      placeholder="Add any notes about attendance..."
                                    />
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Waitlist Section */}
              {roster.waitlist.length > 0 && (
                <div className="border-t bg-yellow-50 p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Waitlist ({roster.waitlist.length})</h4>
                  <div className="space-y-2">
                    {roster.waitlist.map((person, index) => (
                      <div key={person.id} className="flex items-center justify-between text-sm">
                        <span>
                          {index + 1}. {person.name} ({person.email})
                        </span>
                        <Button size="sm" variant="outline" className="text-xs bg-transparent">
                          Move to Class
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
