import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"
import WeeklySchedule from "@/components/weekly-schedule"

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <header className="bg-black text-white py-32 text-center animate-in fade-in">
        <h1 className="text-5xl font-bold mb-4">Class Schedule</h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Find the perfect class time that fits your schedule and start your boxing journey.
        </p>
      </header>

      {/* Gym Hours */}
      <section className="max-w-3xl mx-auto py-20 px-4 animate-in fade-in slide-in-from-bottom-8">
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
      <section className="max-w-6xl mx-auto pb-20 px-4 animate-in fade-in slide-in-from-bottom-8">
        <WeeklySchedule />
      </section>
    </div>
  )
}
