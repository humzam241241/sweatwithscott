import React from "react";

interface ScheduleItem {
  time: string;
  title: string;
  spots: number;
  type: "beginner-boxing" | "sparring" | "strength-conditioning" | "open-gym";
}

const schedule: ScheduleItem[] = [
  { time: "10 AM", title: "Beginner Boxing", spots: 16, type: "beginner-boxing" },
  { time: "5 PM", title: "Sparring", spots: 20, type: "sparring" },
  { time: "6 PM", title: "Strength & Conditioning", spots: 23, type: "strength-conditioning" },
  { time: "7 PM", title: "Open Gym", spots: 27, type: "open-gym" },
];

export default function WeeklySchedule() {
  return (
    <div className="schedule">
      {schedule.map((item, idx) => (
        <div className="time-slot" key={idx}>
          <div className="time">{item.time}</div>
          <div className={`event ${item.type}`}>
            {item.title} ({item.spots} spots left)
          </div>
        </div>
      ))}
    </div>
  );
}

