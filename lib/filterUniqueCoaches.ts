import type { CoachRecord } from "@/lib/types";

/**
 * Filters coaches so:
 * - Each real coach appears once
 * - Only ONE placeholder coach card is kept
 * - Handles null/undefined/invalid data without crashing
 */
export function filterUniqueCoaches(coachList: CoachRecord[] = []) {
  // If it's not an array, bail out with empty list
  if (!Array.isArray(coachList)) return [];

  const seenNames = new Set<string>();
  const result: CoachRecord[] = [];
  let placeholderAdded = false;

  for (const coach of coachList) {
    // Skip anything invalid
    if (!coach || typeof coach !== "object") continue;

    const nameKey = coach.name?.trim().toLowerCase() || "";
    const isPlaceholder = !!coach.image?.includes("/images/logo.png");

    // Keep one placeholder
    if (isPlaceholder && !placeholderAdded) {
      placeholderAdded = true;
      result.push(coach);
    }
    // Keep real coaches if name is unique
    else if (!isPlaceholder && !seenNames.has(nameKey)) {
      seenNames.add(nameKey);
      result.push(coach);
    }
  }

  return result;
}
