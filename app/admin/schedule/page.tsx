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
    // Create or reuse a class for this title on-the-fly so color/coach can be edited from Classes page
    const classResp = await fetch('/api/classes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: title, day_of_week: new Date(startsAt).toLocaleDateString('en-US',{ weekday:'long'}), start_time: startsAt.slice(11,16), end_time: endsAt.slice(11,16), max_capacity: 20, color: '#ef4444' }) });
    if (!classResp.ok) return;
    const created = await classResp.json();
    const res = await fetch(`/api/classes/instances`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId: created.id, title, startsAt, endsAt }),
    });
    if (res.ok) {
      fetchEvents(selectInfo.view.activeStart.toISOString(), selectInfo.view.activeEnd.toISOString());
      window.dispatchEvent(new CustomEvent('classes:changed'));
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
          weekNumbers
          stickyHeaderDates
          dayMaxEventRows={3}
          selectable
          editable
          eventStartEditable
          eventDurationEditable
          events={fcEvents}
          datesSet={onDatesSet}
          select={handleDateSelect}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          eventContent={(arg) => {
            const data = arg.event.extendedProps as any as AdminEvent;
            const capacity = `${data.bookedCount}/${data.capacity}`;
            const isCanceled = data.status === "canceled";
            return {
              html: `
                <div class="flex items-center gap-2 ${isCanceled ? 'opacity-50 line-through' : ''}">
                  <span class="inline-block w-2 h-2 rounded-full" style="background:${data.color || '#ef4444'}"></span>
                  <div class="flex-1 truncate">
                    <div class="text-[12px] font-medium leading-tight">${arg.event.title}</div>
                    <div class="text-[10px] text-gray-500">${data.coach?.name || ''}</div>
                  </div>
                  <span class="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-white">${capacity}</span>
                </div>`
            };
          }}
          eventClick={async (click) => {
            const id = click.event.id;
            const choice = window.prompt("Action: edit | cancel | duplicate", "edit");
            if (!choice) return;
            if (choice === "cancel") {
              await fetch(`/api/classes/instances/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "canceled" }) });
              click.event.setProp("classNames", ["opacity-50", "line-through"]);
            } else if (choice === "duplicate") {
              const start = click.event.start!; const end = click.event.end!;
              const startsAt = new Date(start.getTime()); startsAt.setDate(startsAt.getDate() + 7);
              const endsAt = new Date(end.getTime()); endsAt.setDate(endsAt.getDate() + 7);
              await fetch(`/api/classes/instances`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: click.event.title, startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString() }) });
              fetchEvents(click.view.activeStart.toISOString(), click.view.activeEnd.toISOString());
              window.dispatchEvent(new CustomEvent('classes:changed'));
            } else if (choice === "edit") {
              const newTitle = window.prompt("Title", click.event.title) || click.event.title;
              const newCapacityStr = window.prompt("Capacity", String(((click.event.extendedProps as any).capacity || 20)));
              const newCapacity = newCapacityStr ? Number(newCapacityStr) : undefined;
              await fetch(`/api/classes/instances/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: newTitle, capacity: newCapacity }) });
              fetchEvents(click.view.activeStart.toISOString(), click.view.activeEnd.toISOString());
              window.dispatchEvent(new CustomEvent('classes:changed'));
            }
          }}
          height="auto"
        />
      </div>
    </div>
  );
}


