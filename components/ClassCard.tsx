"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface Class {
  slug: string;
  name: string;
  description?: string;
  image?: string;
}

export default function ClassCard({ cls }: { cls: Class }) {
  return (
    <Link href={`/classes/${cls.slug}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className="overflow-hidden rounded-xl bg-white shadow transition-shadow hover:shadow-lg"
      >
        <img
          src={cls.image || "/images/default.png"}
          alt={cls.name}
          className="h-48 w-full object-cover"
        />
        <div className="p-6">
          <h3 className="text-xl font-semibold">{cls.name}</h3>
          {cls.description && (
            <p className="mt-2 text-sm text-gray-600">
              {cls.description.length > 100
                ? cls.description.substring(0, 100) + "..."
                : cls.description}
            </p>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
