import { NextRequest, NextResponse } from "next/server"
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const idParam = searchParams.get("user_id")
  if (!idParam) return NextResponse.json({ error: "Missing user_id" }, { status: 400 })
  const user = dbOperations.getUserById(Number(idParam))
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
  return NextResponse.json({
    id: user.id,
    fullName: user.full_name,
    email: user.username,
    membershipType: user.membership_type,
    membershipStatus: user.membership_status,
    membershipExpiry: user.membership_expiry,
  })
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { userId, fullName, email, password } = body
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 })

  const data: any = {}
  if (fullName !== undefined) data.full_name = fullName
  if (email !== undefined) data.username = email
  if (password) {
    const errors = validatePassword(password)
    if (errors.length) return NextResponse.json({ errors }, { status: 400 })
    data.password = await bcrypt.hash(password, 10)
  }

  try {
    dbOperations.updateUser(userId, data)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}
