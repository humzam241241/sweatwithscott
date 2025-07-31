"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, MapPin } from "lucide-react"

// Easy to update schedule data
const scheduleData = {
  Monday: [
    {
      time: "6:00 AM - 7:00 AM",
      class: "Boxing Technique",
      coach: "Kyle McLaughlin",
      level: "All Levels",
      spots: 15,
    },
    {
      time: "7:00 PM - 8:00 PM",
      class: "Strength & Conditioning",
      coach: "Humza Muhammad",
      level: "Intermediate",
      spots: 12,
    },
  ],
  Tuesday: [
    {
      time: "6:00 AM - 7:00 AM",
      class: "Boxing Bootcamp",
      coach: "Scott McDonald",
      level: "All Levels",
      spots: 20,
    },
    {
      time: "4:00 PM - 5:00 PM",
      class: "Teen Boxing",
      coach: "Kyle McLaughlin",
      level: "Ages 13-16",
      spots: 10,
    },
    {
      time: "7:00 PM - 8:00 PM",
      class: "Women's Boxing",
      coach: "Scott McDonald",
      level: "All Levels",
      spots: 15,
    },
  ],
  Wednesday: [
    {
      time: "6:00 AM - 7:00 AM",
      class: "Boxing Technique",
      coach: "Kyle McLaughlin",
      level: "All Levels",
      spots: 15,
    },
    {
      time: "7:00 PM - 8:00 PM",
      class: "Strength & Conditioning",
      coach: "Humza Muhammad",
      level: "Advanced",
      spots: 12,
    },
  ],
  Thursday: [
    {
      time: "6:00 AM - 7:00 AM",
      class: "Boxing Bootcamp",
      coach: "Scott McDonald",
      level: "All Levels",
      spots: 20,
    },
    {
      time: "4:00 PM - 5:00 PM",
      class: "Teen Boxing",
      coach: "Kyle McLaughlin",
      level: "Ages 13-16",
      spots: 10,
    },
    {
      time: "7:00 PM - 8:00 PM",
      class: "Boxing Technique",
      coach: "Kyle McLaughlin",
      level: "Intermediate",
      spots: 15,
    },
  ],
  Friday: [
    {
      time: "6:00 AM - 7:00 AM",
      class: "Boxing Technique",
      coach: "Kyle McLaughlin",
      level: "All Levels",
      spots: 15,
    },
    {
      time: "7:00 PM - 8:00 PM",
      class: "Open Gym",
      coach: "Self-Directed",
      level: "Members Only",
      spots: 25,
    },
  ],
  Saturday: [
    {
      time: "9:00 AM - 10:00 AM",
      class: "Boxing Bootcamp",
      coach: "Scott McDonald",
      level: "All Levels",
      spots: 20,
    },
    {
      time: "10:00 AM - 11:00 AM",
      class: "Junior Jabbers",
      coach: "Humza Muhammad",
      level: "Ages 6-12",
      spots: 12,
    },
    {
      time: "11:30 AM - 12:30 PM",
      class: "Teen Boxing",
      coach: "Kyle McLaughlin",
      level: "Ages 13-16",
      spots: 10,
    },
  ],
  Sunday: [
    {
      time: "10:00 AM - 11:00 AM",
      class: "Open Gym",
      coach: "Self-Directed",
      level: "Members Only",
      spots: 25,
    },
  ],
}

export default function ClassSchedule() {
  const days = Object.keys(scheduleData) as Array<keyof typeof scheduleData>

  const getLevelColor = (level: string) => {
    if (level.includes("Ages")) return "bg-purple-100 text-purple-800"
    if (level === "Beginner") return "bg-green-100 text-green-800"
    if (level === "Intermediate") return "bg-yellow-100 text-yellow-800"
    if (level === "Advanced") return "bg-red-100 text-red-800"
    if (level === "Members Only") return "bg-blue-100 text-blue-800"
    return "bg-gray-100 text-gray-800"
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="cave-section-title mb-4">Class Schedule</h2>
        <p className="text-lg text-gray-600">
          All classes are 60 minutes unless otherwise noted. Book online or call{" "}
          <a href="tel:2898925430" className="text-red-600 font-semibold">
            (289) 892-5430
          </a>
        </p>
      </div>

      <div className="grid gap-6">
        {days.map((day) => (
          <Card key={day} className="overflow-hidden">
            <CardHeader className="bg-red-600 text-white">
              <CardTitle className="text-xl font-bold">{day}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {scheduleData[day].length === 0 ? (
                <div className="p-6 text-center text-gray-500">No classes scheduled</div>
              ) : (
                <div className="divide-y">
                  {scheduleData[day].map((classItem, index) => (
                    <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-red-600" />
                            <span className="font-semibold text-gray-900">{classItem.time}</span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{classItem.class}</h3>
                          <p className="text-gray-600">Coach: {classItem.coach}</p>
                        </div>

                        <div className="flex flex-col md:items-end gap-2">
                          <Badge className={getLevelColor(classItem.level)}>{classItem.level}</Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Users className="h-4 w-4" />
                            <span>{classItem.spots} spots</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-red-600" />
          <h3 className="text-lg font-bold">Location</h3>
        </div>
        <p className="text-gray-700">
          91 Station St Unit 8, Ajax, ON L1S 3H2
          <br />
          <a href="tel:2898925430" className="text-red-600 hover:underline">
            (289) 892-5430
          </a>
        </p>
      </div>
    </div>
  )
}
