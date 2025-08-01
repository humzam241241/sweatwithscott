import React from "react";

interface ClassItem {
  name: string;
  day: string;
  start: number; // 24h
  end: number; // 24h
  count: number; // bookings count
}

const classColors: Record<string, string> = {
  Bootcamp: "bg-red-600 text-white",
  "Beginner Boxing": "bg-red-800 text-white",
  "Boxing Tech": "bg-blue-600 text-white",
  "Junior Jabbers": "bg-green-600 text-white",
  Sparring: "bg-orange-500 text-white",
  "Strength & Conditioning": "bg-yellow-400 text-black",
  "Open Gym": "bg-sky-400 text-white",
};

const schedule: ClassItem[] = [
  { name: "Bootcamp", day: "Monday", start: 9, end: 10, count: 10 },
  { name: "Beginner Boxing", day: "Monday", start: 10, end: 11, count: 12 },
  { name: "Boxing Tech", day: "Monday", start: 18, end: 19, count: 8 },
  { name: "Sparring", day: "Monday", start: 19, end: 20, count: 6 },
  { name: "Strength & Conditioning", day: "Monday", start: 20, end: 21, count: 5 },
  { name: "Open Gym", day: "Monday", start: 21, end: 23, count: 0 },

  { name: "Bootcamp", day: "Wednesday", start: 9, end: 10, count: 11 },
  { name: "Junior Jabbers", day: "Wednesday", start: 16, end: 17, count: 9 },
  { name: "Boxing Tech", day: "Wednesday", start: 18, end: 19, count: 12 },
  { name: "Open Gym", day: "Wednesday", start: 20, end: 22, count: 4 },

  { name: "Beginner Boxing", day: "Friday", start: 9, end: 10, count: 14 },
  { name: "Sparring", day: "Friday", start: 18, end: 19, count: 10 },
  { name: "Strength & Conditioning", day: "Friday", start: 19, end: 20, count: 7 },
  { name: "Open Gym", day: "Friday", start: 20, end: 22, count: 3 },
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const times = Array.from({ length: 15 }, (_, i) => 9 + i); // 9AM to 11PM
const MAX_CAPACITY = 30;

function hourLabel(h: number) {
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour} ${suffix}`;
}

export default function WeeklySchedule() {
  return (
    <div className="overflow-x-auto">
      <div className="grid text-sm weekly-schedule-grid">
        <div className="border-b" />
        {days.map((d) => (
          <div key={d} className="border-b text-center font-semibold py-2">
            {d}
          </div>
        ))}

        {times.map((t) => (
          <React.Fragment key={t}>
            <div className="border-r border-b flex items-center justify-end pr-2 text-xs">
              {hourLabel(t)}
            </div>
            {days.map((d) => (
              <div key={`${d}-${t}`} className="border-b border-r relative" />
            ))}
          </React.Fragment>
        ))}

          {schedule.map((cls, idx) => {
            const dayIndex = days.indexOf(cls.day);
            const rowStart = cls.start - 9 + 2; // +1 for header row, +1 because grid rows start at 1
            const rowEnd = cls.end - 9 + 2;
            const color = classColors[cls.name] || "bg-gray-300";
            const remaining = Math.max(MAX_CAPACITY - cls.count, 0);
            return (
              <div
                key={idx}
                className={`${color} p-1 text-center text-xs flex items-center justify-center rounded shadow-sm transition-transform duration-200 hover:shadow-md hover:scale-105`}
                style={{ gridColumn: dayIndex + 2, gridRow: `${rowStart} / ${rowEnd}` }}
              >
                {cls.name} ({remaining > 0 ? `${remaining} spots left` : "Full"})
              </div>
            );
          })}
      </div>
    </div>
  );
}

