import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"
import WeeklySchedule from "@/components/weekly-schedule"

export default function SchedulePage() {
  return (
    <div className="min-h-screen">

      {/* Phone Banner */}
      <div className="bg-red-600 text-white text-center py-2 px-4">
        <span className="font-bold">Call Now! (289)892-5430</span>
      </div>

      {/* Hero Section */}
      <header className="cave-hero py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-black mb-6">Class Schedule</h1>
          <p className="text-xl">Find the perfect class time that fits your schedule and start your boxing journey.</p>
        </div>
      </header>

      {/* Gym Hours */}
      <section className="max-w-3xl mx-auto py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 text-red-600 mr-2" /> Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-gray-700">
              <div className="flex justify-between">
                <span>Monday - Friday:</span>
                <span>6:00 AM - 9:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday:</span>
                <span>8:00 AM - 5:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday:</span>
                <span>Closed</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Schedule */}
      <section className="max-w-6xl mx-auto py-12 px-4">
        <WeeklySchedule />
      </section>

    </div>
  )
}
