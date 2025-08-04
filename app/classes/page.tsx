import ClassCard from "@/components/ClassCard";
import type { ClassRecord } from "@/lib/types";

async function getClasses(): Promise<ClassRecord[]> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "";
  const res = await fetch(`${base}/api/classes`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function ClassesPage() {
  const classes = await getClasses();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <h1 className="mb-8 text-center text-3xl font-bold">All Classes</h1>
      {classes.length ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <ClassCard key={cls.slug ?? cls.id} cls={cls} />
          ))}
        </div>
      ) : (
        <p className="text-center text-brand-dark/70">No classes available.</p>
      )}
    </div>
  );
}
