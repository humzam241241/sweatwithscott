export const dynamic = 'force-dynamic';
import ClassInstanceForm from "./ClassInstanceForm";
import type { ClassRecord } from "@/lib/types";

export default async function Page() {
  let classes: ClassRecord[] = [];
  try {
    const res = await fetch(`/api/classes`, { cache: "no-store" });
    classes = (await res.json()) as ClassRecord[];
  } catch {
    classes = [];
  }
  return <ClassInstanceForm classes={classes} />;
}
