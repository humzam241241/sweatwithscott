"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative h-screen w-full" id="home">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-brand-dark/70" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white"
      >
        <h1 className="text-4xl font-bold md:text-6xl">
          Sweat with Scott
        </h1>
        <p className="mt-4 max-w-2xl text-lg md:text-2xl">
          8-week boxing transformation plus daily coaching drills.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/online-coaching"
            className="rounded bg-brand px-8 py-3 font-medium text-white transition-colors hover:bg-brand-accent hover:text-brand-dark"
          >
            Start 8-Week Reset
          </Link>
          <Link
            href="/membership"
            className="rounded border border-white px-8 py-3 font-medium text-white transition-colors hover:bg-white hover:text-black"
          >
            View All Offers
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
