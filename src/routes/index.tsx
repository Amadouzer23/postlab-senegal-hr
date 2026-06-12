import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PostLab — Paie & RH pour PME sénégalaises" },
      { name: "description", content: "Centralisez paie, contrats, congés et présences. Ne ratez plus jamais une échéance." },
    ],
  }),
  component: Index,
});

const stats = [
  { value: "90%", label: "des PME sénégalaises sans DRH dédié" },
  { value: "4", label: "cotisations automatisées : SMIG, IPRES, CSS, IR" },
  { value: "0", label: "échéance ratée" },
];

function Index() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-8 md:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              Conforme Code du Travail sénégalais 🇸🇳
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground md:text-6xl">
              La paie et la RH, <span className="text-primary">enfin sereines</span> pour votre PME.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground md:text-xl">
              PostLab centralise paie, contrats, congés et présences — et vous alerte avant chaque échéance.
              Pensé pour les PME dakaroises sans DRH dédié.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/employes" className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90">
                Je gère la RH
              </Link>
              <Link to="/contact" className="inline-flex items-center justify-center rounded-md border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary">
                Je suis dirigeant
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-3 md:px-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center md:text-left">
              <div className="text-4xl font-bold text-primary md:text-5xl">{s.value}</div>
              <p className="mt-2 text-sm text-muted-foreground md:text-base">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: "📑", title: "Contrats & échéances", desc: "Alertes automatiques avant chaque fin de CDD ou de stage." },
            { icon: "💰", title: "Paie conforme", desc: "SMIG, IPRES, CSS et IR calculés pour chaque bulletin." },
            { icon: "🌴", title: "Congés & présences", desc: "Soldes mis à jour en temps réel, validations en un clic." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-6 transition hover:border-primary/40 hover:shadow-md">
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-3 text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
