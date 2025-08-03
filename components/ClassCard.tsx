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
  const imageSrc =
    cls.image && cls.image !== "/images/logo.png"
      ? cls.image
      : "/images/boxing-training.png";

  return (
    <Link href={`/classes/${cls.slug}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="overflow-hidden rounded-xl bg-white shadow-lg transition-transform duration-300"
      >
        <img src={imageSrc} alt={cls.name} className="h-48 w-full object-cover" />
        <div className="p-6">
          <h3 className="text-xl font-semibold text-brand">{cls.name}</h3>
          {cls.description && (
            <p className="mt-2 text-sm text-brand-dark/70">
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
