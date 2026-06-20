import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

type Message = { role: "user" | "bot"; text: string };

export default function AgentIA() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Bonjour 👋 Je suis l'assistant PostLab. Posez-moi une question RH (paie, contrats, congés…)" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setLoading(true);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch("https://api.dify.ai/v1/workflows/run", {
        method: "POST",
        headers: {
          Authorization: "Bearer app-0QigyZdWhvfJrZlkhjvQRzZz",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: { query: text },
          response_mode: "blocking",
          user: "postlab-" + Date.now(),
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) throw new Error("network");
      const data = await res.json();
      const outputs = data?.data?.outputs;
      const reply =
        typeof outputs === "string"
          ? outputs
          : outputs?.text ?? outputs?.answer ?? outputs?.output ?? "Aucune réponse reçue.";

      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } catch (err) {
      clearTimeout(timeout);
      const msg =
        (err as Error).name === "AbortError"
          ? "La réponse prend trop de temps — réessayez."
          : "Service temporairement indisponible.";
      setMessages((prev) => [...prev, { role: "bot", text: "⚠ " + msg }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[520px] w-[340px] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl sm:w-[380px]">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-border bg-primary px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <div>
                <p className="text-sm font-semibold text-primary-foreground">Assistant PostLab</p>
                <p className="text-xs text-primary-foreground/70">IA · Droit du travail sénégalais</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-1 text-primary-foreground/80 transition hover:bg-white/20"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={"flex " + (m.role === "user" ? "justify-end" : "justify-start")}>
                {m.role === "bot" && (
                  <div className="mr-2 mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-sm">
                    🤖
                  </div>
                )}
                <div
                  className={
                    "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed " +
                    (m.role === "user"
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-muted text-foreground")
                  }
                >
                  <p className="whitespace-pre-wrap break-words">{m.text}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="mr-2 mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-sm">
                  🤖
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2 border-t border-border bg-background px-3 py-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Votre question RH…"
              disabled={loading}
              className="flex-1 rounded-full border border-border bg-muted px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50 transition"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Envoyer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:scale-105 hover:shadow-xl"
        aria-label={open ? "Fermer le chat" : "Ouvrir l'assistant IA"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
