import { NextResponse } from "next/server"

// Mock data - in production, fetch from database based on user session
const userPayments = [
  { id: 1, amount: 150, date: "2024-01-15", type: "Monthly Pass", status: "completed" },
  { id: 2, amount: 25, date: "2024-01-20", type: "Single Class", status: "completed" },
  { id: 3, amount: 25, date: "2024-01-25", type: "Single Class", status: "pending" },
  { id: 4, amount: 1500, date: "2024-01-01", type: "Annual Membership", status: "completed" },
  { id: 5, amount: 75, date: "2024-01-22", type: "Personal Training", status: "completed" },
]

export async function GET() {
  return NextResponse.json(userPayments)
}
