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
  const [form, setForm] = useState({ title: "", description: "", date: "", endDate: "", color: "#3B82F6" });

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
    setForm({ title: "", description: "", date: "", endDate: "", color: "#3B82F6" });
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

  const colors = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4"];

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendrier Familial</h1>
          <p className="text-gray-500 mt-1">{events.length} événements</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setForm({ title: "", description: "", date: format(new Date(), "yyyy-MM-dd"), endDate: "", color: "#3B82F6" }); }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          + Nouvel événement
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
              <input
                type="date"
                value={form.endDate}
                onChange={e => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Couleur</label>
            <div className="flex gap-2">
              {colors.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={`w-8 h-8 rounded-full transition ${form.color === c ? "ring-2 ring-offset-2 ring-gray-400" : ""}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">
              Créer
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:text-gray-900 transition">
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-lg transition">
            ←
          </button>
          <h2 className="text-lg font-semibold text-gray-900 capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: fr })}
          </h2>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-lg transition">
            →
          </button>
        </div>

        <div className="grid grid-cols-7">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-xs font-medium text-gray-500 border-b border-gray-200">
              {day}
            </div>
          ))}
          {days.map(day => {
            const dayEvents = getEventsForDay(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentMonth);
            return (
              <div
                key={day.toISOString()}
                onClick={() => handleDayClick(day)}
                className={`min-h-[80px] p-1 border-b border-r border-gray-100 cursor-pointer hover:bg-gray-50 transition ${
                  !isCurrentMonth ? "bg-gray-50/50" : ""
                }`}
              >
                <span className={`text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full ${
                  isToday ? "bg-indigo-600 text-white" : isCurrentMonth ? "text-gray-900" : "text-gray-400"
                }`}>
                  {format(day, "d")}
                </span>
                <div className="space-y-0.5 mt-0.5">
                  {dayEvents.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      className="text-xs px-1 py-0.5 rounded truncate text-white"
                      style={{ backgroundColor: event.color }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-500 px-1">+{dayEvents.length - 2}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && selectedDayEvents.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            Événements du {format(new Date(selectedDate), "d MMMM yyyy", { locale: fr })}
          </h3>
          <div className="space-y-2">
            {selectedDayEvents.map(event => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: event.color }} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{event.title}</p>
                    {event.description && <p className="text-xs text-gray-500">{event.description}</p>}
                  </div>
                </div>
                <button onClick={() => deleteEvent(event.id)} className="text-red-500 hover:text-red-700 text-sm">🗑</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
