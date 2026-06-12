import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — PostLab" },
      { name: "description", content: "Contactez l'équipe PostLab à Dakar." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:px-8">
      <div className="grid gap-10 md:grid-cols-[1.2fr_1fr]">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">Parlons de votre RH</h1>
          <p className="mt-3 text-muted-foreground">
            Une question, une démo ou un devis ? Notre équipe à Dakar vous répond sous 24h ouvrées.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-xl border border-border bg-card p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nom complet" name="nom" placeholder="Awa Ndiaye" />
              <Field label="E-mail" name="email" type="email" placeholder="awa@entreprise.sn" />
            </div>
            <Field label="Téléphone" name="tel" type="tel" placeholder="+221 77 000 00 00" />
            <div>
              <label className="mb-1.5 block text-sm font-medium">Message</label>
              <textarea
                name="message"
                required
                rows={5}
                placeholder="Décrivez votre besoin RH…"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="submit"
              style={{ backgroundColor: "#1565C0" }}
              className="inline-flex w-full items-center justify-center rounded-md px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:opacity-90 md:w-auto"
            >
              Envoyer le message
            </button>
            {sent && (
              <p className="text-sm font-medium text-success">
                ✓ Merci, votre message a été envoyé. Nous revenons vers vous rapidement.
              </p>
            )}
          </form>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Bureau PostLab</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Sicap Liberté 6<br />
              Dakar, Sénégal
            </p>
            <p className="mt-4 text-sm">
              <span className="block font-medium">contact@postlab.sn</span>
              <span className="block text-muted-foreground">+221 33 824 00 00</span>
            </p>
          </div>
          <div className="rounded-xl border border-accent/40 bg-accent/10 p-6">
            <h3 className="font-semibold">Horaires</h3>
            <p className="mt-2 text-sm text-muted-foreground">Lun – Ven · 8h30 – 18h00</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Field({ label, name, type = "text", placeholder }: { label: string; name: string; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <input
        name={name}
        type={type}
        required
        placeholder={placeholder}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
