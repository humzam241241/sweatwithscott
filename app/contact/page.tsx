import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Phone, Mail, Clock } from "lucide-react"
import ContactForm from "@/components/contact-form"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <header className="bg-black text-white py-32 text-center animate-in fade-in">
        <h1 className="text-5xl font-bold mb-4">Contact Us</h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Get in touch with us to start your boxing journey or ask any questions.
        </p>
      </header>

      {/* Contact Info */}
      <section className="max-w-6xl mx-auto py-20 px-4 animate-in fade-in slide-in-from-bottom-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center rounded-lg shadow-md transition-transform hover:scale-105">
            <CardHeader>
              <MapPin className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                91 Station St Unit 8
                <br />
                Ajax, ON
                <br />
                L1S 3H2
              </p>
            </CardContent>
          </Card>

          <Card className="text-center rounded-lg shadow-md transition-transform hover:scale-105">
            <CardHeader>
              <Phone className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <CardTitle>Phone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                <a href="tel:2898925430" className="hover:text-red-600">
                  (289) 892-5430
                </a>
              </p>
            </CardContent>
          </Card>

          <Card className="text-center rounded-lg shadow-md transition-transform hover:scale-105">
            <CardHeader>
              <Mail className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <CardTitle>Email</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                <a href="mailto:info@caveboxing.com" className="hover:text-red-600">
                  info@caveboxing.com
                </a>
              </p>
            </CardContent>
          </Card>

          <Card className="text-center rounded-lg shadow-md transition-transform hover:scale-105">
            <CardHeader>
              <Clock className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <CardTitle>Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Mon-Fri: 6AM-10PM
                <br />
                Sat-Sun: 8AM-8PM
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form and Map */}
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <ContactForm />
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-8">Find Us</h2>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2886.768293971735!2d-79.0284!3d43.8506!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDPCsDUxJzAyLjIiTiA3OcKwMDEnNDIuMiJX!5e0!3m2!1sen!2sca!4v1693514600000!5m2!1sen!2sca"
              width="100%"
              height="400"
              style={{ border: 0, borderRadius: "10px" }}
              allowFullScreen
              loading="lazy"
              className="mb-6"
            />

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Getting Here</h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  <strong>From Toronto:</strong> Take Highway 401 East to Exit 394 (Salem Road), turn left and follow to
                  Station Street.
                </p>
                <p>
                  <strong>Public Transit:</strong> Take GO Transit to Ajax Station, then Durham Transit Route 15 to
                  Station Street.
                </p>
                <p>
                  <strong>Parking:</strong> Free parking available in our lot and street parking nearby.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
