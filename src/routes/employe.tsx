import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  CalendarDays, CheckCircle, ChevronLeft, ChevronRight,
  Clock, CreditCard, UserCheck, XCircle,
} from "lucide-react";
import { useDemandesConge, type StatutConge } from "@/hooks/useDemandesConge";

export const Route = createFileRoute("/employe")({
  head: () => ({
    meta: [
      { title: "Mon Espace — PostLab" },
      { name: "description", content: "Espace employé : paie, congés et présences." },
    ],
  }),
  component: EmployePage,
});

// ── Données employés ─────────────────────────────────────────────────────────
const EMPLOYES = [
  { nom: "Awa Ndiaye",    poste: "Comptable",     contrat: "CDI",   brut: 350_000, cadre: false, marie: true,  enfants: 2 },
  { nom: "Modou Fall",    poste: "Commercial",    contrat: "CDD",   brut: 280_000, cadre: false, marie: false, enfants: 0 },
  { nom: "Ibrahima Sarr", poste: "Stagiaire",     contrat: "Stage", brut: 120_000, cadre: false, marie: false, enfants: 0 },
  { nom: "Aïssatou Ba",   poste: "Développeuse",  contrat: "CDI",   brut: 450_000, cadre: true,  marie: false, enfants: 1 },
  { nom: "Cheikh Diop",   poste: "Magasinier",    contrat: "CDD",   brut: 200_000, cadre: false, marie: true,  enfants: 3 },
  { nom: "Fatou Sow",     poste: "Assistante RH", contrat: "CDI",   brut: 320_000, cadre: false, marie: false, enfants: 1 },
];

// ── Calcul paie ───────────────────────────────────────────────────────────────
const BAREMES = [
  { seuil: 75_000,   taux: 0 },
  { seuil: 230_000,  taux: 0.20 },
  { seuil: 500_000,  taux: 0.30 },
  { seuil: 833_333,  taux: 0.35 },
  { seuil: Infinity, taux: 0.40 },
];

function calculerPayslip(e: typeof EMPLOYES[0]) {
  const ipresRG  = Math.min(e.brut, 600_000) * 0.056;
  const ipresRC  = e.cadre ? Math.min(e.brut, 1_500_000) * 0.024 : 0;
  const ipresTotal = ipresRG + ipresRC;
  const abattement = Math.min(Math.max(e.brut * 0.20, 20_000), 75_000);
  const revImposable = Math.max(0, e.brut - ipresTotal - abattement);
  const parts = 1 + (e.marie ? 0.5 : 0) + e.enfants * 0.5;
  const annuelParPart = (revImposable * 12) / parts;
  let tax = 0; let prev = 0;
  for (const { seuil, taux } of BAREMES) {
    if (annuelParPart <= prev) break;
    tax += (Math.min(annuelParPart, seuil) - prev) * taux;
    prev = seuil;
  }
  const its = Math.max(0, (tax * parts) / 12);
  return { ipresTotal, its, net: Math.max(0, e.brut - ipresTotal - its) };
}

function f(n: number) { return Math.round(n).toLocaleString("fr-FR") + " FCFA"; }

// ── Types présences ───────────────────────────────────────────────────────────
type Etat = "present" | "absent" | "conge";
const ETATS_CFG = [
  { val: "present" as Etat, label: "Présent",  color: "bg-green-100 text-green-700 border-green-200" },
  { val: "absent"  as Etat, label: "Absent",   color: "bg-red-100 text-red-600 border-red-200" },
  { val: "conge"   as Etat, label: "Congé",    color: "bg-orange-100 text-orange-600 border-orange-200" },
];

const MOIS_NOMS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

function joursOuvrables(annee: number, mois: number) {
  let count = 0;
  const d = new Date(annee, mois, 1);
  while (d.getMonth() === mois) { if (d.getDay() !== 0 && d.getDay() !== 6) count++; d.setDate(d.getDate() + 1); }
  return count;
}

function badgeStatut(s: StatutConge) {
  if (s === "Acceptée") return "bg-green-100 text-green-700 border-green-200";
  if (s === "Refusée")  return "bg-red-100 text-red-600 border-red-200";
  return "bg-orange-100 text-orange-600 border-orange-200";
}

function iconStatut(s: StatutConge) {
  if (s === "Acceptée") return <CheckCircle className="h-4 w-4 text-green-600" />;
  if (s === "Refusée")  return <XCircle className="h-4 w-4 text-red-500" />;
  return <Clock className="h-4 w-4 text-orange-500" />;
}

// ── Composant principal ───────────────────────────────────────────────────────
function EmployePage() {
  const today = new Date();
  const [mode, setMode]           = useState<"employe" | "rh">("employe");
  const [actif, setActif]         = useState(EMPLOYES[0].nom);
  const [onglet, setOnglet]       = useState<"paie" | "conges" | "presences">("paie");
  const { demandes, ajouterDemande, changerStatut } = useDemandesConge();
  const [form, setForm]           = useState({ dateDebut: "", dateFin: "", raison: "" });
  const [formMsg, setFormMsg]     = useState<string | null>(null);
  const [presences, setPresences] = useState<Record<string, Etat>>({});
  const [moisP, setMoisP]         = useState(today.getMonth());
  const [anneeP, setAnneeP]       = useState(today.getFullYear());

  const employe = EMPLOYES.find(e => e.nom === actif) ?? EMPLOYES[0];
  const payslip = calculerPayslip(employe);

  function presKey(nom: string) { return `${anneeP}-${moisP}-${nom}`; }
  function getPresence(nom: string): Etat { return presences[presKey(nom)] ?? "present"; }
  function cyclePresence(nom: string) {
    const ordre: Etat[] = ["present", "absent", "conge"];
    const idx = ordre.indexOf(getPresence(nom));
    setPresences(p => ({ ...p, [presKey(nom)]: ordre[(idx + 1) % ordre.length] }));
  }
  function navMois(d: number) {
    let m = moisP + d, a = anneeP;
    if (m < 0) { m = 11; a--; } if (m > 11) { m = 0; a++; }
    setMoisP(m); setAnneeP(a);
  }

  function soumettreConge() {
    if (!form.dateDebut || !form.dateFin) return;
    if (form.dateFin < form.dateDebut) { setFormMsg("La date de fin doit être après la date de début."); return; }
    ajouterDemande({ employe: actif, dateDebut: form.dateDebut, dateFin: form.dateFin, raison: form.raison || "Sans motif précisé" });
    setForm({ dateDebut: "", dateFin: "", raison: "" });
    setFormMsg("✅ Demande envoyée — en attente de validation RH.");
    setTimeout(() => setFormMsg(null), 4000);
  }

  const mesDemandes    = demandes.filter(d => d.employe === actif);
  const demandesAttente = demandes.filter(d => d.statut === "En attente");
  const joursOuvr      = joursOuvrables(anneeP, moisP);

  const tabs = [
    { id: "paie"      as const, label: "💰 Paie",      icon: CreditCard   },
    { id: "conges"    as const, label: "🌴 Congés",    icon: CalendarDays },
    { id: "presences" as const, label: "📋 Présences", icon: UserCheck    },
  ];

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 md:px-8">

      {/* En-tête mode + sélection */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">
            {mode === "employe" ? "Mon Espace" : "Espace RH — Employés"}
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            {mode === "employe" ? `Connecté en tant que ${actif}` : "Vue gestionnaire — accès complet"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <div className="flex overflow-hidden rounded-lg border border-border">
            {(["employe", "rh"] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={"px-4 py-2 text-xs font-semibold transition " +
                  (mode === m ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted")}>
                {m === "employe" ? "👤 Employé" : "🏢 Gestionnaire RH"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sélecteur d'employé */}
      <div className="mt-4 flex items-center gap-3">
        <label className="text-sm font-medium shrink-0">
          {mode === "employe" ? "Je suis :" : "Employé consulté :"}
        </label>
        <select value={actif} onChange={e => setActif(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition">
          {EMPLOYES.map(e => <option key={e.nom}>{e.nom}</option>)}
        </select>
      </div>

      {/* Onglets */}
      <div className="mt-6 flex gap-1 rounded-xl border border-border bg-muted/30 p-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setOnglet(t.id)}
            className={"flex-1 rounded-lg py-2 text-sm font-medium transition relative " +
              (onglet === t.id ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
            {t.label}
            {t.id === "conges" && mode === "rh" && demandesAttente.length > 0 && (
              <span className="absolute -top-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                {demandesAttente.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── ONGLET PAIE ────────────────────────────────────────────────────── */}
      {onglet === "paie" && (
        <div className="mt-5">
          {mode === "employe" ? (
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold">{employe.nom}</p>
                  <p className="text-sm text-muted-foreground">{employe.poste} · {employe.contrat}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Juin 2026
                </span>
              </div>
              <div className="mt-5 divide-y divide-border">
                {[
                  { label: "Salaire brut",  val: employe.brut,       accent: false, signe: " " },
                  { label: "IPRES salarié", val: payslip.ipresTotal, accent: false, signe: "−" },
                  { label: "IR / ITS",      val: payslip.its,        accent: false, signe: "−" },
                ].map(r => (
                  <div key={r.label} className="flex justify-between py-2.5 text-sm">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="tabular-nums">{r.signe} {f(r.val)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-4">
                  <span className="text-base font-bold">Net à payer</span>
                  <span className="text-xl font-bold text-primary tabular-nums">{f(payslip.net)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {["Employé","Poste","Brut","IPRES","IR","Net"].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-semibold text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {EMPLOYES.map(e => {
                    const p = calculerPayslip(e);
                    return (
                      <tr key={e.nom} className={e.nom === actif ? "bg-primary/5" : "hover:bg-muted/20 transition-colors"}>
                        <td className="px-4 py-3 font-medium">{e.nom}</td>
                        <td className="px-4 py-3 text-muted-foreground">{e.poste}</td>
                        <td className="px-4 py-3 tabular-nums">{f(e.brut)}</td>
                        <td className="px-4 py-3 tabular-nums text-muted-foreground">{f(p.ipresTotal)}</td>
                        <td className="px-4 py-3 tabular-nums text-muted-foreground">{f(p.its)}</td>
                        <td className="px-4 py-3 font-semibold text-primary tabular-nums">{f(p.net)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── ONGLET CONGÉS ──────────────────────────────────────────────────── */}
      {onglet === "conges" && (
        <div className="mt-5 flex flex-col gap-5">
          {mode === "employe" ? (
            <>
              {/* Formulaire demande */}
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="font-semibold">Nouvelle demande de congé</p>
                <form onSubmit={(e) => { e.preventDefault(); soumettreConge(); }} className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Date de début</label>
                    <input type="date" required value={form.dateDebut}
                      onChange={e => setForm(f => ({ ...f, dateDebut: e.target.value }))}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Date de fin</label>
                    <input type="date" required value={form.dateFin}
                      onChange={e => setForm(f => ({ ...f, dateFin: e.target.value }))}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Motif (optionnel)</label>
                    <input type="text" placeholder="Ex : congés annuels, raison médicale…" value={form.raison}
                      onChange={e => setForm(f => ({ ...f, raison: e.target.value }))}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition" />
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-3">
                    <button type="submit"
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
                      Envoyer la demande
                    </button>
                    {formMsg && <p className="text-xs text-green-600">{formMsg}</p>}
                  </div>
                </form>
              </div>

              {/* Mes demandes */}
              <div>
                <p className="text-sm font-semibold mb-3">Mes demandes ({mesDemandes.length})</p>
                {mesDemandes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune demande pour le moment.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {mesDemandes.map(d => (
                      <div key={d.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                        {iconStatut(d.statut)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            {d.dateDebut} → {d.dateFin}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{d.raison}</p>
                        </div>
                        <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${badgeStatut(d.statut)}`}>
                          {d.statut}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {demandesAttente.length > 0 && (
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                  <p className="text-sm font-semibold text-orange-700">
                    {demandesAttente.length} demande{demandesAttente.length > 1 ? "s" : ""} en attente de validation
                  </p>
                </div>
              )}
              <div className="flex flex-col gap-3">
                {demandes.map(d => (
                  <div key={d.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{d.employe}</p>
                        <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${badgeStatut(d.statut)}`}>
                          {d.statut}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {d.dateDebut} → {d.dateFin} · {d.raison}
                      </p>
                    </div>
                    {d.statut === "En attente" && (
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => changerStatut(d.id, "Acceptée")}
                          className="flex items-center gap-1.5 rounded-lg border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 transition hover:bg-green-100">
                          <CheckCircle className="h-3.5 w-3.5" /> Accepter
                        </button>
                        <button onClick={() => changerStatut(d.id, "Refusée")}
                          className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100">
                          <XCircle className="h-3.5 w-3.5" /> Refuser
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── ONGLET PRÉSENCES ───────────────────────────────────────────────── */}
      {onglet === "presences" && (
        <div className="mt-5 flex flex-col gap-4">
          {/* Navigateur mois */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4">
            <button onClick={() => navMois(-1)} className="rounded-lg p-1.5 hover:bg-muted transition">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="text-center">
              <p className="text-base font-bold">{MOIS_NOMS[moisP]} {anneeP}</p>
              <p className="text-xs text-muted-foreground">{joursOuvr} jours ouvrables</p>
            </div>
            <button onClick={() => navMois(1)} className="rounded-lg p-1.5 hover:bg-muted transition">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {mode === "employe" ? (
            /* Vue employé — mes présences */
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold mb-4">Mes présences — {MOIS_NOMS[moisP]} {anneeP}</p>
              {(() => {
                const etat = getPresence(actif);
                const cfg  = ETATS_CFG.find(c => c.val === etat)!;
                return (
                  <div className="flex items-center gap-4">
                    <div className={`rounded-full border px-4 py-2 text-sm font-semibold ${cfg.color}`}>
                      {cfg.label}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {etat === "present"
                        ? `${joursOuvr} jours ouvrables travaillés`
                        : etat === "absent"
                        ? "Marqué absent ce mois"
                        : "En congé ce mois"}
                    </div>
                  </div>
                );
              })()}
              <div className="mt-4 grid grid-cols-3 gap-3">
                {ETATS_CFG.map(cfg => (
                  <div key={cfg.val} className={`rounded-lg border p-3 text-center ${cfg.color}`}>
                    <p className="text-lg font-bold">
                      {getPresence(actif) === cfg.val ? joursOuvr : 0}
                    </p>
                    <p className="text-xs">{cfg.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Vue RH — gestion présences */
            <>
              <div className="grid grid-cols-3 gap-3">
                {ETATS_CFG.map(cfg => ({
                  ...cfg,
                  count: EMPLOYES.filter(e => getPresence(e.nom) === cfg.val).length,
                })).map(cfg => (
                  <div key={cfg.val} className={`rounded-xl border p-3 text-center ${cfg.color}`}>
                    <p className="text-2xl font-bold tabular-nums">{cfg.count}</p>
                    <p className="text-xs">{cfg.label}</p>
                  </div>
                ))}
              </div>

              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="px-4 py-3 text-left font-semibold">Employé</th>
                      <th className="px-4 py-3 text-center font-semibold">Statut</th>
                      <th className="px-4 py-3 text-center font-semibold hidden sm:table-cell">Jours</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {EMPLOYES.map(e => {
                      const etat = getPresence(e.nom);
                      const cfg  = ETATS_CFG.find(c => c.val === etat)!;
                      return (
                        <tr key={e.nom} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-medium">{e.nom}
                            <span className="ml-2 text-xs text-muted-foreground">{e.poste}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => cyclePresence(e.nom)}
                              className={`rounded-full border px-4 py-1 text-xs font-semibold transition hover:opacity-80 ${cfg.color}`}
                              title="Cliquer pour changer">
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
              <p className="text-xs text-muted-foreground">Cliquez sur un badge pour le faire passer : Présent → Absent → Congé</p>
            </>
          )}
        </div>
      )}
    </section>
  );
}
