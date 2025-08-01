"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

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
  const [user, setUser] = useState<User | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logoExists, setLogoExists] = useState(false);
  const [active, setActive] = useState<string>(pathname);

  useEffect(() => {
    checkAuthStatus();
    fetch("/images/logo.png").then((res) => {
      if (res.ok) setLogoExists(true);
    });
    const onScroll = () => setScrolled(window.scrollY > 50 || pathname !== "/");
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

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
      baseLinks.forEach((link) => {
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

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    link: NavLink
  ) => {
    if (pathname === "/" && link.sectionId) {
      e.preventDefault();
      document
        .getElementById(link.sectionId)
        ?.scrollIntoView({ behavior: "smooth" });
      setMobileOpen(false);
    } else {
      setMobileOpen(false);
    }
  };

  const linkClasses = (isActive: boolean) =>
    `relative px-3 py-2 transition-colors after:absolute after:left-0 after:bottom-0 after:h-[2px] after:bg-brand after:origin-left after:scale-x-0 hover:after:scale-x-100 after:transition-transform ${
      isActive ? "text-brand font-bold" : ""
    }`;

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${
        scrolled ? "bg-white text-black shadow" : "bg-transparent text-white"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          {logoExists && (
            <Link href="/">
              <Image
                src="/images/logo.png"
                alt="The Cave Boxing logo"
                width={32}
                height={32}
              />
            </Link>
          )}
          <Link href="/" className="font-bold">
            The Cave Boxing
          </Link>
        </div>
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => {
            const isActive = active === link.sectionId || active === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link)}
                className={linkClasses(isActive)}
              >
                {link.label}
              </Link>
            );
          })}
          {user ? (
            <button onClick={handleLogout} className="text-sm">
              Logout
            </button>
          ) : (
            <Link href="/login" className="text-sm" onClick={() => setMobileOpen(false)}>
              Sign In
            </Link>
          )}
        </div>
        <div className="md:hidden">
          <button onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden bg-black/90 backdrop-blur-sm px-4 pb-4 space-y-2">
          {navLinks.map((link) => {
            const isActive = active === link.sectionId || active === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link)}
                className={`block py-2 ${
                  isActive ? "text-brand font-bold" : "text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="border-t border-white/20 pt-2">
            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-white py-2 w-full"
              >
                <LogOut className="h-4 w-4" /> <span>Logout</span>
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-white"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
