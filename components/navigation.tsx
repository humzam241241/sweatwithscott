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

  useEffect(() => {
    checkAuthStatus();
    // Check for logo image
    fetch("/images/logo.png").then((res) => {
      if (res.ok) setLogoExists(true);
    });
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
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const baseLinks: NavLink[] = [
    { href: "/", label: "Home" },
    { href: "/classes", label: "Classes", sectionId: "classes" },
    { href: "/coaches", label: "Coaches", sectionId: "coaches" },
    { href: "/schedule", label: "Schedule", sectionId: "schedule" },
    { href: "/membership", label: "Membership", sectionId: "membership" },
    { href: "/about", label: "About", sectionId: "about" },
    { href: "/contact", label: "Contact", sectionId: "contact" },
  ];

  const navLinks =
    user && !user.isAdmin
      ? [...baseLinks, { href: "/dashboard", label: "Dashboard" }]
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
    <>
      <button
        className="fixed top-4 left-4 z-50 text-white md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
      <nav
        className={`fixed left-0 top-0 h-screen w-56 bg-black text-white flex flex-col z-40 transition-transform duration-300 transform ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="p-4 font-bold text-red-600 flex items-center space-x-2">
          {logoExists && (
            <Link href="/">
              <Image
                src="/images/logo.png"
                alt="Sweat with Scott logo"
                width={32}
                height={32}
              />
            </Link>
          )}
          <Link href="/">Sweat with Scott</Link>
        </div>
        <ul className="flex-1 space-y-2 px-2 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = active === link.sectionId || active === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link)}
                  className={`block px-3 py-2 rounded hover:text-red-500 ${isActive ? "text-red-500 font-bold" : "text-gray-300"}`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
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
      </nav>
    </>
  );
}

