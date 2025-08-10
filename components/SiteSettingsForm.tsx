"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Settings = Record<string, string>;

export default function SiteSettingsForm() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/settings", { cache: "no-store" });
        if (res.ok) setSettings(await res.json());
      } catch (e) {}
      setLoading(false);
    })();
  }, []);

  const update = (key: string, value: string) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        toast.success("Settings saved");
      } else {
        toast.error("Failed to save settings");
      }
    } catch (e) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-gray-400">Loading settings…</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Hero Title</label>
          <Input
            value={settings.hero_title ?? ""}
            onChange={(e) => update("hero_title", e.target.value)}
            className="bg-gray-800 text-white"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Hero Subtitle</label>
          <Input
            value={settings.hero_subtitle ?? ""}
            onChange={(e) => update("hero_subtitle", e.target.value)}
            className="bg-gray-800 text-white"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Hero Background Image URL</label>
          <Input
            value={settings.hero_bg ?? ""}
            onChange={(e) => update("hero_bg", e.target.value)}
            className="bg-gray-800 text-white"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Contact Address</label>
          <Textarea
            value={settings.contact_address ?? ""}
            onChange={(e) => update("contact_address", e.target.value)}
            className="bg-gray-800 text-white"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Contact Phone</label>
          <Input
            value={settings.contact_phone ?? ""}
            onChange={(e) => update("contact_phone", e.target.value)}
            className="bg-gray-800 text-white"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Contact Email</label>
          <Input
            value={settings.contact_email ?? ""}
            onChange={(e) => update("contact_email", e.target.value)}
            className="bg-gray-800 text-white"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={save} disabled={saving} className="bg-red-600 hover:bg-red-700">
          {saving ? "Saving…" : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}


