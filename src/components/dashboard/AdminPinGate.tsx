"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export function AdminPinGate() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (pin.length < 4) {
        setError("Saisissez le code PIN complet.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/admin/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pin }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Code PIN incorrect");
          setPin("");
          return;
        }
        router.refresh();
      } catch {
        setError("Impossible de vérifier le code. Réessayez.");
      } finally {
        setLoading(false);
      }
    },
    [pin, router],
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "#f0ebe4" }}
    >
      <div
        className="w-full max-w-sm bg-white rounded-3xl p-8"
        style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.12)" }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: "#1a1512" }}
        >
          <Lock size={22} color="white" strokeWidth={2} />
        </div>

        <h1
          className="text-center mb-1"
          style={{ fontSize: "1.15rem", fontWeight: 700, color: "#1a1512" }}
        >
          Accès admin
        </h1>
        <p
          className="text-center mb-6"
          style={{ fontSize: "0.82rem", color: "#7a6f65" }}
        >
          Entrez le code PIN pour accéder au dashboard.
        </p>

        <form onSubmit={submit} className="space-y-4">
          <input
            type="password"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, ""));
              setError(null);
            }}
            placeholder="Code PIN"
            maxLength={16}
            autoFocus
            className="w-full px-4 py-3 rounded-xl outline-none text-center tracking-[0.3em]"
            style={{
              background: "#f3f3f5",
              border: error ? "1.5px solid #d4183d" : "1.5px solid transparent",
              fontSize: "1.1rem",
              fontWeight: 600,
              color: "#1a1512",
            }}
          />

          {error && (
            <p style={{ fontSize: "0.78rem", color: "#d4183d", textAlign: "center" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || pin.length === 0}
            className="w-full py-3 rounded-xl transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            style={{
              background: "#1a1512",
              color: "white",
              fontWeight: 700,
              fontSize: "0.9rem",
            }}
          >
            {loading ? "Vérification…" : "Accéder"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => router.push("/")}
          className="w-full mt-4 py-2 text-center transition-opacity hover:opacity-70"
          style={{ fontSize: "0.78rem", color: "#7a6f65", fontWeight: 600 }}
        >
          Retour au mur photo
        </button>
      </div>
    </div>
  );
}
