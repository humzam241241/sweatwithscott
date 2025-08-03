"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Star } from "lucide-react"
import Link from "next/link"

export interface MembershipPlan {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  popular?: boolean
  buttonText: string
  buttonLink: string
}

const membershipPlans: MembershipPlan[] = [
  {
    name: "Drop-In",
    price: "$25",
    period: "per class",
    description: "Perfect for trying us out or occasional visits",
    features: ["Access to any class", "No commitment required", "Pay as you go", "Valid for 30 days from purchase"],
    popular: false,
    buttonText: "Buy Drop-In",
    buttonLink: "/register",
  },
  {
    name: "Monthly Unlimited",
    price: "$150",
    period: "per month",
    description: "Best value for regular training",
    features: [
      "Unlimited classes",
      "All class types included",
      "Priority booking",
      "Guest pass (1 per month)",
      "Locker rental discount",
      "Nutrition consultation",
    ],
    popular: true,
    buttonText: "Start Monthly",
    buttonLink: "/register",
  },
  {
    name: "Annual Membership",
    price: "$1,500",
    period: "per year",
    description: "Maximum savings for serious athletes",
    features: [
      "Unlimited classes",
      "All class types included",
      "Priority booking",
      "4 guest passes per month",
      "Free locker rental",
      "Personal training discount (20%)",
      "Nutrition consultation",
      "Merchandise discount (15%)",
      "Free glove rental",
    ],
    popular: false,
    buttonText: "Join Annual",
    buttonLink: "/register",
  },
]

const specialPrograms = [
  {
    name: "Junior Jabbers",
    price: "$85",
    period: "4-week program",
    description: "Specialized program for kids ages 6-12",
    features: ["Age-appropriate training", "Safety-focused", "Character building", "Saturday mornings"],
    buttonText: "Enroll Child",
    buttonLink: "/kids",
  },
  {
    name: "Personal Training",
    price: "$75",
    period: "per session",
    description: "One-on-one coaching tailored to your goals",
    features: [
      "Customized workout plans",
      "Technique refinement",
      "Goal-specific training",
      "Flexible scheduling",
      "Progress tracking",
    ],
    buttonText: "Book Session",
    buttonLink: "/contact",
  },
]

export default function MembershipPackages({ packages }: { packages?: MembershipPlan[] }) {
  const plans = packages && packages.length ? packages : membershipPlans
  return (
    <div className="w-full">
      <div className="text-center mb-12">
        <h2 className="cave-section-title mb-4">Membership Packages</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Choose the membership that fits your lifestyle and goals. All memberships include access to our world-class
          facilities and expert coaching.
        </p>
      </div>

      {/* Main Membership Plans */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {plans.map((plan, index) => (
          <Card
            key={index}
            className={`relative overflow-hidden ${
              plan.popular ? "ring-2 ring-red-600 shadow-xl scale-105" : "shadow-lg"
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 left-0 right-0 bg-red-600 text-white text-center py-2">
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="font-bold text-sm">MOST POPULAR</span>
                  <Star className="h-4 w-4 fill-current" />
                </div>
              </div>
            )}

            <CardHeader className={`text-center ${plan.popular ? "pt-12" : "pt-6"}`}>
              <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-black text-red-600">{plan.price}</span>
                <span className="text-gray-600 ml-2">{plan.period}</span>
              </div>
              <p className="text-gray-600 mt-2">{plan.description}</p>
            </CardHeader>

            <CardContent className="pt-0">
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href={plan.buttonLink}>
                <Button
                  className={`w-full ${
                    plan.popular ? "bg-red-600 hover:bg-red-700" : "bg-gray-900 hover:bg-gray-800 text-white"
                  }`}
                >
                  {plan.buttonText}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Special Programs */}
      <div className="border-t pt-16">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-4">Special Programs</h3>
          <p className="text-gray-600">Specialized training options for specific needs and goals</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {specialPrograms.map((program, index) => (
            <Card key={index} className="shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-xl font-bold">{program.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-3xl font-black text-red-600">{program.price}</span>
                  <span className="text-gray-600 ml-2">{program.period}</span>
                </div>
                <p className="text-gray-600 mt-2">{program.description}</p>
              </CardHeader>

              <CardContent className="pt-0">
                <ul className="space-y-2 mb-6">
                  {program.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={program.buttonLink}>
                  <Button className="w-full bg-red-600 hover:bg-red-700">{program.buttonText}</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="mt-16 text-center bg-gray-50 rounded-lg p-8">
        <h3 className="text-xl font-bold mb-4">Questions About Membership?</h3>
        <p className="text-gray-600 mb-6">Our team is here to help you choose the perfect membership for your goals.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contact">
            <Button
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white bg-transparent"
            >
              Contact Us
            </Button>
          </Link>
          <Link href="tel:2898925430">
            <Button className="bg-red-600 hover:bg-red-700">Call (289) 892-5430</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
