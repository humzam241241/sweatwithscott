"use client";
import MediaManager from "@/components/media-manager";

export default function ManageMediaPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="mb-6 text-2xl font-semibold">Manage Media</h1>
      <div className="rounded-lg bg-gray-900 border border-gray-700 p-4">
        <MediaManager />
      </div>
    </div>
  );
}


