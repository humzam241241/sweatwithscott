"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Johnson",
    age: 28,
    program: "Women's Boxing",
    rating: 5,
    text: "Sweat with Scott has completely transformed my life! I started as a complete beginner 6 months ago, and now I feel stronger and more confident than ever.",
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Mike Chen",
    age: 35,
    program: "Boxing Technique",
    rating: 5,
    text: "As someone who's trained at several gyms, Sweat with Scott stands out for its technical focus and coaching quality. My technique improved dramatically.",
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Emma Rodriguez",
    age: 12,
    program: "Junior Jabbers",
    rating: 5,
    text: "My daughter Emma absolutely loves Junior Jabbers! She's gained so much confidence and discipline. The coaches are amazing with kids and make every class fun while teaching important life skills.",
    image: "/placeholder.svg?height=80&width=80",
    parent: "Maria Rodriguez (Parent)",
  },
  {
    name: "David Thompson",
    age: 42,
    program: "Strength & Conditioning",
    rating: 5,
    text: "I was looking for a way to get back in shape after years of desk work. Humza's strength and conditioning program has been perfect - challenging but achievable. I've lost 30 pounds and feel amazing!",
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Jessica Park",
    age: 24,
    program: "Boxing Bootcamp",
    rating: 5,
    text: "The boxing bootcamp classes are intense but so rewarding! Scott pushes us just the right amount, and the community here is incredibly supportive. I've made great friends and achieved fitness goals I never thought possible.",
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Alex Kumar",
    age: 16,
    program: "Teen Boxing",
    rating: 5,
    text: "Training with Sweat with Scott has taught me discipline and respect. I am learning real boxing skills while getting fitter every week.",
    image: "/placeholder.svg?height=80&width=80",
  },
]

export default function Testimonials() {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
  }

  return (
    <div className="w-full">
      <div className="text-center mb-12">
        <h2 className="cave-section-title mb-4">What Our Members Say</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Don't just take our word for it - hear from real members who have transformed their lives with Sweat with Scott
          Gym.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-1 mb-4">{renderStars(testimonial.rating)}</div>

              <div className="relative mb-6">
                <Quote className="absolute -top-2 -left-2 h-8 w-8 text-red-200" />
                <p className="text-gray-700 leading-relaxed pl-6">{testimonial.text}</p>
              </div>

              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image || "/placeholder.svg"}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-red-200"
                />
                <div>
                  <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                  {testimonial.parent && <p className="text-sm text-gray-600">{testimonial.parent}</p>}
                  <p className="text-sm text-red-600 font-semibold">{testimonial.program}</p>
                  <p className="text-xs text-gray-500">Age {testimonial.age}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <div className="mt-16 text-center bg-red-600 text-white rounded-lg p-8">
        <h3 className="text-2xl font-bold mb-4">Ready to Write Your Success Story?</h3>
        <p className="text-lg mb-6 opacity-90">
          Join hundreds of satisfied members who have transformed their lives with Sweat with Scott.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/register"
            className="bg-white text-red-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
          >
            Start Your Journey
          </a>
          <a
            href="tel:2898925430"
            className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-red-600 transition-colors"
          >
            Call (289) 892-5430
          </a>
        </div>
      </div>
    </div>
  )
}
