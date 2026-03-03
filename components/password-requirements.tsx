"use client"

import { Check, X } from "lucide-react"

interface Props {
  password: string
  confirmPassword?: string
}

export default function PasswordRequirements({ password, confirmPassword }: Props) {
  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password),
    match: confirmPassword !== undefined ? confirmPassword === password && password !== "" : true,
  }

  const rules = [
    { label: "Minimum 8 characters", valid: checks.length },
    { label: "At least 1 uppercase letter", valid: checks.upper },
    { label: "At least 1 lowercase letter", valid: checks.lower },
    { label: "At least 1 number", valid: checks.number },
    { label: "At least 1 special character (!@#$%^&*)", valid: checks.special },
  ]

  if (confirmPassword !== undefined) {
    rules.push({ label: "Passwords match", valid: checks.match })
  }

  return (
    <ul className="space-y-1 text-sm">
      {rules.map((rule) => (
        <li
          key={rule.label}
          className={`flex items-center ${rule.valid ? "text-green-600" : "text-red-600"}`}
        >
          {rule.valid ? <Check className="mr-2 h-4 w-4" /> : <X className="mr-2 h-4 w-4" />}
          {rule.label}
        </li>
      ))}
    </ul>
  )
}

