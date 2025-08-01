"use client";

import { useState } from "react";
import Link from "next/link";

interface ClassItem {
  name: string;
  time: string;
  spots: number;
  coach?: string;
  color?: string;
}

const weeklySchedule: Record<string, ClassItem[]> = {
  Monday: [
    { name: "Beginner Boxing", time: "6:00 AM", spots: 10, coach: "Kyle McLaughlin", color: "#c90015" },
    { name: "Open Gym", time: "5:00 PM", spots: 20, color: "#555" }
  ],
  Tuesday: [
    { name: "Strength & Conditioning", time: "6:00 AM", spots: 15, coach: "Humza Muhammad", color: "#f57c00" },
    { name: "Sparring", time: "7:00 PM", spots: 12, coach: "Scott McDonald", color: "#8b1e1e" }
  ],
  Wednesday: [
    { name: "Open Gym", time: "6:00 AM", spots: 20, color: "#555" },
    { name: "Boxing", time: "6:00 PM", spots: 18, coach: "Kyle McLaughlin", color: "#c90015" }
  ],
  Thursday: [
    { name: "Strength & Conditioning", time: "6:00 AM", spots: 15, coach: "Humza Muhammad", color: "#f57c00" },
    { name: "Beginner Boxing", time: "7:00 PM", spots: 16, coach: "Kyle McLaughlin", color: "#c90015" }
  ],
  Friday: [
    { name: "Open Gym", time: "6:00 AM", spots: 20, color: "#555" },
    { name: "Sparring", time: "5:00 PM", spots: 12, coach: "Scott McDonald", color: "#8b1e1e" }
  ],
  Saturday: [
    { name: "Junior Jabbers", time: "10:00 AM", spots: 20, coach: "Kyle McLaughlin", color: "#29b6f6" }
  ],
  Sunday: []
};

interface TooltipData {
  x: number;
  y: number;
  item: ClassItem;
}

export default function WeeklySchedule() {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)

  const showTooltip = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    item: ClassItem
  ) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltip({
      x: rect.left + rect.width / 2,
      y: rect.top + window.scrollY - 10,
      item,
    })
  }

  const hideTooltip = () => setTooltip(null)

  return (
    <div className="schedule relative overflow-x-auto">
      <div className="min-w-[700px] grid grid-cols-7 gap-4">
        {Object.entries(weeklySchedule).map(([day, classes]) => (
          <div key={day}>
            <h3 className="text-center font-semibold mb-2">{day}</h3>
            <div className="flex flex-col gap-2">
              {classes.map((c, i) => (
                <Link
                  key={i}
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
  )
}

