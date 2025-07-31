import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Clock, Car, Train, Phone } from "lucide-react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"

export default function LocationPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <header className="bg-gradient-to-r from-red-600 to-red-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Location & Hours</h1>
          <p className="text-xl">Find us and plan your visit to The Cave Boxing Gym.</p>
        </div>
      </header>

      {/* Location Info */}
      <section className="max-w-6xl mx-auto py-16 px-4">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold mb-8">Visit Us</h2>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 text-red-600 mr-2" />
                  Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  91 Station St Unit 8
                  <br />
                  Ajax, ON
                  <br />
                  L1S 3H2
                </p>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 text-red-600 mr-2" />
                  Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span>Monday - Friday:</span>
                    <span>6:00 AM - 10:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday:</span>
                    <span>8:00 AM - 8:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday:</span>
                    <span>8:00 AM - 8:00 PM</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="h-5 w-5 text-red-600 mr-2" />
                  Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-gray-700">
                  <p>
                    Phone:{" "}
                    <a href="tel:555-555-5555" className="hover:text-red-600">
                      555-555-5555
                    </a>
                  </p>
                  <p>
                    Email:{" "}
                    <a href="mailto:info@caveboxing.com" className="hover:text-red-600">
                      info@caveboxing.com
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Car className="h-5 w-5 text-red-600 mr-2" />
                    Parking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">Free parking available in our lot and street parking nearby.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Train className="h-5 w-5 text-red-600 mr-2" />
                    Transit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">Accessible by bus routes 15, 22, and 45. Metro station 2 blocks away.</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-8">Find Us</h2>
            <div className="bg-gray-200 h-96 rounded-lg flex items-center justify-center mb-6">
              <p className="text-gray-600">Interactive Map Coming Soon</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Getting Here</h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  <strong>From Downtown:</strong> Take Main Street north for 2 miles, turn right on Boxing Street.
                </p>
                <p>
                  <strong>From Highway 101:</strong> Exit at Fitness Boulevard, head east for 1 mile.
                </p>
                <p>
                  <strong>Public Transit:</strong> Take the Red Line to Fitness Station, walk 2 blocks north.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
