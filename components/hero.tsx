"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface HeroProps {
  heroType: "video" | "image" | null;
  heroSrc: string;
}

export default function Hero({ heroType, heroSrc }: HeroProps) {
  const bgRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
    const handleScroll = () => {
      if (bgRef.current) {
        const offset = window.scrollY * 0.4;
        bgRef.current.style.transform = `translateY(${offset}px)`;
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      <div ref={bgRef} className="absolute inset-0 will-change-transform">
        {heroType === "video" ? (
          <video
            src={heroSrc}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
        ) : heroType === "image" ? (
          <img src={heroSrc} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/40" />
      <div
        className={`relative z-10 text-center px-4 transition-all duration-1000 ease-out ${
          loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white">
          Welcome to The Cave Boxing
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-white">
          Train Hard. Fight Smart. Become Unstoppable.
        </p>
        <Link
          href="#classes"
          className="inline-block bg-brand text-white px-6 py-3 rounded transition-transform duration-300 ease-out hover:bg-brand-dark hover:scale-105 hover:shadow-[0_0_15px_rgba(201,0,21,0.5)]"
        >
          Explore Classes
        </Link>
      </div>
    </section>
  );
}
