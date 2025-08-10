"use client";

import React, { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";

type MemberEvent = {
  id: number;
  title: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  bookedCount: number;
  user_booking_status?: string;
};

export default function SchedulePage() {
  const [events, setEvents] = useState<MemberEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = async (fromISO: string, toISO: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/classes/instances?from=${encodeURIComponent(fromISO)}&to=${encodeURIComponent(toISO)}`);
      const data = (await res.json()) as MemberEvent[];
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
        extendedProps: e,
      })),
    [events]
  );

  return (
    <div className="p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Class Schedule</h1>
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
          expandRows
          eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: true }}
          weekNumbers
          stickyHeaderDates
          dayMaxEventRows={3}
          events={fcEvents}
          datesSet={(arg) => fetchEvents(arg.startStr, arg.endStr)}
          eventContent={(arg) => {
            const data = arg.event.extendedProps as any as MemberEvent;
            const capacity = `${data.bookedCount}/${data.capacity}`;
            const isMine = data.user_booking_status === "confirmed";
            return {
              html: `
                <div class="flex items-center gap-2">
                  <div class="flex-1 truncate">
                    <div class="text-[12px] font-medium leading-tight">${arg.event.title}</div>
                    <div class="text-[10px] ${isMine ? 'text-green-600' : 'text-gray-500'}">${isMine ? 'Booked' : ''}</div>
                  </div>
                  <span class="text-[10px] px-1.5 py-0.5 rounded ${data.bookedCount>=data.capacity ? 'bg-rose-600 text-white' : 'bg-gray-800 text-white'}">${capacity}</span>
                </div>`
            };
          }}
          eventClick={async (click) => {
            try {
              const id = Number(click.event.id);
              const isMine = (click.event.extendedProps as any).user_booking_status === 'confirmed';
              if (isMine) {
                await fetch('/api/classes/cancel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ class_instance_id: id, user_id: (window as any).CURRENT_USER_ID || 0 }) });
              } else {
                await fetch('/api/classes/book', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ class_instance_id: id, user_id: (window as any).CURRENT_USER_ID || 0 }) });
              }
              // refresh
              fetchEvents(click.view.activeStart.toISOString(), click.view.activeEnd.toISOString());
            } catch {}
          }}
          height="auto"
        />
        {/* Listen for admin changes and refresh */}
        <RefreshOnBroadcast onRefresh={(from,to)=>fetchEvents(from,to)} />
      </div>
    </div>
  );
}

function RefreshOnBroadcast({ onRefresh }: { onRefresh: (fromISO:string, toISO:string)=>void }){
  const [range, setRange] = React.useState<{from:string;to:string}|null>(null);
  React.useEffect(()=>{
    const handler = () => {
      const cal = document.querySelector('.fc') as any;
      if (cal && (cal._calendar || (cal as any).calendar)){
        const api = (cal._calendar || (cal as any).calendar);
        const start = api.view.activeStart.toISOString();
        const end = api.view.activeEnd.toISOString();
        setRange({from:start, to:end});
        onRefresh(start,end);
      }
    };
    window.addEventListener('classes:changed', handler);
    return () => window.removeEventListener('classes:changed', handler);
  }, [onRefresh]);
  return null;
}