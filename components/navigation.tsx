"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface User {
  id: number;
  username: string;
  isAdmin: boolean;
  fullName: string;
}

interface NavLink {
  href: string;
  label: string;
  sectionId?: string;
}

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [active, setActive] = useState<string>(pathname);
  const [logoExists, setLogoExists] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    checkAuthStatus();

    // Check for logo image
    fetch("/images/cave-logo.png").then((res) => {
      setLogoExists(res.ok);
    });

    // Scroll listener for background fade
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (pathname === "/") {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActive(entry.target.id);
            }
          });
        },
        { rootMargin: "-50% 0px -50% 0px" }
      );

      navLinks.forEach((link) => {
        if (link.sectionId) {
          const el = document.getElementById(link.sectionId);
          if (el) observer.observe(el);
        }
      });

      return () => observer.disconnect();
    } else {
      setActive(pathname);
    }
  }, [pathname]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        cache: "no-store",
        credentials: "include",
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
      console.error("Error checking auth status:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/");
      router.refresh();
    } catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
      console.error("Error logging out:", error);
    }
  };

  const baseLinks: NavLink[] = [
    { href: "/", label: "Home" },
    { href: "/classes", label: "Classes" },
    { href: "/coaches", label: "Coaches" },
    { href: "/schedule", label: "Schedule", sectionId: "schedule" },
    { href: "/membership", label: "Membership", sectionId: "membership" },
    { href: "/about", label: "About", sectionId: "about" },
    { href: "/contact", label: "Contact", sectionId: "contact" },
  ];

  const navLinks = user
    ? [...baseLinks, { href: "/dashboard/member", label: "Dashboard" }]
    : baseLinks;

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, link: NavLink) => {
    if (pathname === "/" && link.sectionId) {
      e.preventDefault();
      document.getElementById(link.sectionId)?.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <nav
      className={`cave-navbar sticky top-0 left-0 w-full z-50 transition-colors duration-300 ${
        isScrolled ? "bg-black/90 backdrop-blur-sm shadow-lg" : "bg-black/90"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between p-3">
        
        {/* Logo + Title */}
        <div className="flex items-center space-x-4 pl-1">
          <Link href="/" className="flex items-center space-x-4">
            <Image
              src={logoExists ? "/images/cave-logo.png" : "/placeholder-logo.png"}
              alt="The Cave Boxing logo"
              width={60}
              height={60}
              className="cave-logo rounded-full"
            />
            <span className="text-white text-2xl font-bold tracking-wide">The Cave Boxing</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <ul className="flex space-x-4">
            {navLinks.map((link) => {
              const isActive = active === link.sectionId || active === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link)}
                    className={`px-3 py-2 rounded hover:text-red-500 ${
                      isActive ? "text-red-500 font-bold" : "text-gray-300"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
            {user?.isAdmin && (
              <li>
                <Link
                  href="/dashboard/admin"
                  onClick={(e) => handleLinkClick(e, { href: "/dashboard/admin", label: "Admin" })}
                  className={`px-3 py-2 rounded hover:text-red-500 ${active === "/dashboard/admin" ? "text-red-500 font-bold" : "text-gray-300"}`}
                >
                  Admin
                </Link>
              </li>
            )}
          </ul>
          {user ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-gray-300 border-gray-600 hover:bg-red-600 hover:text-white hover:border-red-600"
            >
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          ) : (
            <Link href="/login">
              <Button className="bg-red-600 hover:bg-red-700">SIGN IN</Button>
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-sm border-t border-gray-800">
          <ul className="flex flex-col space-y-2 p-4">
            {navLinks.map((link) => {
              const isActive = active === link.sectionId || active === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link)}
                    className={`block px-3 py-2 rounded hover:text-red-500 ${
                      isActive ? "text-red-500 font-bold" : "text-gray-300"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
            {user?.isAdmin && (
              <li>
                <Link
                  href="/dashboard/admin"
                  onClick={(e) => handleLinkClick(e, { href: "/dashboard/admin", label: "Admin" })}
                  className={`block px-3 py-2 rounded hover:text-red-500 ${
                    active === "/dashboard/admin" ? "text-red-500 font-bold" : "text-gray-300"
                  }`}
                >
                  Admin
                </Link>
              </li>
            )}
          </ul>
          <div className="p-4 border-t border-gray-800">
            {user ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full text-gray-300 border-gray-600 hover:bg-red-600 hover:text-white hover:border-red-600"
              >
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            ) : (
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-red-600 hover:bg-red-700">SIGN IN</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
