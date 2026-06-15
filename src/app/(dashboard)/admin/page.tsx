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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
          <p className="text-gray-500 mt-1">Gérer les membres de la famille</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: "", email: "", password: "", role: "MEMBER", avatar: "👤" }); }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          + Ajouter un membre
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">
            {editingId ? "Modifier le membre" : "Nouveau membre"}
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
            <div className="flex gap-2 flex-wrap">
              {avatars.map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setForm({ ...form, avatar: a })}
                  className={`text-2xl p-2 rounded-lg transition ${
                    form.avatar === a ? "bg-indigo-100 ring-2 ring-indigo-500" : "hover:bg-gray-100"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe {editingId ? "(laisser vide pour ne pas changer)" : "*"}
              </label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required={!editingId}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
              <select
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="MEMBER">Membre</option>
                <option value="ADMIN">Administrateur</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">
              {editingId ? "Modifier" : "Créer"}
            </button>
            <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-600 hover:text-gray-900 transition">
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Membre</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Rôle</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Points</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map(member => (
              <tr key={member.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{member.avatar}</span>
                    <span className="text-sm font-medium text-gray-900">{member.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{member.email}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    member.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"
                  }`}>
                    {member.role === "ADMIN" ? "Admin" : "Membre"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-indigo-600">{member.points}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => startEdit(member)}
                      className="text-sm px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                    >
                      Modifier
                    </button>
                    {member.id !== session?.user?.id && (
                      <button
                        onClick={() => deleteMember(member.id)}
                        className="text-sm px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
