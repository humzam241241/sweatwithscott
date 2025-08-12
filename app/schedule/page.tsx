"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
  color?: string;
};

export default function SchedulePage() {
  const [events, setEvents] = useState<MemberEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [menu, setMenu] = useState<{ open: boolean; x: number; y: number; eventId?: string; data?: MemberEvent }>(
    { open: false, x: 0, y: 0 }
  );
  const calendarRef = useRef<FullCalendar | null>(null);
  const [range, setRange] = useState<{ from: string; to: string } | null>(null);

  const fetchEvents = async (fromISO: string, toISO: string) => {
    setLoading(true);
    try {
      const uid = (typeof window !== 'undefined' && (window as any).CURRENT_USER_ID) ? Number((window as any).CURRENT_USER_ID) : null;
      const params = new URLSearchParams({ from: fromISO, to: toISO });
      if (uid && Number.isFinite(uid)) params.set('user_id', String(uid));
      const res = await fetch(`/api/classes/instances?${params.toString()}`);
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
        backgroundColor: (e as any).color,
        borderColor: (e as any).color,
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
          slotDuration="00:30:00"
          events={fcEvents}
          datesSet={(arg) => { setRange({ from: arg.startStr, to: arg.endStr }); fetchEvents(arg.startStr, arg.endStr); }}
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
          eventClick={(click) => {
            if (!(window as any).CURRENT_USER_ID) {
              // not logged in → no edit menu
              return;
            }
            const rect = (click.jsEvent.target as HTMLElement).getBoundingClientRect();
            setMenu({
              open: true,
              x: rect.left,
              y: rect.bottom + window.scrollY,
              eventId: String(click.event.id),
              data: click.event.extendedProps as any as MemberEvent,
            });
          }}
          height="auto"
        />
        {menu.open && menu.data && (
          <div
            className="fixed z-50 rounded-md border bg-white shadow-lg text-sm"
            style={{ left: menu.x, top: menu.y }}
            onMouseLeave={() => setMenu((m) => ({ ...m, open: false }))}
          >
            {menu.data.user_booking_status === 'confirmed' ? (
              <MenuItem label="Cancel RSVP" onClick={async () => {
                try {
                  await fetch('/api/classes/cancel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ class_instance_id: Number(menu.eventId), user_id: (window as any).CURRENT_USER_ID || 0 }) });
                } finally {
                  setMenu((m)=>({ ...m, open:false }));
                  const cal = document.querySelector('.fc') as any;
                  const api = cal?._calendar || (cal as any)?.calendar;
                  if (api) fetchEvents(api.view.activeStart.toISOString(), api.view.activeEnd.toISOString());
                }
              }} />
            ) : (
              <MenuItem label="RSVP" onClick={async () => {
                try {
                  await fetch('/api/classes/book', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ class_instance_id: Number(menu.eventId), user_id: (window as any).CURRENT_USER_ID || 0 }) });
                } finally {
                  setMenu((m)=>({ ...m, open:false }));
                  const cal = document.querySelector('.fc') as any;
                  const api = cal?._calendar || (cal as any)?.calendar;
                  if (api) fetchEvents(api.view.activeStart.toISOString(), api.view.activeEnd.toISOString());
                }
              }} />
            )}
            <MenuItem label="Pay Drop-in" onClick={async ()=>{
              try {
                const res = await fetch('/api/stripe/checkout', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ planCode: 'DROP_IN', class_instance_id: Number(menu.eventId) }),
                });
                const data = await res.json();
                if (data.url) window.location.href = data.url;
              } finally {
                setMenu((m)=>({ ...m, open:false }));
              }
            }} />
          </div>
        )}
        {/* Listen for admin changes and refresh */}
        <BroadcastListener onTrigger={() => {
          if (range) fetchEvents(range.from, range.to);
          else {
            const api = calendarRef.current?.getApi?.();
            if (api) fetchEvents(api.view.activeStart.toISOString(), api.view.activeEnd.toISOString());
          }
        }} />
      </div>
    </div>
  );
}

function MenuItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="block w-full text-left px-3 py-2 hover:bg-gray-100" type="button">
      {label}
    </button>
  );
}

function BroadcastListener({ onTrigger }: { onTrigger: () => void }){
  useEffect(()=>{
    const handler = () => onTrigger();
    window.addEventListener('classes:changed', handler);
    return () => window.removeEventListener('classes:changed', handler);
  }, [onTrigger]);
  return null;
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