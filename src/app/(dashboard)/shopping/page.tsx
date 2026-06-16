"use client";

import { useEffect, useState } from "react";

interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  checked: boolean;
  addedBy: { id: string; name: string };
}

const categories = ["Fruits & Légumes", "Viandes & Poissons", "Produits laitiers", "Boulangerie", "Boissons", "Épicerie", "Hygiène", "Maison", "Autre"];

const categoryIcons: Record<string, string> = {
  "Fruits & Légumes": "🥬",
  "Viandes & Poissons": "🥩",
  "Produits laitiers": "🧀",
  "Boulangerie": "🥖",
  "Boissons": "🥤",
  "Épicerie": "🏪",
  "Hygiène": "🧴",
  "Maison": "🏠",
  "Autre": "📦",
};

export default function ShoppingPage() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [category, setCategory] = useState("Autre");

  useEffect(() => { loadItems(); }, []);

  const loadItems = () => {
    fetch("/familia/api/shopping").then(r => r.json()).then(d => Array.isArray(d) && setItems(d));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await fetch("/familia/api/shopping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, quantity, category }),
    });
    setName("");
    setQuantity("1");
    loadItems();
  };

  const toggleItem = async (id: string, checked: boolean) => {
    await fetch(`/familia/api/shopping/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checked: !checked }),
    });
    loadItems();
  };

  const deleteItem = async (id: string) => {
    await fetch(`/familia/api/shopping/${id}`, { method: "DELETE" });
    loadItems();
  };

  const clearChecked = async () => {
    const checked = items.filter(i => i.checked);
    await Promise.all(checked.map(i => fetch(`/familia/api/shopping/${i.id}`, { method: "DELETE" })));
    loadItems();
  };

  const grouped = categories.reduce((acc, cat) => {
    const catItems = items.filter(i => i.category === cat);
    if (catItems.length > 0) acc[cat] = catItems;
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  const unchecked = items.filter(i => !i.checked).length;
  const total = items.length;
  const progress = total > 0 ? ((total - unchecked) / total) * 100 : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="page-title">Liste de Courses</h1>
          <p className="page-subtitle">{unchecked} article{unchecked > 1 ? "s" : ""} restant{unchecked > 1 ? "s" : ""} sur {total}</p>
        </div>
        {items.some(i => i.checked) && (
          <button onClick={clearChecked} className="text-sm text-red-500 hover:text-red-600 font-semibold transition-all flex items-center gap-1.5">
            <span>🧹</span> Supprimer cochés
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="card-static p-5 animate-slide-up">
        <div className="flex gap-3 items-end flex-wrap sm:flex-nowrap">
          <div className="flex-1 min-w-[200px]">
            <label className="label">Article</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="Ex: Lait, Pain..." required />
          </div>
          <div className="w-20">
            <label className="label">Qté</label>
            <input type="text" value={quantity} onChange={e => setQuantity(e.target.value)} className="input-field" />
          </div>
          <div className="w-44">
            <label className="label">Catégorie</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="input-field">
              {categories.map(c => <option key={c} value={c}>{categoryIcons[c]} {c}</option>)}
            </select>
          </div>
          <button type="submit" className="btn-primary shrink-0 flex items-center gap-1.5">
            <span>➕</span> Ajouter
          </button>
        </div>
      </form>

      {total > 0 && (
        <div className="animate-slide-up">
          <div className="flex justify-between text-xs font-bold mb-1.5" style={{ color: "var(--muted-foreground)" }}>
            <span>Progression</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="space-y-4">
        {Object.entries(grouped).map(([cat, catItems], groupIndex) => (
          <div key={cat} className="card-static overflow-hidden animate-slide-up" style={{ animationDelay: `${groupIndex * 80}ms` }}>
            <div className="px-5 py-3 flex items-center gap-2" style={{ background: "var(--background)", borderBottom: "1px solid var(--border)" }}>
              <span className="text-lg">{categoryIcons[cat]}</span>
              <h3 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{cat}</h3>
              <span className="badge bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 ml-auto">
                {catItems.filter(i => !i.checked).length}/{catItems.length}
              </span>
            </div>
            <div>
              {catItems.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-5 py-3 transition-all duration-300 hover:bg-[var(--card-hover)]"
                  style={{ borderBottom: "1px solid var(--border-light)" }}
                >
                  <button
                    onClick={() => toggleItem(item.id, item.checked)}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs transition-all duration-300 ${
                      item.checked
                        ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-500/25 scale-110"
                        : "border-2 hover:border-indigo-400 hover:scale-105"
                    }`}
                    style={!item.checked ? { borderColor: "var(--border)" } : {}}
                  >
                    {item.checked && "✓"}
                  </button>
                  <div className="flex-1">
                    <span className={`text-sm font-medium transition-all ${item.checked ? "line-through opacity-40" : ""}`}
                      style={{ color: "var(--foreground)" }}>
                      {item.name}
                    </span>
                    {item.quantity !== "1" && (
                      <span className="ml-2 badge bg-slate-100 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400">x{item.quantity}</span>
                    )}
                  </div>
                  <span className="text-xs" style={{ color: "var(--muted)" }}>{item.addedBy.name}</span>
                  <button onClick={() => deleteItem(item.id)} className="p-1.5 rounded-lg transition-all duration-300 hover:bg-red-50 dark:hover:bg-red-500/10 text-[var(--muted)] hover:text-red-500">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {total === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <span className="text-5xl block mb-3">🛒</span>
            <p className="font-medium" style={{ color: "var(--muted-foreground)" }}>La liste de courses est vide</p>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Ajoutez des articles ci-dessus</p>
          </div>
        )}
      </div>
    </div>
  );
}
