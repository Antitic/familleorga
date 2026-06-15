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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Liste de Courses</h1>
          <p className="text-gray-500 mt-1">{unchecked} article{unchecked > 1 ? "s" : ""} restant{unchecked > 1 ? "s" : ""} sur {total}</p>
        </div>
        {items.some(i => i.checked) && (
          <button onClick={clearChecked} className="text-sm text-red-600 hover:text-red-700 font-medium transition">
            Supprimer cochés
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Article</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Ex: Lait, Pain..."
              required
            />
          </div>
          <div className="w-20">
            <label className="block text-sm font-medium text-gray-700 mb-1">Qté</label>
            <input
              type="text"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition shrink-0">
            Ajouter
          </button>
        </div>
      </form>

      {total > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${total > 0 ? ((total - unchecked) / total) * 100 : 0}%` }}
          />
        </div>
      )}

      <div className="space-y-4">
        {Object.entries(grouped).map(([cat, catItems]) => (
          <div key={cat} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700">{cat}</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {catItems.map(item => (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition">
                  <button
                    onClick={() => toggleItem(item.id, item.checked)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                      item.checked ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-300"
                    }`}
                  >
                    {item.checked && "✓"}
                  </button>
                  <div className="flex-1">
                    <span className={`text-sm ${item.checked ? "line-through text-gray-400" : "text-gray-900"}`}>
                      {item.name}
                    </span>
                    {item.quantity !== "1" && (
                      <span className="ml-2 text-xs text-gray-500">x{item.quantity}</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{item.addedBy.name}</span>
                  <button onClick={() => deleteItem(item.id)} className="text-gray-400 hover:text-red-500 transition">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {total === 0 && (
          <div className="text-center py-12 text-gray-500">
            La liste de courses est vide
          </div>
        )}
      </div>
    </div>
  );
}
