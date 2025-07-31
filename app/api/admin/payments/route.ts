import { NextResponse } from "next/server"

// Mock data - in production, fetch from database
const payments = [
  { id: 1, username: "john", amount: 150, date: "2024-01-15", type: "monthly-pass", status: "completed" },
  { id: 2, username: "jane", amount: 25, date: "2024-01-20", type: "single-class", status: "completed" },
  { id: 3, username: "mike", amount: 1500, date: "2024-01-10", type: "annual-membership", status: "completed" },
  { id: 4, username: "john", amount: 25, date: "2024-01-25", type: "single-class", status: "pending" },
]

export async function GET() {
  return NextResponse.json(payments)
}
