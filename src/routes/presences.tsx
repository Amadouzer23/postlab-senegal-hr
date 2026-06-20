import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/presences")({
  head: () => ({
    meta: [
      { title: "Présences — PostLab" },
      { name: "description", content: "Suivi mensuel des présences et absences de votre équipe." },
    ],
  }),
  component: PresencesPage,
});

const EMPLOYES = [
  "Awa Ndiaye",
  "Modou Fall",
  "Ibrahima Sarr",
  "Aïssatou Ba",
  "Cheikh Diop",
  "Fatou Sow",
];

const MOIS = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
];

function joursOuvrables(annee: number, mois: number): number {
  let count = 0;
  const date = new Date(annee, mois, 1);
  while (date.getMonth() === mois) {
    const j = date.getDay();
    if (j !== 0 && j !== 6) count++;
    date.setDate(date.getDate() + 1);
  }
  return count;
}

type Etat = "present" | "absent" | "conge";

const ETATS: { val: Etat; label: string; color: string }[] = [
  { val: "present", label: "Présent",  color: "bg-green-100 text-green-700 border-green-200" },
  { val: "absent",  label: "Absent",   color: "bg-red-100 text-red-600 border-red-200" },
  { val: "conge",   label: "Congé",    color: "bg-orange-100 text-orange-600 border-orange-200" },
];

function PresencesPage() {
  const today = new Date();
  const [mois, setMois] = useState(today.getMonth());
  const [annee, setAnnee] = useState(today.getFullYear());
  const [etats, setEtats] = useState<Record<string, Etat>>({});

  function key(nom: string) { return `${annee}-${mois}-${nom}`; }
  function getEtat(nom: string): Etat { return etats[key(nom)] ?? "present"; }
  function cycleEtat(nom: string) {
    const ordre: Etat[] = ["present", "absent", "conge"];
    const idx = ordre.indexOf(getEtat(nom));
    setEtats((prev) => ({ ...prev, [key(nom)]: ordre[(idx + 1) % ordre.length] }));
  }

  function navMois(delta: number) {
    let m = mois + delta;
    let a = annee;
    if (m < 0)  { m = 11; a--; }
    if (m > 11) { m = 0;  a++; }
    setMois(m); setAnnee(a);
  }

  const joursOuvr = joursOuvrables(annee, mois);

  const stats = {
    presents: EMPLOYES.filter((n) => getEtat(n) === "present").length,
    absents:  EMPLOYES.filter((n) => getEtat(n) === "absent").length,
    conges:   EMPLOYES.filter((n) => getEtat(n) === "conge").length,
  };

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 md:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold md:text-4xl">Présences</h1>
        <p className="text-muted-foreground">Suivi mensuel — cliquez sur un statut pour le modifier</p>
      </div>

      {/* Sélecteur de mois */}
      <div className="mt-8 flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4">
        <button onClick={() => navMois(-1)} className="rounded-lg p-1.5 hover:bg-muted transition" aria-label="Mois précédent">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <p className="text-lg font-bold">{MOIS[mois]} {annee}</p>
          <p className="text-xs text-muted-foreground">{joursOuvr} jours ouvrables</p>
        </div>
        <button onClick={() => navMois(1)} className="rounded-lg p-1.5 hover:bg-muted transition" aria-label="Mois suivant">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Compteurs */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center">
          <p className="text-2xl font-bold tabular-nums text-green-700">{stats.presents}</p>
          <p className="text-xs text-green-600">Présents</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center">
          <p className="text-2xl font-bold tabular-nums text-red-600">{stats.absents}</p>
          <p className="text-xs text-red-500">Absents</p>
        </div>
        <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-center">
          <p className="text-2xl font-bold tabular-nums text-orange-600">{stats.conges}</p>
          <p className="text-xs text-orange-500">En congé</p>
        </div>
      </div>

      {/* Tableau */}
      <div className="mt-5 overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left font-semibold">Employé</th>
              <th className="px-4 py-3 text-center font-semibold">Statut — {MOIS[mois]}</th>
              <th className="px-4 py-3 text-center font-semibold hidden sm:table-cell">Jours ouvrables</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {EMPLOYES.map((nom) => {
              const etat = getEtat(nom);
              const cfg = ETATS.find((e) => e.val === etat)!;
              return (
                <tr key={nom} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{nom}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => cycleEtat(nom)}
                      className={`rounded-full border px-4 py-1 text-xs font-semibold transition hover:opacity-80 ${cfg.color}`}
                      title="Cliquer pour changer"
                    >
                      {cfg.label}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground hidden sm:table-cell">
                    {etat === "present" ? joursOuvr : etat === "absent" ? 0 : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Les statuts sont enregistrés localement pour le mois en cours. Cliquez sur un badge pour le faire passer de Présent → Absent → Congé.
      </p>
    </section>
  );
}
