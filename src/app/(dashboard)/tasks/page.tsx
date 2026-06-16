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

  const priorityConfig: Record<string, { label: string; color: string; icon: string }> = {
    HIGH: { label: "Haute", color: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400", icon: "🔥" },
    MEDIUM: { label: "Moyenne", color: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400", icon: "⚡" },
    LOW: { label: "Basse", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400", icon: "🌿" },
  };

  const statusConfig: Record<string, { label: string; color: string; next: string; icon: string }> = {
    TODO: { label: "À faire", color: "bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400", next: "IN_PROGRESS", icon: "📌" },
    IN_PROGRESS: { label: "En cours", color: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400", next: "DONE", icon: "🔄" },
    DONE: { label: "Terminé", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400", next: "TODO", icon: "✅" },
  };

  const filterButtons = [
    { value: "ALL", label: "Toutes", icon: "📋" },
    { value: "TODO", label: "À faire", icon: "📌" },
    { value: "IN_PROGRESS", label: "En cours", icon: "🔄" },
    { value: "DONE", label: "Terminées", icon: "✅" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="page-title">Tâches & Corvées</h1>
          <p className="page-subtitle">{tasks.length} tâches au total</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <span className="text-lg">✨</span> Nouvelle tâche
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
              <label className="label">Assigner à</label>
              <select value={form.assignedToId} onChange={e => setForm({ ...form, assignedToId: e.target.value })} className="input-field">
                <option value="">Non assigné</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Description</label>
              <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Points</label>
                <input type="number" min={1} max={100} value={form.points} onChange={e => setForm({ ...form, points: parseInt(e.target.value) || 1 })} className="input-field" />
              </div>
              <div>
                <label className="label">Priorité</label>
                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="input-field">
                  <option value="LOW">🌿 Basse</option>
                  <option value="MEDIUM">⚡ Moyenne</option>
                  <option value="HIGH">🔥 Haute</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Date limite</label>
              <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="label">Récurrence</label>
              <select value={form.recurring} onChange={e => setForm({ ...form, recurring: e.target.value })} className="input-field">
                <option value="">Aucune</option>
                <option value="DAILY">Quotidienne</option>
                <option value="WEEKLY">Hebdomadaire</option>
                <option value="MONTHLY">Mensuelle</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">Créer</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Annuler</button>
          </div>
        </form>
      )}

      <div className="flex gap-2 flex-wrap">
        {filterButtons.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 ${
              filter === f.value
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25"
                : "text-[var(--muted-foreground)] hover:bg-[var(--card)] border border-[var(--border)]"
            }`}
          >
            <span>{f.icon}</span> {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <span className="text-5xl block mb-3">🎯</span>
            <p style={{ color: "var(--muted-foreground)" }} className="font-medium">Aucune tâche trouvée</p>
          </div>
        ) : (
          filtered.map((task, i) => (
            <div
              key={task.id}
              className={`card-static p-5 transition-all duration-300 hover:shadow-lg animate-slide-up ${task.status === "DONE" ? "opacity-60" : ""}`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`font-bold ${task.status === "DONE" ? "line-through" : ""}`} style={{ color: "var(--foreground)" }}>
                      {task.title}
                    </h3>
                    <span className={`badge ${priorityConfig[task.priority].color}`}>
                      {priorityConfig[task.priority].icon} {priorityConfig[task.priority].label}
                    </span>
                    <span className={`badge ${statusConfig[task.status].color}`}>
                      {statusConfig[task.status].icon} {statusConfig[task.status].label}
                    </span>
                    {task.recurring && (
                      <span className="badge bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400">
                        🔄 {task.recurring === "DAILY" ? "Quotidien" : task.recurring === "WEEKLY" ? "Hebdo" : "Mensuel"}
                      </span>
                    )}
                  </div>
                  {task.description && <p className="text-sm mt-1.5" style={{ color: "var(--muted-foreground)" }}>{task.description}</p>}
                  <div className="flex items-center gap-4 mt-2.5 text-xs" style={{ color: "var(--muted)" }}>
                    <span className="flex items-center gap-1">
                      <span>{task.assignedTo?.avatar || "👤"}</span>
                      {task.assignedTo?.name || "Non assigné"}
                    </span>
                    {task.dueDate && <span>📅 {new Date(task.dueDate).toLocaleDateString("fr-FR")}</span>}
                    <span className="font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                      ⭐ {task.points} pts
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {task.status !== "DONE" && (
                    <button
                      onClick={() => updateStatus(task.id, statusConfig[task.status].next)}
                      className="text-sm px-4 py-2 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 hover:from-indigo-500/20 hover:to-purple-500/20"
                    >
                      {task.status === "TODO" ? "▶️ Démarrer" : "✅ Terminer"}
                    </button>
                  )}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-sm px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all duration-300"
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
