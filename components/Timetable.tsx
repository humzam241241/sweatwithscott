"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

interface EventItem {
  id: number;
  title: string;
  start: string;
  end: string;
}

export default function Timetable() {
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    fetch("/api/schedule")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setEvents(
            data.map((e: any) => ({
              id: e.id,
              title: e.className || e.name,
              start: e.startTime || e.start,
              end: e.endTime || e.end,
            }))
          );
        }
      });
  }, []);

  return (
    <div className="mx-auto max-w-7xl">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}
        eventColor="#C90015"
      />
    </div>
  );
}
