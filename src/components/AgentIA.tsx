import { useState } from "react";

export default function AgentIA() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || loading) return;
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
          inputs: { query },
          response_mode: "blocking",
          user: "postlab-" + Date.now(),
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) throw new Error("network");
      const data = await res.json();
      const outputs = data?.data?.outputs;
      const text =
        typeof outputs === "string"
          ? outputs
          : outputs?.text ?? outputs?.answer ?? outputs?.output ?? JSON.stringify(outputs, null, 2);
      setResult(text || "Aucune réponse reçue.");
    } catch (err) {
      clearTimeout(timeout);
      if ((err as Error).name === "AbortError") {
        setError("La réponse prend trop de temps — réessayez");
      } else {
        setError("Service temporairement indisponible");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-10 rounded-xl border border-border bg-card p-5 md:p-6">
      <div className="flex items-center gap-2">
        <span className="text-xl">🤖</span>
        <h2 className="text-lg font-semibold">Demandez à l'agent PostLab</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Une question sur la paie, un contrat ou les congés ? Notre IA vous répond.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Posez votre question RH (paie, contrat, congé...)"
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          style={{ backgroundColor: "#1565C0" }}
        >
          {loading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
          {loading ? "Recherche..." : "Demander à PostLab"}
        </button>
      </form>

      {(loading || result || error) && (
        <div className="mt-4 rounded-lg bg-muted p-4 text-sm">
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
              <span>Consultation de l'agent IA...</span>
            </div>
          )}
          {error && !loading && (
            <p className="font-medium text-danger" role="alert">
              ⚠ {error}
            </p>
          )}
          {result && !loading && (
            <pre className="whitespace-pre-wrap break-words font-sans text-foreground">{result}</pre>
          )}
        </div>
      )}
    </section>
  );
}
