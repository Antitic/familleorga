"use client";

import { useEffect, useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { fr } from "date-fns/locale";

interface CalEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate: string | null;
  color: string;
  createdBy: { id: string; name: string };
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [form, setForm] = useState({ title: "", description: "", date: "", endDate: "", color: "#6366f1" });

  useEffect(() => { loadEvents(); }, []);

  const loadEvents = () => {
    fetch("/familia/api/events").then(r => r.json()).then(d => Array.isArray(d) && setEvents(d));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/familia/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ title: "", description: "", date: "", endDate: "", color: "#6366f1" });
    setShowForm(false);
    loadEvents();
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Supprimer cet événement ?")) return;
    await fetch(`/familia/api/events/${id}`, { method: "DELETE" });
    loadEvents();
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getEventsForDay = (day: Date) =>
    events.filter(e => isSameDay(new Date(e.date), day));

  const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  const colors = [
    { value: "#6366f1", label: "Indigo" },
    { value: "#ef4444", label: "Rouge" },
    { value: "#10b981", label: "Vert" },
    { value: "#f59e0b", label: "Ambre" },
    { value: "#8b5cf6", label: "Violet" },
    { value: "#ec4899", label: "Rose" },
    { value: "#06b6d4", label: "Cyan" },
  ];

  const handleDayClick = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    setSelectedDate(dateStr);
    setForm({ ...form, date: dateStr });
    setShowForm(true);
  };

  const selectedDayEvents = selectedDate
    ? events.filter(e => isSameDay(new Date(e.date), new Date(selectedDate)))
    : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="page-title">Calendrier Familial</h1>
          <p className="page-subtitle">{events.length} événements</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setForm({ title: "", description: "", date: format(new Date(), "yyyy-MM-dd"), endDate: "", color: "#6366f1" }); }}
          className="btn-primary flex items-center gap-2"
        >
          <span className="text-lg">🗓</span> Nouvel événement
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card-static p-6 space-y-4 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Titre *</label>
              <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="label">Description</label>
              <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="label">Date *</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="label">Date de fin</label>
              <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="label">Couleur</label>
            <div className="flex gap-2">
              {colors.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setForm({ ...form, color: c.value })}
                  className={`w-9 h-9 rounded-xl transition-all duration-300 ${form.color === c.value ? "ring-3 ring-offset-2 ring-offset-[var(--card)] scale-110 shadow-lg" : "hover:scale-105"}`}
                  style={{ backgroundColor: c.value, boxShadow: form.color === c.value ? `0 4px 15px ${c.value}50` : undefined }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">Créer</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Annuler</button>
          </div>
        </form>
      )}

      <div className="card-static overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid var(--border)" }}>
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:bg-[var(--background)] hover:scale-105 active:scale-95"
          >
            <span style={{ color: "var(--foreground)" }}>←</span>
          </button>
          <h2 className="text-xl font-bold capitalize gradient-text">
            {format(currentMonth, "MMMM yyyy", { locale: fr })}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:bg-[var(--background)] hover:scale-105 active:scale-95"
          >
            <span style={{ color: "var(--foreground)" }}>→</span>
          </button>
        </div>

        <div className="grid grid-cols-7">
          {dayNames.map(day => (
            <div key={day} className="p-3 text-center text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
              {day}
            </div>
          ))}
          {days.map(day => {
            const dayEvents = getEventsForDay(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = selectedDate && isSameDay(day, new Date(selectedDate));
            return (
              <div
                key={day.toISOString()}
                onClick={() => handleDayClick(day)}
                className={`min-h-[85px] p-1.5 cursor-pointer transition-all duration-200 hover:bg-[var(--card-hover)] relative
                  ${!isCurrentMonth ? "opacity-40" : ""}
                  ${isSelected ? "bg-indigo-50 dark:bg-indigo-500/10" : ""}
                `}
                style={{ borderBottom: "1px solid var(--border-light)", borderRight: "1px solid var(--border-light)" }}
              >
                <span className={`text-xs font-bold inline-flex items-center justify-center w-7 h-7 rounded-lg transition-all ${
                  isToday
                    ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/30"
                    : isCurrentMonth ? "" : ""
                }`} style={!isToday ? { color: "var(--foreground)" } : {}}>
                  {format(day, "d")}
                </span>
                <div className="space-y-0.5 mt-0.5">
                  {dayEvents.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      className="text-[10px] px-1.5 py-0.5 rounded-md truncate text-white font-semibold"
                      style={{ backgroundColor: event.color }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-[10px] font-bold px-1" style={{ color: "var(--muted)" }}>+{dayEvents.length - 2}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && selectedDayEvents.length > 0 && (
        <div className="card-static p-6 animate-bounce-soft">
          <h3 className="font-bold mb-3" style={{ color: "var(--foreground)" }}>
            📅 Événements du {format(new Date(selectedDate), "d MMMM yyyy", { locale: fr })}
          </h3>
          <div className="space-y-2">
            {selectedDayEvents.map(event => (
              <div key={event.id} className="flex items-center justify-between p-3 rounded-xl transition-all duration-300" style={{ background: "var(--background)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-lg shadow-md" style={{ backgroundColor: event.color, boxShadow: `0 2px 8px ${event.color}50` }} />
                  <div>
                    <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{event.title}</p>
                    {event.description && <p className="text-xs" style={{ color: "var(--muted)" }}>{event.description}</p>}
                  </div>
                </div>
                <button onClick={() => deleteEvent(event.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-2 rounded-lg transition-all">🗑</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
