import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import AgentIA from "@/components/AgentIA";

export const Route = createFileRoute("/employes")({
  head: () => ({
    meta: [
      { title: "Employés — PostLab" },
      { name: "description", content: "Suivi des contrats, congés et échéances de votre équipe." },
    ],
  }),
  component: EmployesPage,
});

type Contrat = "CDI" | "CDD" | "Stage";
type Statut = "À jour" | "Échéance proche";

const employes: { nom: string; poste: string; contrat: Contrat; detail: string; statut: Statut }[] = [
  { nom: "Awa Ndiaye",    poste: "Comptable",     contrat: "CDI",   detail: "Congés 12j",        statut: "À jour" },
  { nom: "Modou Fall",    poste: "Commercial",    contrat: "CDD",   detail: "Fin 31/03/2026",    statut: "Échéance proche" },
  { nom: "Ibrahima Sarr", poste: "Stagiaire",     contrat: "Stage", detail: "Fin 28/02/2026",    statut: "Échéance proche" },
  { nom: "Aïssatou Ba",   poste: "Développeuse",  contrat: "CDI",   detail: "Congés 18j",        statut: "À jour" },
  { nom: "Cheikh Diop",   poste: "Magasinier",    contrat: "CDD",   detail: "Fin 30/06/2026",    statut: "À jour" },
  { nom: "Fatou Sow",     poste: "Assistante RH", contrat: "CDI",   detail: "Congés 8j",         statut: "À jour" },
];

const filtres = ["Tous", "CDI", "CDD", "Stage"] as const;
type Filtre = (typeof filtres)[number];

function initiales(nom: string) {
  return nom.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function EmployesPage() {
  const [filtre, setFiltre] = useState<Filtre>("Tous");
  const liste = filtre === "Tous" ? employes : employes.filter((e) => e.contrat === filtre);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold md:text-4xl">Employés</h1>
        <p className="text-muted-foreground">{liste.length} collaborateur·ice·s · suivi des contrats et congés</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {filtres.map((f) => (
          <button
            key={f}
            onClick={() => setFiltre(f)}
            className={
              "rounded-full border px-4 py-1.5 text-sm font-medium transition " +
              (filtre === f
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:border-primary/50")
            }
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {liste.map((e) => {
          const alerte = e.statut === "Échéance proche";
          return (
            <article key={e.nom} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-xl border border-border bg-card p-5 transition hover:shadow-md">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {initiales(e.nom)}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold">{e.nom}</h2>
                <p className="truncate text-sm text-muted-foreground">{e.poste}</p>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{e.contrat}</span> · {e.detail}
                </p>
              </div>
              <span
                className={
                  "shrink-0 rounded-full px-3 py-1 text-xs font-semibold " +
                  (alerte
                    ? "bg-danger/10 text-danger ring-1 ring-danger/30"
                    : "bg-success/10 text-success ring-1 ring-success/30")
                }
              >
                ● {e.statut}
              </span>
            </article>
          );
        })}
      </div>

      <AgentIA />
    </section>
  );
}
