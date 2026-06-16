"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({ tasks: 0, done: 0, events: 0, shopping: 0 });
  const [members, setMembers] = useState<any[]>([]);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);

  useEffect(() => {
    fetch("/familia/api/tasks").then(r => r.json()).then(tasks => {
      if (Array.isArray(tasks)) {
        setRecentTasks(tasks.slice(0, 5));
        setStats(s => ({
          ...s,
          tasks: tasks.filter((t: any) => t.status !== "DONE").length,
          done: tasks.filter((t: any) => t.status === "DONE").length,
        }));
      }
    });
    fetch("/familia/api/events").then(r => r.json()).then(events => {
      if (Array.isArray(events)) {
        const upcoming = events.filter((e: any) => new Date(e.date) >= new Date());
        setStats(s => ({ ...s, events: upcoming.length }));
      }
    });
    fetch("/familia/api/shopping").then(r => r.json()).then(items => {
      if (Array.isArray(items)) {
        setStats(s => ({ ...s, shopping: items.filter((i: any) => !i.checked).length }));
      }
    });
    fetch("/familia/api/users").then(r => r.json()).then(users => {
      if (Array.isArray(users)) setMembers(users);
    });
  }, []);

  const statCards = [
    { label: "Tâches en cours", value: stats.tasks, icon: "📋", gradient: "from-blue-500 to-cyan-400", shadow: "shadow-blue-500/25" },
    { label: "Tâches terminées", value: stats.done, icon: "✅", gradient: "from-emerald-500 to-teal-400", shadow: "shadow-emerald-500/25" },
    { label: "Événements à venir", value: stats.events, icon: "📅", gradient: "from-purple-500 to-pink-400", shadow: "shadow-purple-500/25" },
    { label: "Articles à acheter", value: stats.shopping, icon: "🛒", gradient: "from-orange-500 to-amber-400", shadow: "shadow-orange-500/25" },
  ];

  const priorityColors: Record<string, string> = {
    HIGH: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
    MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
    LOW: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  };

  const statusLabels: Record<string, string> = {
    TODO: "À faire",
    IN_PROGRESS: "En cours",
    DONE: "Terminé",
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="animate-slide-up">
        <h1 className="page-title flex items-center gap-2">
          <span>Bonjour</span>
          <span className="inline-block animate-bounce-soft">{session?.user?.avatar}</span>
          <span className="gradient-text">{session?.user?.name}</span>
          <span>!</span>
        </h1>
        <p className="page-subtitle">Voici le résumé de votre famille</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div
            key={card.label}
            className={`rounded-2xl p-5 bg-gradient-to-br ${card.gradient} text-white shadow-lg ${card.shadow}
              transition-all duration-300 hover:scale-105 hover:shadow-xl animate-slide-up`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <span className="text-4xl drop-shadow-lg">{card.icon}</span>
              <span className="text-4xl font-extrabold drop-shadow">{card.value}</span>
            </div>
            <p className="mt-3 text-sm font-semibold text-white/90">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-static p-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
          <h2 className="section-title mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-sm">📝</span>
            Dernières tâches
          </h2>
          {recentTasks.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl block mb-2">🎉</span>
              <p style={{ color: "var(--muted-foreground)" }} className="text-sm">Aucune tâche pour le moment</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTasks.map((task, i) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-xl transition-all duration-300 hover:scale-[1.01] cursor-default"
                  style={{ background: "var(--background)", animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{task.assignedTo?.avatar || "👤"}</span>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{task.title}</p>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>
                        {task.assignedTo?.name || "Non assigné"} · {statusLabels[task.status]}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${priorityColors[task.priority]}`}>
                      {task.priority === "HIGH" ? "🔥" : task.priority === "MEDIUM" ? "⚡" : "🌿"} {task.priority}
                    </span>
                    <span className="text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                      {task.points} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card-static p-6 animate-slide-up" style={{ animationDelay: "300ms" }}>
          <h2 className="section-title mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-sm">🏆</span>
            Classement familial
          </h2>
          {members.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl block mb-2">👨‍👩‍👧‍👦</span>
              <p style={{ color: "var(--muted-foreground)" }} className="text-sm">Aucun membre</p>
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((member, index) => {
                const medals = ["🥇", "🥈", "🥉"];
                const bgColors = [
                  "from-amber-400/20 to-yellow-400/10",
                  "from-gray-300/20 to-slate-300/10",
                  "from-orange-400/20 to-amber-400/10",
                ];
                return (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 hover:scale-[1.01]
                      ${index < 3 ? `bg-gradient-to-r ${bgColors[index]}` : ""}`}
                    style={index >= 3 ? { background: "var(--background)" } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl w-8 text-center">
                        {index < 3 ? medals[index] : <span className="text-sm font-bold" style={{ color: "var(--muted)" }}>{index + 1}.</span>}
                      </span>
                      <span className="text-xl">{member.avatar}</span>
                      <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{member.name}</p>
                    </div>
                    <span className="text-sm font-extrabold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                      {member.points} pts
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
