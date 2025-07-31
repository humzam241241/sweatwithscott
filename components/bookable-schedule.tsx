"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, Users, MapPin, Calendar, User } from "lucide-react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";

interface ClassInstance {
  id: number;
  class_id: number;
  name: string;
  coach: string;
  date: string;
  start_time: string;
  end_time: string;
  level: string;
  max_capacity: number;
  current_bookings: number;
  price: number;
  status: string;
  user_booking_status?: string;
}

interface BookableScheduleProps {
  userMode?: boolean;
  userId?: number;
}

export default function BookableSchedule({ userMode = false, userId }: BookableScheduleProps) {
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [classInstances, setClassInstances] = useState<ClassInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 }); // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    fetchClassInstances();
  }, [selectedWeek, userId]);

  const fetchClassInstances = async () => {
    try {
      const startDate = format(weekStart, "yyyy-MM-dd");
      const endDate = format(addDays(weekStart, 6), "yyyy-MM-dd");

      const params = new URLSearchParams()
      const isCurrentWeek = isSameDay(
        weekStart,
        startOfWeek(new Date(), { weekStartsOn: 1 })
      )
      if (!isCurrentWeek) {
        params.set("start_date", startDate)
        params.set("end_date", endDate)
      }
      if (userMode && userId) {
        params.set("user_id", userId.toString())
      }

      const url =
        params.toString().length > 0
          ? `/api/classes/instances?${params.toString()}`
          : "/api/classes/instances"

      const response = await fetch(url);
      const data = await response.json();

      if (Array.isArray(data)) {
        setClassInstances(data);
      } else {
        console.error("❌ API did not return an array:", data);
        setClassInstances([]);
      }
    } catch (error) {
      console.error("❌ Error fetching class instances:", error);
      setClassInstances([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookClass = async (classInstanceId: number) => {
    if (!userId) {
      setMessage({ type: "error", text: "Please log in to book classes" });
      return;
    }

    setBookingLoading(classInstanceId);
    try {
      const response = await fetch("/api/classes/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          class_instance_id: classInstanceId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: data.message });
        fetchClassInstances();
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to book class. Please try again." });
    } finally {
      setBookingLoading(null);
    }
  };

  const handleCancelBooking = async (classInstanceId: number) => {
    if (!userId) return;

    setBookingLoading(classInstanceId);
    try {
      const response = await fetch("/api/classes/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          class_instance_id: classInstanceId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: data.message });
        fetchClassInstances();
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to cancel booking. Please try again." });
    } finally {
      setBookingLoading(null);
    }
  };

  const getClassesForDay = (date: Date) => {
    if (!Array.isArray(classInstances)) {
      console.error("❌ classInstances is not an array:", classInstances);
      return [];
    }
    return classInstances.filter((instance) => isSameDay(new Date(instance.date), date));
  };

  const getLevelColor = (level: string) => {
    if (level.includes("Ages")) return "bg-purple-100 text-purple-800";
    if (level === "Beginner") return "bg-green-100 text-green-800";
    if (level === "Intermediate") return "bg-yellow-100 text-yellow-800";
    if (level === "Advanced") return "bg-red-100 text-red-800";
    if (level === "Members Only") return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  const getBookingButton = (instance: ClassInstance) => {
    const isFullyBooked = instance.current_bookings >= instance.max_capacity;
    const isLoading = bookingLoading === instance.id;

    if (instance.user_booking_status === "confirmed") {
      return (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleCancelBooking(instance.id)}
          disabled={isLoading}
          className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
        >
          {isLoading ? "Cancelling..." : "Cancel Booking"}
        </Button>
      );
    }

    if (instance.user_booking_status === "waitlist") {
      return (
        <Button size="sm" variant="outline" disabled className="border-yellow-600 text-yellow-600 bg-transparent">
          On Waitlist
        </Button>
      );
    }

    if (isFullyBooked) {
      return (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleBookClass(instance.id)}
          disabled={isLoading}
          className="border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white"
        >
          {isLoading ? "Joining..." : "Join Waitlist"}
        </Button>
      );
    }

    return (
      <Button
        size="sm"
        onClick={() => handleBookClass(instance.id)}
        disabled={isLoading}
        className="bg-red-600 hover:bg-red-700"
      >
        {isLoading ? "Booking..." : "Book Class"}
      </Button>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading schedule...</div>;
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="cave-section-title mb-4">Book Your Classes</h2>
        <p className="text-lg text-gray-600">
          Select classes to book. Call{" "}
          <a href="tel:2898925430" className="text-red-600 font-semibold">
            (289) 892-5430
          </a>{" "}
          for assistance.
        </p>
      </div>

      {message && (
        <Alert className={`mb-6 ${message.type === "success" ? "border-green-200 bg-green-50" : ""}`}>
          <AlertDescription className={message.type === "success" ? "text-green-800" : ""}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={() => setSelectedWeek(addDays(selectedWeek, -7))}
          className="flex items-center gap-2"
        >
          ← Previous Week
        </Button>
        <h3 className="text-xl font-bold">
          {format(weekStart, "MMM d")} - {format(addDays(weekStart, 6), "MMM d, yyyy")}
        </h3>
        <Button
          variant="outline"
          onClick={() => setSelectedWeek(addDays(selectedWeek, 7))}
          className="flex items-center gap-2"
        >
          Next Week →
        </Button>
      </div>

      {/* Schedule Grid */}
      <div className="grid gap-6">
        {weekDays.map((day) => {
          const dayClasses = getClassesForDay(day);
          const dayName = format(day, "EEEE");
          const dayDate = format(day, "MMM d");

          return (
            <Card key={day.toISOString()} className="overflow-hidden">
              <CardHeader className="bg-red-600 text-white">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {dayName}, {dayDate}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {dayClasses.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">No classes scheduled</div>
                ) : (
                  <div className="divide-y">
                    {dayClasses.map((instance) => (
                      <div key={instance.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="h-4 w-4 text-red-600" />
                              <span className="font-semibold text-gray-900">
                                {instance.start_time} - {instance.end_time}
                              </span>
                              {instance.price > 0 && <span className="text-red-600 font-bold">${instance.price}</span>}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{instance.name}</h3>
                            <div className="flex items-center gap-2 mb-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-600">Coach: {instance.coach}</span>
                            </div>
                          </div>

                          <div className="flex flex-col lg:items-end gap-3">
                            <div className="flex items-center gap-3">
                              <Badge className={getLevelColor(instance.level)}>{instance.level}</Badge>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Users className="h-4 w-4" />
                                <span>
                                  {instance.current_bookings}/{instance.max_capacity}
                                </span>
                                {instance.current_bookings >= instance.max_capacity && (
                                  <Badge variant="destructive" className="ml-2">
                                    FULL
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {userMode && <div className="flex gap-2">{getBookingButton(instance)}</div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
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
  );
}
