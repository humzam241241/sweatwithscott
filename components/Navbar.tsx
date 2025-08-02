"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/classes", label: "Classes" },
  { href: "/coaches", label: "Coaches" },
  { href: "/media", label: "Media" },
  { href: "/schedule", label: "Schedule" },
  { href: "/membership", label: "Membership" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 z-50 w-full transition-colors duration-300 ${
        scrolled ? "bg-brand-dark shadow-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold text-white">
          Cave Boxing
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center space-x-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white transition-colors hover:text-brand-accent"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center space-x-4">
            <Link
              href="/signin"
              className="rounded-lg border border-brand px-4 py-2 text-sm font-medium text-brand transition-colors hover:bg-brand hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden">
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <button
                aria-label="Open menu"
                className="text-white transition-colors hover:text-brand-accent"
              >
                <Menu className="h-6 w-6" />
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
              <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-64 flex-col bg-brand-dark p-6 text-white shadow-lg focus:outline-none">
                <div className="mb-4 flex justify-end">
                  <Dialog.Close asChild>
                    <button aria-label="Close menu" className="text-white">
                      <X className="h-6 w-6" />
                    </button>
                  </Dialog.Close>
                </div>
                <nav className="flex flex-col space-y-4">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-sm font-medium transition-colors hover:text-brand-accent"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-6 flex flex-col space-y-3">
                  <Link
                    href="/signin"
                    className="rounded-lg border border-brand px-4 py-2 text-center text-sm font-medium text-brand transition-colors hover:bg-brand hover:text-white"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-lg bg-brand px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-brand-dark"
                  >
                    Sign Up
                  </Link>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </nav>
  );
}
