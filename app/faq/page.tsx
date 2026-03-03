import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <header className="bg-gradient-to-r from-red-600 to-red-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Frequently Asked Questions</h1>
          <p className="text-xl">Get answers to common questions about Sweat with Scott.</p>
        </div>
      </header>

      {/* FAQ Content */}
      <section className="max-w-4xl mx-auto py-16 px-4">
        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-left">What are your opening hours?</AccordionTrigger>
            <AccordionContent>
              We are open Monday to Friday from 6 AM to 9 PM, Saturday from 8 AM to 5 PM, and closed on Sundays.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="text-left">Do I need to bring my own gear?</AccordionTrigger>
            <AccordionContent>
              We provide gloves and basic equipment, but bringing your own gear is recommended for hygiene and comfort.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger className="text-left">Do you offer beginner classes?</AccordionTrigger>
            <AccordionContent>
              Yes, we have beginner-friendly classes designed for those new to boxing. Our Beginner Boxing classes are
              perfect for learning the fundamentals in a supportive environment.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger className="text-left">How much do classes cost?</AccordionTrigger>
            <AccordionContent>
              Drop-in classes are $15 each. We also offer monthly unlimited passes for $90, and our Junior Jabbers
              program is $85 for a 4-week session. Annual memberships provide the best value at $1500.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger className="text-left">What age groups do you accommodate?</AccordionTrigger>
            <AccordionContent>
              We offer classes for all ages! Our Junior Jabbers program is for ages 8-16, and our adult classes welcome
              everyone 17 and up. We have programs suitable for teens, adults, and seniors.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger className="text-left">Do you offer personal training?</AccordionTrigger>
            <AccordionContent>
              Yes! All our coaches offer personal training sessions for those who want one-on-one instruction. This is
              great for beginners who want extra attention or experienced boxers preparing for competition.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7">
            <AccordionTrigger className="text-left">Can I try a class before committing?</AccordionTrigger>
            <AccordionContent>
              Definitely! We encourage first-time visitors to try a drop-in class for $15. This gives you a chance to
              experience our training style and meet our coaches before deciding on a membership.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-8">
            <AccordionTrigger className="text-left">What makes Sweat with Scott different from other gyms?</AccordionTrigger>
            <AccordionContent>
              We focus on building a supportive community where everyone feels welcome. Our coaches have extensive
              competitive and coaching experience, and we emphasize proper technique, safety, and personal growth
              alongside physical fitness.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-9">
            <AccordionTrigger className="text-left">Do you have shower and changing facilities?</AccordionTrigger>
            <AccordionContent>
              Yes! We have clean, modern changing rooms with lockers and shower facilities. Towels are available for
              rent, or you can bring your own.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-10">
            <AccordionTrigger className="text-left">How do I book classes?</AccordionTrigger>
            <AccordionContent>
              You can book classes through our online system after creating an account, call us directly, or drop in
              during class times. We recommend booking in advance as popular classes can fill up quickly.
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">Still have questions?</p>
          <Link href="/contact">
            <Button size="lg" className="bg-red-600 hover:bg-red-700">
              Contact Us
            </Button>
          </Link>
        </div>
      </section>

      </div>
    )
  }
