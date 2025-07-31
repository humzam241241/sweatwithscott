import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { dbOperations } from "@/lib/database"
import bcrypt from "bcryptjs"

function validatePassword(pw: string) {
  const errors: string[] = []
  if (pw.length < 8) errors.push("Password must be at least 8 characters long")
  if (!/[A-Z]/.test(pw)) errors.push("Password must contain at least one uppercase letter")
  if (!/[a-z]/.test(pw)) errors.push("Password must contain at least one lowercase letter")
  if (!/[0-9]/.test(pw)) errors.push("Password must contain at least one number")
  if (!/[!@#$%^&*(),.?\":{}|<>]/.test(pw))
    errors.push("Password must contain at least one special character")
  return errors
}

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, password, confirmPassword } = await request.json()
    const username = email

    // Check if user already exists
    const existingUser = dbOperations.getUserByUsername(username)
    if (existingUser) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 })
    }

    const errors = validatePassword(password)
    if (password !== confirmPassword) errors.push("Passwords do not match")
    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 })
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
