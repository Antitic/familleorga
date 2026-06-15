"use client";

import { useEffect, useState } from "react";

interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  status: string;
  priority: string;
  recurring: string | null;
  dueDate: string | null;
  assignedTo: { id: string; name: string; avatar: string } | null;
  createdBy: { id: string; name: string };
}

interface Member {
  id: string;
  name: string;
  avatar: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [form, setForm] = useState({
    title: "", description: "", points: 1, priority: "MEDIUM",
    recurring: "", dueDate: "", assignedToId: "",
  });

  useEffect(() => {
    loadTasks();
    fetch("/familia/api/users").then(r => r.json()).then(d => Array.isArray(d) && setMembers(d));
  }, []);

  const loadTasks = () => {
    fetch("/familia/api/tasks").then(r => r.json()).then(d => Array.isArray(d) && setTasks(d));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/familia/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ title: "", description: "", points: 1, priority: "MEDIUM", recurring: "", dueDate: "", assignedToId: "" });
    setShowForm(false);
    loadTasks();
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/familia/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadTasks();
  };

  const deleteTask = async (id: string) => {
    if (!confirm("Supprimer cette tâche ?")) return;
    await fetch(`/familia/api/tasks/${id}`, { method: "DELETE" });
    loadTasks();
  };

  const filtered = filter === "ALL" ? tasks : tasks.filter(t => t.status === filter);

  const priorityColors: Record<string, string> = {
    HIGH: "bg-red-100 text-red-700 border-red-200",
    MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
    LOW: "bg-green-100 text-green-700 border-green-200",
  };

  const statusConfig: Record<string, { label: string; color: string; next: string }> = {
    TODO: { label: "À faire", color: "bg-gray-100 text-gray-700", next: "IN_PROGRESS" },
    IN_PROGRESS: { label: "En cours", color: "bg-blue-100 text-blue-700", next: "DONE" },
    DONE: { label: "Terminé", color: "bg-green-100 text-green-700", next: "TODO" },
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tâches & Corvées</h1>
          <p className="text-gray-500 mt-1">{tasks.length} tâches au total</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          + Nouvelle tâche
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigner à</label>
              <select
                value={form.assignedToId}
                onChange={e => setForm({ ...form, assignedToId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">Non assigné</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>
                ))}
              </select>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={form.points}
                  onChange={e => setForm({ ...form, points: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                <select
                  value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="LOW">Basse</option>
                  <option value="MEDIUM">Moyenne</option>
                  <option value="HIGH">Haute</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date limite</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={e => setForm({ ...form, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Récurrence</label>
              <select
                value={form.recurring}
                onChange={e => setForm({ ...form, recurring: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">Aucune</option>
                <option value="DAILY">Quotidienne</option>
                <option value="WEEKLY">Hebdomadaire</option>
                <option value="MONTHLY">Mensuelle</option>
              </select>
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

      <div className="flex gap-2">
        {[
          { value: "ALL", label: "Toutes" },
          { value: "TODO", label: "À faire" },
          { value: "IN_PROGRESS", label: "En cours" },
          { value: "DONE", label: "Terminées" },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === f.value ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Aucune tâche trouvée</div>
        ) : (
          filtered.map(task => (
            <div key={task.id} className={`bg-white rounded-xl shadow-sm border border-gray-200 p-5 ${task.status === "DONE" ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`font-semibold text-gray-900 ${task.status === "DONE" ? "line-through" : ""}`}>
                      {task.title}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
                      {task.priority === "HIGH" ? "Haute" : task.priority === "MEDIUM" ? "Moyenne" : "Basse"}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig[task.status].color}`}>
                      {statusConfig[task.status].label}
                    </span>
                    {task.recurring && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                        🔄 {task.recurring === "DAILY" ? "Quotidien" : task.recurring === "WEEKLY" ? "Hebdo" : "Mensuel"}
                      </span>
                    )}
                  </div>
                  {task.description && <p className="text-sm text-gray-500 mt-1">{task.description}</p>}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>{task.assignedTo ? `${task.assignedTo.avatar} ${task.assignedTo.name}` : "Non assigné"}</span>
                    {task.dueDate && <span>📅 {new Date(task.dueDate).toLocaleDateString("fr-FR")}</span>}
                    <span className="text-indigo-600 font-semibold">{task.points} pts</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {task.status !== "DONE" && (
                    <button
                      onClick={() => updateStatus(task.id, statusConfig[task.status].next)}
                      className="text-sm px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition"
                    >
                      {task.status === "TODO" ? "Démarrer" : "Terminer"}
                    </button>
                  )}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-sm px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
