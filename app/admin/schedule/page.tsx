"use client";

import React, { useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin, { DateSelectArg, EventDropArg, EventResizeDoneArg } from "@fullcalendar/interaction";

type AdminEvent = {
  id: number | string;
  title: string;
  startsAt: string;
  endsAt: string;
  coach?: { id: number | null; name: string };
  capacity: number;
  bookedCount: number;
  color?: string;
  status: string;
};

export default function AdminSchedulePage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const calendarRef = useRef<FullCalendar | null>(null);

  const fetchEvents = async (fromISO: string, toISO: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/classes/instances?from=${encodeURIComponent(fromISO)}&to=${encodeURIComponent(toISO)}`);
      const data = (await res.json()) as AdminEvent[];
      setEvents(data);
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
        backgroundColor: e.color,
        borderColor: e.color,
        extendedProps: e,
        classNames: e.status === "canceled" ? ["opacity-50", "line-through"] : [],
      })),
    [events]
  );

  const onDatesSet = (arg: any) => {
    const fromISO = arg.startStr;
    const toISO = arg.endStr;
    fetchEvents(fromISO, toISO);
  };

  const handleEventDrop = async (info: EventDropArg) => {
    const id = info.event.id;
    const startsAt = info.event.start?.toISOString();
    const endsAt = info.event.end?.toISOString();
    await fetch(`/api/classes/instances/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startsAt, endsAt }),
    });
  };

  const handleEventResize = async (info: EventResizeDoneArg) => {
    const id = info.event.id;
    const startsAt = info.event.start?.toISOString();
    const endsAt = info.event.end?.toISOString();
    await fetch(`/api/classes/instances/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startsAt, endsAt }),
    });
  };

  const toLocalIsoMinute = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handleDateSelect = async (selectInfo: DateSelectArg) => {
    const startsAt = toLocalIsoMinute(selectInfo.start);
    const endsAt = toLocalIsoMinute(selectInfo.end);
    const title = prompt("Class Title?") || "New Class";
    const res = await fetch(`/api/classes/instances`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, startsAt, endsAt }),
    });
    if (res.ok) {
      // refetch by calling onDatesSet implicitly
      fetchEvents(selectInfo.view.activeStart.toISOString(), selectInfo.view.activeEnd.toISOString());
    }
  };

  return (
    <div className="p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Schedule Manager</h1>
          {loading && <span className="text-sm text-gray-500">Loading…</span>}
        </div>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek" }}
          timeZone="local"
          slotMinTime="06:00:00"
          slotMaxTime="23:00:00"
          nowIndicator
          selectMirror
          expandRows
          eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: true }}
          selectable
          editable
          eventStartEditable
          eventDurationEditable
          events={fcEvents}
          datesSet={onDatesSet}
          select={handleDateSelect}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          height="auto"
        />
      </div>
    </div>
  );
}


