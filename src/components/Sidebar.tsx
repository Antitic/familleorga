"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { useTheme } from "./ThemeProvider";

const navItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: "🏠", gradient: "from-blue-500 to-cyan-400" },
  { href: "/tasks", label: "Tâches", icon: "✅", gradient: "from-emerald-500 to-teal-400" },
  { href: "/calendar", label: "Calendrier", icon: "📅", gradient: "from-purple-500 to-pink-400" },
  { href: "/shopping", label: "Courses", icon: "🛒", gradient: "from-orange-500 to-amber-400" },
];

const adminItems = [
  { href: "/admin", label: "Administration", icon: "⚙️", gradient: "from-rose-500 to-red-400" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const basePath = "/familia";
  const allItems = session?.user?.role === "ADMIN"
    ? [...navItems, ...adminItems]
    : navItems;

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
        style={{ background: "var(--gradient-1)" }}
      >
        <span className="text-white text-lg">{mobileOpen ? "✕" : "☰"}</span>
      </button>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30 animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-72 flex flex-col
        transform transition-all duration-300 ease-out
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
        style={{ background: "var(--sidebar-bg)" }}
      >
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-xl">
              👨‍👩‍👧‍👦
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">Familia</h1>
              {session?.user?.familyName && (
                <p className="text-xs text-white/60 font-medium">{session.user.familyName}</p>
              )}
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {allItems.map((item, index) => {
            const fullHref = `${basePath}${item.href}`;
            const isActive = pathname === fullHref;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold
                  transition-all duration-300 group
                  ${isActive
                    ? "bg-white/20 text-white shadow-lg shadow-black/10 backdrop-blur-sm"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                  }
                `}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className={`text-lg transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse-soft" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 space-y-3">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all duration-300"
          >
            <span className="text-lg transition-transform duration-500" style={{ transform: theme === "dark" ? "rotate(180deg)" : "rotate(0deg)" }}>
              {theme === "dark" ? "☀️" : "🌙"}
            </span>
            <span>{theme === "dark" ? "Mode clair" : "Mode sombre"}</span>
          </button>

          {session?.user && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
                  {session.user.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">
                    {session.user.name}
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-300 text-xs">⭐</span>
                    <p className="text-xs text-yellow-300 font-bold">
                      {session.user.points} pts
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: `${basePath}/login` })}
                className="mt-3 w-full px-3 py-2 text-xs font-medium text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 text-left"
              >
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
