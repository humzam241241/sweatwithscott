"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { ClassRecord } from "@/lib/types";

export default function ClassCard({ cls }: { cls: ClassRecord }) {
  const imageSrc =
    cls.image && cls.image !== "/images/logo.png"
      ? cls.image
      : "/images/boxing-training.png";

  const description =
    typeof cls.description === "string" && cls.description.trim().length > 0
      ? cls.description
      : "Technical boxing skills and drills to improve form, footwork, and timing.";

  const slug = cls.slug || "unknown-class";

  return (
    <Link href={`/classes/${slug}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="overflow-hidden rounded-xl bg-white shadow-lg transition-transform duration-300"
      >
        <img src={imageSrc} alt={cls.name} className="h-48 w-full object-cover" />
        <div className="p-6">
          <h3 className="text-xl font-semibold text-brand">{cls.name}</h3>
          <p className="mt-2 text-sm text-brand-dark/70">
            {description.length > 100 ? description.substring(0, 100) + "..." : description}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}
