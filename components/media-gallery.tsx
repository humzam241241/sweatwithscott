"use client";

import { useEffect, useState } from "react";

interface MediaItem {
  id?: number;
  src: string;
  type: "image" | "video";
}

export default function MediaGallery() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [active, setActive] = useState<MediaItem | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/media");
        if (res.ok) {
          setItems(await res.json());
        }
      } catch (err) {
        console.error("Failed to load media", err);
      }
    };
    load();
  }, []);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="relative cursor-pointer group"
            onClick={() => setActive(item)}
          >
            {item.type === "image" ? (
              <img
                src={item.src}
                alt=""
                className="w-full h-48 object-cover rounded"
              />
            ) : (
              <video
                src={item.src}
                className="w-full h-48 object-cover rounded"
                muted
                loop
              />
            )}
          </div>
        ))}
      </div>
      {active && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={() => setActive(null)}
        >
          {active.type === "image" ? (
            <img src={active.src} alt="" className="max-w-full max-h-full" />
          ) : (
            <video
              src={active.src}
              controls
              autoPlay
              className="max-w-full max-h-full"
            />
          )}
        </div>
      )}
    </div>
  );
}

