"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
const FullCalendar = dynamic(() => import("@fullcalendar/react"), { ssr: false });
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin, { DateSelectArg, EventDropArg, EventResizeDoneArg } from "@fullcalendar/interaction";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

export const dynamic = "force-dynamic";
export const revalidate = false;

export default function AdminSchedulePage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const calendarRef = useRef<FullCalendar | null>(null);
  const [menu, setMenu] = useState<{
    open: boolean;
    x: number;
    y: number;
    eventId?: string;
    data?: AdminEvent;
  }>({ open: false, x: 0, y: 0 });
  const [roster, setRoster] = useState<{ open: boolean; attendees: any[]; eventId?: string }>({ open: false, attendees: [] });
  const [filters, setFilters] = useState<{ coach: string | 'All'; title: string | 'All' }>({ coach: 'All', title: 'All' });
  const [showTip, setShowTip] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<{ title: string; startsAt: string; endsAt: string; capacity: number; coachName: string; color: string }>({
    title: "New Class",
    startsAt: toLocalIsoMinute(new Date()),
    endsAt: toLocalIsoMinute(new Date(Date.now() + 60 * 60 * 1000)),
    capacity: 20,
    coachName: "",
    color: "#ef4444",
  });

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
      events
        .filter((e) => (filters.coach === 'All' || (e.coach?.name || '') === filters.coach))
        .filter((e) => (filters.title === 'All' || e.title === filters.title))
        .map((e) => ({
        id: String(e.id),
        title: e.title,
        start: e.startsAt,
        end: e.endsAt,
        backgroundColor: e.color,
        borderColor: e.color,
        extendedProps: e,
        classNames: e.status === "canceled" ? ["opacity-50", "line-through"] : [],
      })),
    [events, filters]
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
    // Broadcast so all calendars update live
    window.dispatchEvent(new CustomEvent('classes:changed'));
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
    // Broadcast so all calendars update live
    window.dispatchEvent(new CustomEvent('classes:changed'));
  };

  const toLocalIsoMinute = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setCreateForm({
      title: "New Class",
      startsAt: toLocalIsoMinute(selectInfo.start),
      endsAt: toLocalIsoMinute(selectInfo.end),
      capacity: 20,
      coachName: "",
      color: "#ef4444",
    });
    setCreateOpen(true);
  };

  const createClassFromForm = async () => {
    const { title, startsAt, endsAt, capacity, coachName, color } = createForm;
    const dayOfWeek = new Date(startsAt).toLocaleDateString('en-US', { weekday: 'long' });
    const classResp = await fetch('/api/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: title, day_of_week: dayOfWeek, start_time: startsAt.slice(11,16), end_time: endsAt.slice(11,16), max_capacity: capacity, color })
    });
    if (!classResp.ok) return false;
    const created = await classResp.json();
    const res = await fetch(`/api/classes/instances`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classId: created.id, title, startsAt, endsAt, capacity, color, coachName })
    });
    if (res.ok) {
      const api = (calendarRef.current as any)?.getApi?.();
      fetchEvents(api.view.activeStart.toISOString(), api.view.activeEnd.toISOString());
      window.dispatchEvent(new CustomEvent('classes:changed'));
      api.unselect?.();
      return true;
    }
    return false;
  };

  return (
    <>
    <div className="p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h1 className="text-xl font-semibold">Schedule Manager</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { setCreateForm({ title: 'New Class', startsAt: toLocalIsoMinute(new Date()), endsAt: toLocalIsoMinute(new Date(Date.now()+60*60*1000)), capacity: 20, coachName: '', color: '#ef4444' }); setCreateOpen(true); }}
              className="px-3 py-1.5 rounded bg-black text-white border border-gray-300 hover:bg-gray-900"
            >
              + New class
            </button>
            <select className="border rounded px-2 py-1 text-sm" value={filters.coach} onChange={(e)=>setFilters(f=>({ ...f, coach: e.target.value as any }))}>
              <option>All</option>
              {Array.from(new Set(events.map(e=>e.coach?.name).filter(Boolean) as string[])).map((c)=> (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select className="border rounded px-2 py-1 text-sm" value={filters.title} onChange={(e)=>setFilters(f=>({ ...f, title: e.target.value as any }))}>
              <option>All</option>
              {Array.from(new Set(events.map(e=>e.title))).map((t)=> (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {loading && <span className="text-sm text-gray-500">Loading…</span>}
          </div>
        </div>
        {showTip && (
          <div className="mb-3 rounded border border-blue-300 bg-blue-50 text-blue-800 text-sm px-3 py-2">
            Click and drag on the calendar to create a class. Use the event menu to edit, change color/coach, duplicate or cancel.
          </div>
        )}
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
          selectOverlap={true}
          longPressDelay={0}
          snapDuration={{ minutes: 15 } as any}
          slotDuration="00:30:00"
          height="auto"
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
          eventClick={(click) => {
            const rect = (click.jsEvent.target as HTMLElement).getBoundingClientRect();
            setMenu({
              open: true,
              x: rect.left,
              y: rect.bottom + window.scrollY,
              eventId: click.event.id,
              data: click.event.extendedProps as any as AdminEvent,
            });
          }}
          height="auto"
        />
        {menu.open && (
          <div
            className="fixed z-50 rounded-md border bg-white shadow-lg text-sm"
            style={{ left: menu.x, top: menu.y }}
            onMouseLeave={() => setMenu((m) => ({ ...m, open: false }))}
          >
            <MenuItem label="Edit title/capacity/coach" onClick={async () => {
              const id = menu.eventId!;
              const newTitle = window.prompt("Title", menu.data?.title || "") || menu.data?.title;
              const newCapacityStr = window.prompt("Capacity", String(menu.data?.capacity || 20));
              const newCapacity = newCapacityStr ? Number(newCapacityStr) : undefined;
              const coachName = window.prompt("Coach", menu.data?.coach?.name || "") || menu.data?.coach?.name;
              await fetch(`/api/classes/instances/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: newTitle, capacity: newCapacity, coachName }) });
              setMenu((m)=>({ ...m, open:false }));
              const view = (calendarRef.current as any)?.getApi?.().view;
              fetchEvents(view.activeStart.toISOString(), view.activeEnd.toISOString());
              window.dispatchEvent(new CustomEvent('classes:changed'));
            }} />
            <MenuItem label="Change color" onClick={async () => {
              const id = menu.eventId!;
              const color = window.prompt('Hex color', menu.data?.color || '#ef4444');
              if (!color) return;
              await fetch(`/api/classes/instances/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ color }) });
              setMenu((m)=>({ ...m, open:false }));
              const view = (calendarRef.current as any)?.getApi?.().view;
              fetchEvents(view.activeStart.toISOString(), view.activeEnd.toISOString());
              window.dispatchEvent(new CustomEvent('classes:changed'));
            }} />
            <MenuItem label="Capacity +1" onClick={async ()=>{
              const id = menu.eventId!;
              const newCapacity = (menu.data?.capacity || 20) + 1;
              await fetch(`/api/classes/instances/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ capacity: newCapacity }) });
              setMenu((m)=>({ ...m, open:false }));
              const view = (calendarRef.current as any)?.getApi?.().view;
              fetchEvents(view.activeStart.toISOString(), view.activeEnd.toISOString());
            }} />
            <MenuItem label="Capacity −1" onClick={async ()=>{
              const id = menu.eventId!;
              const newCapacity = Math.max(1, (menu.data?.capacity || 20) - 1);
              await fetch(`/api/classes/instances/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ capacity: newCapacity }) });
              setMenu((m)=>({ ...m, open:false }));
              const view = (calendarRef.current as any)?.getApi?.().view;
              fetchEvents(view.activeStart.toISOString(), view.activeEnd.toISOString());
            }} />
            <MenuItem label="View roster" onClick={async ()=>{
              const id = menu.eventId!;
              const res = await fetch(`/api/admin/classes/${id}/attendees`);
              const attendees = res.ok ? await res.json() : [];
              setMenu((m)=>({ ...m, open:false }));
              setRoster({ open: true, attendees, eventId: id });
            }} />
            <MenuItem label="Duplicate +1 week" onClick={async ()=>{
              const api = (calendarRef.current as any)?.getApi?.();
              const ev = api?.getEventById(menu.eventId!);
              if (!ev) return;
              const start = ev.start!; const end = ev.end!;
              const startsAt = new Date(start.getTime()); startsAt.setDate(startsAt.getDate() + 7);
              const endsAt = new Date(end.getTime()); endsAt.setDate(endsAt.getDate() + 7);
              await fetch(`/api/classes/instances`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: ev.title, startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString(), capacity: menu.data?.capacity, color: menu.data?.color, coachName: menu.data?.coach?.name }) });
              setMenu((m)=>({ ...m, open:false }));
              fetchEvents(api.view.activeStart.toISOString(), api.view.activeEnd.toISOString());
              window.dispatchEvent(new CustomEvent('classes:changed'));
            }} />
            <MenuItem label="Cancel" onClick={async ()=>{
              const id = menu.eventId!;
              await fetch(`/api/classes/instances/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'canceled' }) });
              setMenu((m)=>({ ...m, open:false }));
              const view = (calendarRef.current as any)?.getApi?.().view;
              fetchEvents(view.activeStart.toISOString(), view.activeEnd.toISOString());
            }} />
          </div>
        )}
        {roster.open && (
          <RosterModal attendees={roster.attendees} onClose={()=>setRoster({ open:false, attendees: [] })} onKick={async (userId:number)=>{
            await fetch('/api/classes/cancel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, class_instance_id: Number(roster.eventId) }) });
            const res = await fetch(`/api/admin/classes/${roster.eventId}/attendees`);
            const attendees = res.ok ? await res.json() : [];
            setRoster((r)=>({ ...r, attendees }));
            window.dispatchEvent(new CustomEvent('classes:changed'));
          }} />
        )}
      </div>
    </div>
    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New class</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="space-y-1">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={createForm.title} onChange={(e)=>setCreateForm({ ...createForm, title: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="start">Starts</Label>
              <Input id="start" type="datetime-local" value={createForm.startsAt} onChange={(e)=>setCreateForm({ ...createForm, startsAt: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="end">Ends</Label>
              <Input id="end" type="datetime-local" value={createForm.endsAt} onChange={(e)=>setCreateForm({ ...createForm, endsAt: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="cap">Capacity</Label>
              <Input id="cap" type="number" value={createForm.capacity} onChange={(e)=>setCreateForm({ ...createForm, capacity: Number(e.target.value || 0) })} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="coach">Coach</Label>
              <Input id="coach" value={createForm.coachName} onChange={(e)=>setCreateForm({ ...createForm, coachName: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="color">Color</Label>
            <input id="color" type="color" value={createForm.color} onChange={(e)=>setCreateForm({ ...createForm, color: e.target.value })} className="h-10 w-20 rounded" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={()=>setCreateOpen(false)}>Cancel</Button>
          <Button onClick={async ()=>{ const ok = await createClassFromForm(); if (ok) setCreateOpen(false); }}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}

function MenuItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="block w-full text-left px-3 py-2 hover:bg-gray-100"
      type="button"
    >
      {label}
    </button>
  );
}

function RosterModal({ attendees, onClose, onKick }: { attendees: any[]; onClose: () => void; onKick: (userId: number) => void }) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-md bg-white p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Attendees</h3>
          <button onClick={onClose} className="text-sm text-gray-500">Close</button>
        </div>
        <div className="max-h-[50vh] overflow-auto divide-y">
          {attendees.length === 0 ? (
            <div className="text-sm text-gray-500">No attendees</div>
          ) : attendees.map((a) => (
            <div key={a.id} className="flex items-center justify-between py-2 text-sm">
              <div>
                <div className="font-medium">{a.username || a.email || `User ${a.user_id}`}</div>
                <div className="text-gray-500">{a.status} · {a.payment_status}</div>
              </div>
              <button className="px-2 py-1 text-red-600 border border-red-600 rounded" onClick={()=>onKick(a.user_id)}>Kick</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


