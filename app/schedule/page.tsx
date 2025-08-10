export const dynamic = 'force-dynamic';

import { headers } from "next/headers";

interface ClassSchedule {
  id: number;
  name: string;
  description?: string;
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
  instructor?: string;
  max_capacity?: number;
  price?: number;
}

async function getSchedule(): Promise<ClassSchedule[]> {
  try {
    const h = headers();
    const proto = h.get("x-forwarded-proto") ?? "http";
    const host = h.get("host") ?? "";
    const base = host ? `${proto}://${host}` : "";
    const res = await fetch(`${base}/api/classes`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return [];
  }
}

export default async function SchedulePage() {
  const schedule = await getSchedule();

  const groupedByDay = schedule.reduce((acc: Record<string, ClassSchedule[]>, cls) => {
    const day = cls.day_of_week || "Unknown";
    if (!acc[day]) acc[day] = [];
    acc[day].push(cls);
    return acc;
  }, {});

  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="min-h-screen bg-white">
      <header className="cave-hero py-20 text-center">
        <h1 className="text-5xl font-black mb-6">Class Schedule</h1>
        <p className="text-xl">Find the perfect time to train with us.</p>
      </header>

      <section className="py-16 px-6 max-w-7xl mx-auto">
        {schedule.length > 0 ? (
          <div className="space-y-8">
            {dayOrder.map((day) => {
              const dayClasses = groupedByDay[day];
              if (!dayClasses || dayClasses.length === 0) return null;

              return (
                <div key={day} className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-4 text-brand">{day}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dayClasses
                      .sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""))
                      .map((cls) => (
                        <div key={cls.id} className="bg-white rounded-lg shadow-md p-4">
                          <h3 className="text-lg font-semibold mb-2">{cls.name}</h3>
                          {cls.description && (
                            <p className="text-gray-600 mb-3 text-sm">{cls.description}</p>
                          )}
                          <div className="space-y-1 text-sm">
                            {cls.start_time && cls.end_time && (
                              <p><strong>Time:</strong> {cls.start_time} - {cls.end_time}</p>
                            )}
                            {cls.instructor && <p><strong>Coach:</strong> {cls.instructor}</p>}
                            {cls.max_capacity && <p><strong>Capacity:</strong> {cls.max_capacity} spots</p>}
                            {cls.price && <p><strong>Price:</strong> ${cls.price}</p>}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No classes scheduled at this time.</p>
            <p className="text-gray-400 mt-2">Check back soon for updates!</p>
          </div>
        )}
      </section>
    </div>
  );
}