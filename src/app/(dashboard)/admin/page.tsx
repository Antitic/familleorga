"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  points: number;
  createdAt: string;
}

const avatars = ["👤", "👨", "👩", "👦", "👧", "👶", "🧔", "👱", "👸", "🦸", "🧑‍🍳", "🧑‍🎓", "🧑‍💻", "🧑‍🎨"];

export default function AdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "MEMBER", avatar: "👤",
  });

  useEffect(() => {
    if (session?.user?.role !== "ADMIN") {
      router.push("/familia/dashboard");
      return;
    }
    loadMembers();
  }, [session, router]);

  const loadMembers = () => {
    fetch("/familia/api/users").then(r => r.json()).then(d => Array.isArray(d) && setMembers(d));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      const body: any = { name: form.name, email: form.email, role: form.role, avatar: form.avatar };
      if (form.password) body.password = form.password;
      await fetch(`/familia/api/users/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      const res = await fetch("/familia/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Erreur");
        return;
      }
    }

    resetForm();
    loadMembers();
  };

  const resetForm = () => {
    setForm({ name: "", email: "", password: "", role: "MEMBER", avatar: "👤" });
    setShowForm(false);
    setEditingId(null);
  };

  const startEdit = (member: Member) => {
    setForm({ name: member.name, email: member.email, password: "", role: member.role, avatar: member.avatar });
    setEditingId(member.id);
    setShowForm(true);
  };

  const deleteMember = async (id: string) => {
    if (!confirm("Supprimer ce membre ?")) return;
    const res = await fetch(`/familia/api/users/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Erreur");
      return;
    }
    loadMembers();
  };

  if (session?.user?.role !== "ADMIN") return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="page-title">Administration</h1>
          <p className="page-subtitle">Gérer les membres de la famille</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: "", email: "", password: "", role: "MEMBER", avatar: "👤" }); }}
          className="btn-primary flex items-center gap-2"
        >
          <span className="text-lg">👥</span> Ajouter un membre
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card-static p-6 space-y-5 animate-bounce-soft">
          <h3 className="font-bold text-lg" style={{ color: "var(--foreground)" }}>
            {editingId ? "✏️ Modifier le membre" : "✨ Nouveau membre"}
          </h3>

          <div>
            <label className="label">Avatar</label>
            <div className="flex gap-2 flex-wrap">
              {avatars.map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setForm({ ...form, avatar: a })}
                  className={`text-2xl p-2.5 rounded-xl transition-all duration-300 ${
                    form.avatar === a
                      ? "bg-indigo-100 dark:bg-indigo-500/20 ring-2 ring-indigo-500 scale-110 shadow-lg"
                      : "hover:bg-[var(--background)] hover:scale-105"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Nom *</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="label">Email *</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="label">
                Mot de passe {editingId ? "(laisser vide pour ne pas changer)" : "*"}
              </label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input-field" required={!editingId} />
            </div>
            <div>
              <label className="label">Rôle</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="input-field">
                <option value="MEMBER">👤 Membre</option>
                <option value="ADMIN">👑 Administrateur</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" className="btn-primary">
              {editingId ? "Modifier" : "Créer"}
            </button>
            <button type="button" onClick={resetForm} className="btn-secondary">Annuler</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {members.map((member, i) => (
          <div
            key={member.id}
            className="card-static p-4 flex items-center gap-4 animate-slide-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-500/20 dark:to-purple-500/20 flex items-center justify-center text-3xl shadow-inner">
              {member.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold" style={{ color: "var(--foreground)" }}>{member.name}</p>
                <span className={`badge ${
                  member.role === "ADMIN"
                    ? "bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400"
                }`}>
                  {member.role === "ADMIN" ? "👑 Admin" : "👤 Membre"}
                </span>
              </div>
              <p className="text-sm truncate" style={{ color: "var(--muted)" }}>{member.email}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-extrabold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                {member.points}
              </p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>points</p>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <button
                onClick={() => startEdit(member)}
                className="p-2.5 rounded-xl transition-all duration-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-indigo-500 hover:scale-105"
              >
                ✏️
              </button>
              {member.id !== session?.user?.id && (
                <button
                  onClick={() => deleteMember(member.id)}
                  className="p-2.5 rounded-xl transition-all duration-300 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 hover:scale-105"
                >
                  🗑
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
