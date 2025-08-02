"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Link from "next/link";

interface MediaItem {
  id: number;
  fileUrl: string;
  title: string;
  category: string;
}

export default function MediaGallery() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [category, setCategory] = useState("all");

  useEffect(() => {
    fetch("/api/media")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setMedia(Array.isArray(data) ? data : []));
  }, []);

  const filtered =
    category === "all" ? media : media.filter((m) => m.category === category);

  return (
    <section id="media" className="px-4 py-24">
      <h2 className="mb-8 text-center text-3xl font-bold">Media</h2>
      <div className="mb-6 flex justify-center gap-4">
        {["all", "Training", "Events", "Community"].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`rounded-full px-4 py-2 text-sm ${
              category === cat
                ? "bg-black text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <Swiper
        modules={[Navigation]}
        navigation
        spaceBetween={16}
        slidesPerView={1}
        breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
      >
        {filtered.map((item) => (
          <SwiperSlide key={item.id}>
            <div className="overflow-hidden rounded-xl">
              <img
                src={item.fileUrl}
                alt={item.title}
                className="h-64 w-full object-cover"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="mt-8 text-center">
        <Link href="/media" className="text-brand hover:underline">
          View All Media
        </Link>
      </div>
    </section>
  );
}
