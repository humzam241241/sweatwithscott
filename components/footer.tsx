"use client";

import Link from "next/link";
import { Facebook, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-brand-dark py-12 text-brand-light">
      <div className="mx-auto flex max-w-7xl flex-col items-center space-y-4 px-4 text-center">
        <p>123 Fight St, Hamilton, ON</p>
        <p>
          <a href="tel:2898925430" className="hover:text-brand-accent">
            (289) 892-5430
          </a>{" "}
          |{' '}
          <a href="mailto:info@caveboxing.com" className="hover:text-brand-accent">
            info@caveboxing.com
          </a>
        </p>
        <div className="flex space-x-4">
          <Link
            href="https://facebook.com"
            target="_blank"
            className="hover:text-brand-accent"
          >
            <Facebook className="h-5 w-5" />
          </Link>
          <Link
            href="https://instagram.com"
            target="_blank"
            className="hover:text-brand-accent"
          >
            <Instagram className="h-5 w-5" />
          </Link>
        </div>
        <p className="text-sm">&copy; 2025 The Cave Boxing Gym. All rights reserved.</p>
      </div>
    </footer>
  );
}
