import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, subject, message, interestedIn } = await request.json()

    // In production, you would:
    // 1. Save to database
    // 2. Send email notification
    // 3. Integrate with CRM system
    // 4. Send auto-reply email

    console.log("Contact form submission:", {
      name,
      email,
      phone,
      subject,
      message,
      interestedIn,
      timestamp: new Date().toISOString(),
    })

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({
      message: "Thank you for your message! We'll get back to you within 24 hours.",
      success: true,
    })
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
    console.error("Contact form error:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
