import type { CoachRecord } from "./types";

export function filterUniqueCoaches<T extends Partial<CoachRecord>>(coaches: T[] | any[] = []): T[] {
  if (!Array.isArray(coaches)) return [];

  const unique: T[] = [];
  const seen = new Set<string>();
  let placeholderAdded = false;

  for (const coach of coaches) {
    if (!coach || typeof coach !== "object") continue;

    const slug = typeof coach.slug === "string" ? coach.slug.toLowerCase() : "";
    const name = typeof coach.name === "string" ? coach.name.toLowerCase() : "";
    const key = slug || name;
    if (!key || seen.has(key)) continue;

    const img = typeof coach.image === "string" ? coach.image : "";
    const isPlaceholder = img.includes("/images/logo.png");
    if (isPlaceholder) {
      if (placeholderAdded) continue;
      placeholderAdded = true;
    }

    seen.add(key);
    unique.push(coach);
  }

  return unique;
}
