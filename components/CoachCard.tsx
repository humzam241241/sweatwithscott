"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface Coach {
  slug: string;
  name: string;
  image?: string;
  role?: string;
  bio?: string;
}

export default function CoachCard({ coach }: { coach: Coach }) {
  return (
    <Link href={`/coaches/${coach.slug}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className="rounded-xl bg-white p-6 text-center shadow transition-shadow hover:shadow-lg"
      >
        <img
          src={coach.image || "/images/default.png"}
          alt={coach.name}
          className="mx-auto mb-4 h-32 w-32 rounded-full object-cover"
        />
        <h3 className="text-xl font-semibold">{coach.name}</h3>
        {coach.role && (
          <p className="text-sm text-gray-500">{coach.role}</p>
        )}
        {coach.bio && (
          <p className="mt-2 text-sm text-gray-600">
            {coach.bio.length > 100
              ? coach.bio.substring(0, 100) + "..."
              : coach.bio}
          </p>
        )}
      </motion.div>
    </Link>
  );
}
