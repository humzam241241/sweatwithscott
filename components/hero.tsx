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
      <div className="absolute inset-0 bg-black/40" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white"
      >
        <h1 className="text-4xl font-bold md:text-6xl">
          Train Like a Champion
        </h1>
        <p className="mt-4 max-w-2xl text-lg md:text-2xl">
          Join our elite boxing community today.
        </p>
        <Link
          href="/membership"
          className="mt-8 rounded bg-white/90 px-8 py-3 font-medium text-black hover:bg-white"
        >
          Join Now
        </Link>
      </motion.div>
    </section>
  );
}
