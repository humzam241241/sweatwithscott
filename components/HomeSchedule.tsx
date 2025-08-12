"use client";

import React, { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
const FullCalendar = dynamic(() => import("@fullcalendar/react"), { ssr: false });
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";

type PublicEvent = {
  id: number | string;
  title: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  bookedCount: number;
  color?: string;
};

export default function HomeSchedule() {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const calendarRef = useRef<FullCalendar | null>(null);

  const fetchEvents = async (fromISO: string, toISO: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/classes/instances?from=${encodeURIComponent(fromISO)}&to=${encodeURIComponent(toISO)}`);
      const data = (await res.json()) as PublicEvent[];
      setEvents(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  const fcEvents = useMemo(
    () =>
      events.map((e) => ({
        id: String(e.id),
        title: e.title,
        start: e.startsAt,
        end: e.endsAt,
        backgroundColor: (e as any).color,
        borderColor: (e as any).color,
        extendedProps: e,
      })),
    [events]
  );

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Live Weekly Schedule</h3>
        {loading && <span className="text-sm text-gray-500">Loading…</span>}
      </div>
      <FullCalendar
        ref={calendarRef as any}
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek" }}
        timeZone="local"
        slotMinTime="06:00:00"
        slotMaxTime="23:00:00"
        nowIndicator
        expandRows
        weekNumbers
        stickyHeaderDates
        dayMaxEventRows={3}
        eventTimeFormat={{ hour: "numeric", minute: "2-digit", meridiem: true }}
        slotDuration="00:30:00"
        events={fcEvents}
        datesSet={(arg) => fetchEvents(arg.startStr, arg.endStr)}
        eventContent={(arg) => {
          const data = arg.event.extendedProps as any as PublicEvent;
          const capacity = `${data.bookedCount}/${data.capacity}`;
          return {
            html: `
              <div class="flex items-center gap-2">
                <span class="inline-block w-2 h-2 rounded-full" style="background:${data.color || '#ef4444'}"></span>
                <div class="flex-1 truncate">
                  <div class="text-[12px] font-medium leading-tight">${arg.event.title}</div>
                </div>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-white">${capacity}</span>
              </div>`
          };
        }}
        height="auto"
      />
    </div>
  );
}


