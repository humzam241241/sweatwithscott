"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

interface User {
  id: number
  username: string
  isAdmin: boolean
  fullName: string
}

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (error) {
      console.error("Error checking auth status:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/classes", label: "Classes" },
    { href: "/coaches", label: "Coaches" },
    { href: "/schedule", label: "Schedule" },
    { href: "/membership", label: "Membership" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ]

  return (
    <nav className="bg-black border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and Links */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center">
              <img src="/images/cave-logo.png" alt="The Cave Boxing Logo" className="h-10 w-10 mr-2" />
              <span className="text-xl font-bold text-red-600">The Cave Boxing</span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-300 hover:text-red-500 px-3 py-2 text-sm font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4 ml-auto">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  href={user.isAdmin ? "/admin" : "/dashboard"}
                  className="text-gray-300 hover:text-red-500 px-3 py-2 text-sm font-medium"
                >
                  {user.isAdmin ? "Admin Panel" : "Dashboard"}
                </Link>
                <span className="text-gray-400 text-sm">Welcome, {user.fullName}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-300 border-gray-600 hover:bg-red-600 hover:text-white hover:border-red-600 bg-transparent"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2">SIGN IN</Button>
              </Link>
            )}
          </div>



          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-red-500 focus:outline-none focus:text-red-500"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-900">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-red-500 block px-3 py-2 text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <div className="border-t border-gray-700 pt-4 mt-4">
                <Link
                  href={user.isAdmin ? "/admin" : "/dashboard"}
                  className="text-gray-300 hover:text-red-500 block px-3 py-2 text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {user.isAdmin ? "Admin Panel" : "Dashboard"}
                </Link>
                <div className="px-3 py-2">
                  <p className="text-gray-400 text-sm">Welcome, {user.fullName}</p>
                </div>
                <button
                  onClick={() => {
                    handleLogout()
                    setIsOpen(false)
                  }}
                  className="text-gray-300 hover:text-red-500 block px-3 py-2 text-base font-medium w-full text-left"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="border-t border-gray-700 pt-4 mt-4">
                <Link
                  href="/login"
                  className="bg-red-600 hover:bg-red-700 text-white block px-3 py-2 text-base font-medium text-center rounded-md mx-3"
                  onClick={() => setIsOpen(false)}
                >
                  SIGN IN
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
