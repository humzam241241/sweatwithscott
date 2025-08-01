"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ClassItem {
  id: number;
  day: string;
  name: string;
  time: string;
  spots: number;
  coach?: string;
  color?: string;
}

interface TooltipData {
  x: number;
  y: number;
  item: ClassItem;
}

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function WeeklySchedule() {
  const [schedule, setSchedule] = useState<Record<string, ClassItem[]>>({});
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  useEffect(() => {
    const loadSchedule = async () => {
      const resp = await fetch("/api/schedule");
      if (resp.ok) {
        const data: ClassItem[] = await resp.json();
        const grouped: Record<string, ClassItem[]> = {};
        data.forEach((c) => {
          if (!grouped[c.day]) grouped[c.day] = [];
          grouped[c.day].push(c);
        });
        // sort classes in each day by time
        Object.keys(grouped).forEach((d) => {
          grouped[d].sort(
            (a, b) =>
              new Date(`1970-01-01 ${a.time}`).getTime() -
              new Date(`1970-01-01 ${b.time}`).getTime()
          );
        });
        setSchedule(grouped);
      }
    };
    loadSchedule();
  }, []);

  const showTooltip = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    item: ClassItem
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      x: rect.left + rect.width / 2,
      y: rect.top + window.scrollY - 10,
      item,
    });
  };

  const hideTooltip = () => setTooltip(null);

  return (
    <div className="schedule relative overflow-x-auto">
      <div className="min-w-[700px] grid grid-cols-7 gap-4">
        {days.map((day) => (
          <div key={day}>
            <h3 className="text-center font-semibold mb-2">{day}</h3>
            <div className="flex flex-col gap-2">
              {(schedule[day] || []).map((c) => (
                <Link
                  key={c.id}
                  href="/register"
                  className="event flex flex-col rounded-lg"
                  style={{ backgroundColor: c.color || "#c90015" }}
                  onMouseEnter={(e) => showTooltip(e, c)}
                  onMouseLeave={hideTooltip}
                >
                  <span className="font-semibold">{c.time}</span>
                  <span>{c.name}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      {tooltip && (
        <div
          className="tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            display: "block",
            position: "fixed",
          }}
        >
          <div className="font-semibold">{tooltip.item.name}</div>
          <div>{tooltip.item.time}</div>
          <div>{tooltip.item.spots} spots left</div>
          {tooltip.item.coach && <div>Coach: {tooltip.item.coach}</div>}
        </div>
      )}
    </div>
  );
}
