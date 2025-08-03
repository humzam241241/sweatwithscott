import ClassInstanceForm from "./ClassInstanceForm";
import type { ClassRecord } from "@/lib/types";

export default async function Page() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  let classes: ClassRecord[] = [];
  try {
    const res = await fetch(`${base}/api/classes`, { cache: "no-store" });
    classes = (await res.json()) as ClassRecord[];
  } catch {
    classes = [];
  }
  return <ClassInstanceForm classes={classes} />;
}
