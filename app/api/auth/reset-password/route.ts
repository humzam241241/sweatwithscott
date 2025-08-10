import { NextResponse } from "next/server"
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

export async function POST(request: Request) {
  try {
    const { email, password, confirmPassword } = await request.json()

    const errors = validatePassword(password)
    if (password !== confirmPassword) errors.push("Passwords do not match")
    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 })
    }

    const user = dbOperations.getUserByUsername(email)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const hashed = await bcrypt.hash(password, 10)
    dbOperations.updateUser(user.id, { password: hashed })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Password reset failed" }, { status: 500 })
  }
}

