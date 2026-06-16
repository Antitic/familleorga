"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email ou mot de passe incorrect");
    } else {
      router.push("/familia/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 30%, #ec4899 60%, #f59e0b 100%)" }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-white/10 animate-float" />
        <div className="absolute top-20 right-20 w-60 h-60 rounded-full bg-white/10 animate-float-delayed" />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 rounded-full bg-white/10 animate-float-slow" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-white/5 animate-float" />
        <div className="absolute top-1/2 left-10 w-20 h-20 rounded-2xl bg-white/10 rotate-45 animate-float-delayed" />
        <div className="absolute top-10 left-1/2 w-16 h-16 rounded-xl bg-white/10 rotate-12 animate-float-slow" />
      </div>

      <div className="w-full max-w-md mx-4 relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-lg mb-4 shadow-2xl">
            <span className="text-4xl">👨‍👩‍👧‍👦</span>
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-2 tracking-tight">
            Familia
          </h1>
          <p className="text-white/70 font-medium">Organisation familiale</p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-3xl shadow-2xl p-8 space-y-6">
          <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
            Connexion
          </h2>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium animate-bounce-soft border border-red-200 dark:border-red-500/20">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="votre@email.fr"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="label">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Connexion...
              </span>
            ) : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
