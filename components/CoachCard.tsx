"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { CoachRecord } from "@/lib/database";

export default function CoachCard({ coach }: { coach: CoachRecord }) {
  const imageSrc =
    coach.image && coach.image !== "/images/logo.png"
      ? coach.image
      : "/images/coach-humza.png";

  return (
    <Link href={`/coaches/${coach.slug}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="rounded-xl bg-white p-6 text-center shadow-lg transition-transform duration-300"
      >
        <img
          src={imageSrc}
          alt={coach.name}
          className="mx-auto mb-4 h-32 w-32 rounded-full object-cover border-4 border-brand-accent"
        />
        <h3 className="text-xl font-semibold text-brand">{coach.name}</h3>
        {typeof coach.bio === "string" && (
          <p className="mt-2 text-sm text-brand-dark/70">
            {coach.bio.length > 100
              ? coach.bio.substring(0, 100) + "..."
              : coach.bio}
          </p>
        )}
      </motion.div>
    </Link>
  );
}
