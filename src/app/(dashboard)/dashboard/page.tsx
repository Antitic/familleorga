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
    { label: "Tâches en cours", value: stats.tasks, icon: "📋", color: "bg-blue-50 text-blue-700" },
    { label: "Tâches terminées", value: stats.done, icon: "✅", color: "bg-green-50 text-green-700" },
    { label: "Événements à venir", value: stats.events, icon: "📅", color: "bg-purple-50 text-purple-700" },
    { label: "Articles à acheter", value: stats.shopping, icon: "🛒", color: "bg-orange-50 text-orange-700" },
  ];

  const priorityColors: Record<string, string> = {
    HIGH: "bg-red-100 text-red-700",
    MEDIUM: "bg-yellow-100 text-yellow-700",
    LOW: "bg-green-100 text-green-700",
  };

  const statusLabels: Record<string, string> = {
    TODO: "À faire",
    IN_PROGRESS: "En cours",
    DONE: "Terminé",
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour {session?.user?.avatar} {session?.user?.name} !
        </h1>
        <p className="text-gray-500 mt-1">Voici le résumé de votre famille</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className={`rounded-xl p-5 ${card.color}`}>
            <div className="flex items-center justify-between">
              <span className="text-3xl">{card.icon}</span>
              <span className="text-3xl font-bold">{card.value}</span>
            </div>
            <p className="mt-2 text-sm font-medium">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Dernières tâches</h2>
          {recentTasks.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucune tâche pour le moment</p>
          ) : (
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{task.assignedTo?.avatar || "👤"}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-500">
                        {task.assignedTo?.name || "Non assigné"} · {statusLabels[task.status]}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                    <span className="text-xs text-indigo-600 font-semibold">{task.points} pts</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Classement familial</h2>
          {members.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucun membre</p>
          ) : (
            <div className="space-y-3">
              {members.map((member, index) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-400 w-6">
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`}
                    </span>
                    <span className="text-lg">{member.avatar}</span>
                    <p className="text-sm font-medium text-gray-900">{member.name}</p>
                  </div>
                  <span className="text-sm font-bold text-indigo-600">{member.points} pts</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
