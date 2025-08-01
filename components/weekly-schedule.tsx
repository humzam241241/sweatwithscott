"use client";

import Link from "next/link";
import useSWR from "swr";
import { useState } from "react";

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
  const fetcher = (url: string) => fetch(url).then((r) => r.json());
  const { data: schedule } = useSWR<Record<string, ClassItem[]>>(
    "/api/schedule",
    fetcher,
    {
      revalidateOnFocus: true,
    }
  );
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

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
              {(schedule?.[day] || [])
                .slice()
                .sort(
                  (a, b) =>
                    new Date(`1970-01-01 ${a.time}`).getTime() -
                    new Date(`1970-01-01 ${b.time}`).getTime()
                )
                .map((c) => (
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
