"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

interface MediaItem {
  id?: number;
  src: string;
  type: "image" | "video";
}

export default function MediaManager() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);

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

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    const res = await fetch("/api/media", { method: "POST", body: formData });
    setUploading(false);
    if (res.ok) {
      await load();
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    await fetch(`/api/media?id=${id}`, { method: "DELETE" });
    await load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          type="file"
          accept="image/jpeg,image/png,video/mp4,video/webm"
          onChange={handleUpload}
          disabled={uploading}
        />
        {uploading && <span className="text-sm">Uploading...</span>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id || item.src} className="relative">
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
                controls
              />
            )}
            {item.id && (
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={() => handleDelete(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

