import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/saisie-rh")({
  head: () => ({
    meta: [
      { title: "Saisie RH — PostLab" },
      { name: "description", content: "Générez des fiches RH à partir de vos données réelles." },
    ],
  }),
  component: SaisieRHPage,
});

function SaisieRHPage() {
  const [donnees, setDonnees] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!donnees.trim() || !question.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch("https://api.dify.ai/v1/workflows/run", {
        method: "POST",
        headers: {
          Authorization: "Bearer app-0QigyZdWhvfJrZlkhjvQRzZz",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: { query: question, donnees_rh: donnees },
          response_mode: "blocking",
          user: "postlab-rh",
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) throw new Error("network");
      const data = await res.json();
      const text = data?.data?.outputs?.text ?? "Aucune réponse reçue.";
      setResult(text);
    } catch (err) {
      clearTimeout(timeout);
      if ((err as Error).name === "AbortError") {
        setError("❌ Erreur — réessayer");
      } else {
        setError("❌ Erreur — réessayer");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 md:px-8">
      <h1 className="text-3xl font-bold md:text-4xl" style={{ color: "#1565C0" }}>
        💼 Saisie RH
      </h1>
      <p className="mt-2 text-muted-foreground">
        Gestionnaire RH — Données réelles de l'entreprise
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="space-y-2">
          <label htmlFor="donnees" className="block text-sm font-semibold">
            Données RH observées
          </label>
          <textarea
            id="donnees"
            rows={6}
            value={donnees}
            onChange={(e) => setDonnees(e.target.value)}
            placeholder="Ex: TECHIA 15/06/2026 — Awa Ndiaye CDI salaire brut 250000 ; Modou Fall CDD fin 30/04/2026"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="question" className="block text-sm font-semibold">
            Votre question
          </label>
          <input
            id="question"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ex: Quelles cotisations pour ce salaire ?"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !donnees.trim() || !question.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          style={{ backgroundColor: "#1565C0" }}
        >
          {loading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
          {loading ? "⏳ Génération en cours..." : "💼 Générer la fiche RH"}
        </button>
      </form>

      {(loading || result || error) && (
        <div className="mt-6 rounded-lg border border-border bg-muted p-5 text-sm">
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
              <span>⏳ Génération en cours...</span>
            </div>
          )}
          {error && !loading && (
            <p className="font-medium text-danger" role="alert">
              {error}
            </p>
          )}
          {result && !loading && (
            <div className="whitespace-pre-line text-foreground">{result}</div>
          )}
        </div>
      )}
    </section>
  );
}
