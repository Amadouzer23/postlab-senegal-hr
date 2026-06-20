import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, FileText, Search, Users } from "lucide-react";
import * as XLSX from "xlsx";

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

type Employe = { nom: string; poste: string; contrat: Contrat; detail: string; statut: Statut; finContrat?: string };

const employes: Employe[] = [
  { nom: "Awa Ndiaye",    poste: "Comptable",     contrat: "CDI",   detail: "Congés 12j",        statut: "À jour" },
  { nom: "Modou Fall",    poste: "Commercial",    contrat: "CDD",   detail: "Fin 31/03/2026",    statut: "Échéance proche", finContrat: "2026-03-31" },
  { nom: "Ibrahima Sarr", poste: "Stagiaire",     contrat: "Stage", detail: "Fin 28/02/2026",    statut: "Échéance proche" },
  { nom: "Aïssatou Ba",   poste: "Développeuse",  contrat: "CDI",   detail: "Congés 18j",        statut: "À jour" },
  { nom: "Cheikh Diop",   poste: "Magasinier",    contrat: "CDD",   detail: "Fin 30/06/2026",    statut: "À jour",          finContrat: "2026-06-30" },
  { nom: "Fatou Sow",     poste: "Assistante RH", contrat: "CDI",   detail: "Congés 8j",         statut: "À jour" },
];

function joursAvantEcheance(dateISO: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const fin = new Date(dateISO);
  return Math.round((fin.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function exporterExcel(liste: Employe[]) {
  const lignes = liste.map((e) => {
    const jours = e.contrat === "CDD" && e.finContrat ? joursAvantEcheance(e.finContrat) : null;
    const statut = jours !== null && jours >= 0 && jours <= 30 ? "Échéance proche" : e.statut;
    return {
      Nom: e.nom,
      Poste: e.poste,
      Contrat: e.contrat,
      "Date de fin": e.finContrat ?? "",
      Statut: statut,
    };
  });

  const ws = XLSX.utils.json_to_sheet(lignes);
  ws["!cols"] = [{ wch: 20 }, { wch: 20 }, { wch: 10 }, { wch: 14 }, { wch: 18 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Employés");
  XLSX.writeFile(wb, "employes.xlsx");
}

const filtres = ["Tous", "CDI", "CDD", "Stage"] as const;
type Filtre = (typeof filtres)[number];

function initiales(nom: string) {
  return nom.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function EmployesPage() {
  const [filtre, setFiltre] = useState<Filtre>("Tous");
  const [recherche, setRecherche] = useState("");

  const terme = recherche.trim().toLowerCase();
  const liste = employes
    .filter((e) => filtre === "Tous" || e.contrat === filtre)
    .filter((e) => !terme || e.nom.toLowerCase().includes(terme) || e.poste.toLowerCase().includes(terme));

  const totalCDD = liste.filter((e) => e.contrat === "CDD").length;
  const echeances30j = liste.filter((e) => {
    if (e.contrat !== "CDD" || !e.finContrat) return false;
    const j = joursAvantEcheance(e.finContrat);
    return j >= 0 && j <= 30;
  }).length;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:px-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold md:text-4xl">Employés</h1>
          <p className="text-muted-foreground">Suivi des contrats et congés</p>
        </div>
        <button
          onClick={() => exporterExcel(liste)}
          className="mt-1 flex shrink-0 items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition hover:border-primary/50 hover:bg-primary/5"
        >
          📥 Exporter en Excel
        </button>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums">{liste.length}</p>
            <p className="text-xs text-muted-foreground">Employés</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums">{totalCDD}</p>
            <p className="text-xs text-muted-foreground">CDD</p>
          </div>
        </div>

        <div className={
          "flex items-center gap-3 rounded-xl border p-4 transition " +
          (echeances30j > 0 ? "border-orange-300 bg-orange-50" : "border-border bg-card")
        }>
          <div className={
            "grid h-10 w-10 shrink-0 place-items-center rounded-full " +
            (echeances30j > 0 ? "bg-orange-100" : "bg-primary/10")
          }>
            <AlertTriangle className={"h-5 w-5 " + (echeances30j > 0 ? "text-orange-500" : "text-primary")} />
          </div>
          <div>
            <p className={"text-2xl font-bold tabular-nums " + (echeances30j > 0 ? "text-orange-600" : "")}>
              {echeances30j}
            </p>
            <p className="text-xs text-muted-foreground">Échéances 30j</p>
          </div>
        </div>
      </div>

      <div className="relative mt-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          type="search"
          placeholder="Rechercher par nom ou poste…"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-4 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
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
          const jours = e.contrat === "CDD" && e.finContrat ? joursAvantEcheance(e.finContrat) : null;
          const echeanceProche = jours !== null && jours >= 0 && jours <= 30;
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
              {echeanceProche ? (
                <span className="shrink-0 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-600 ring-1 ring-orange-300">
                  ⏰ Échéance proche
                </span>
              ) : (
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
              )}
            </article>
          );
        })}
      </div>

    </section>
  );
}
