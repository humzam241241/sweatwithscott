"use client";

import { useEffect, useState } from "react";

interface MediaItem {
  id?: number;
  src: string;
  type: "image" | "video";
}

export default function MediaGallery() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [lightbox, setLightbox] = useState<{
    item: MediaItem;
    closing: boolean;
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/media");
        if (res.ok) {
          setItems(await res.json());
          setLoaded(true);
        }
      } catch (err) {
        console.error("Failed to load media", err);
      }
    };
    load();
  }, []);

  return (
    <div>
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 transition-opacity duration-700 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      >
        {items.map((item, idx) => (
          <div
            key={idx}
            className="relative cursor-pointer group overflow-hidden"
            onClick={() => setLightbox({ item, closing: false })}
          >
            {item.type === "image" ? (
              <img
                src={item.src}
                alt=""
                className="w-full h-48 object-cover rounded transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <video
                src={item.src}
                className="w-full h-48 object-cover rounded transition-transform duration-300 group-hover:scale-105"
                muted
                loop
              />
            )}
          </div>
        ))}
      </div>
      {lightbox && (
        <div
          className={`fixed inset-0 bg-black/90 flex items-center justify-center z-50 transition-opacity duration-300 ${
            lightbox.closing ? "opacity-0" : "opacity-100"
          }`}
          onClick={() => setLightbox({ item: lightbox.item, closing: true })}
          onTransitionEnd={() => {
            if (lightbox.closing) setLightbox(null);
          }}
        >
          {lightbox.item.type === "image" ? (
            <img
              src={lightbox.item.src}
              alt=""
              className="max-w-full max-h-full"
            />
          ) : (
            <video
              src={lightbox.item.src}
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

