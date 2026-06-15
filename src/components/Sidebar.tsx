"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: "🏠" },
  { href: "/tasks", label: "Tâches", icon: "✅" },
  { href: "/calendar", label: "Calendrier", icon: "📅" },
  { href: "/shopping", label: "Courses", icon: "🛒" },
];

const adminItems = [
  { href: "/admin", label: "Administration", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const basePath = "/familia";
  const allItems = session?.user?.role === "ADMIN"
    ? [...navItems, ...adminItems]
    : navItems;

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-indigo-600 text-white p-2 rounded-lg shadow-lg"
      >
        {mobileOpen ? "✕" : "☰"}
      </button>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-white border-r border-gray-200 flex flex-col
        transform transition-transform duration-200
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-indigo-600">Familia</h1>
          {session?.user?.familyName && (
            <p className="text-sm text-gray-500 mt-1">{session.user.familyName}</p>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {allItems.map((item) => {
            const fullHref = `${basePath}${item.href}`;
            const isActive = pathname === fullHref;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {session?.user && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 px-4 py-2">
              <span className="text-2xl">{session.user.avatar}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session.user.name}
                </p>
                <p className="text-xs text-indigo-600 font-semibold">
                  {session.user.points} pts
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: `${basePath}/login` })}
              className="mt-2 w-full px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
            >
              Se déconnecter
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
