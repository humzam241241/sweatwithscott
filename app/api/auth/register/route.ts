import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { dbOperations } from "@/lib/database"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, password } = await request.json()
    const username = email

    // Check if user already exists
    const existingUser = dbOperations.getUserByUsername(username)
    if (existingUser) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 10)

    // Create new user in database
    const result = dbOperations.createUser({
      username,
      password: hashed,
      email,
      fullName,
    })
    const userId = Number(result.lastInsertRowid)
    const session = {
      userId,
      username,
      isAdmin: false,
      fullName,
    }

    const cookieStore = await cookies()
    cookieStore.set("session", JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return NextResponse.json({ success: true, redirectUrl: "/dashboard" })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
