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
  const [actif, setActif]         = useState(EMPLOYES[0].nom);
  const [onglet, setOnglet]       = useState<"paie" | "conges" | "presences">("paie");
  const { demandes, ajouterDemande } = useDemandesConge();
  const [form, setForm]           = useState({ dateDebut: "", dateFin: "", raison: "" });
  const [formMsg, setFormMsg]     = useState<string | null>(null);
  const [presences] = useState<Record<string, Etat>>({});
  const [moisP, setMoisP]         = useState(today.getMonth());
  const [anneeP, setAnneeP]       = useState(today.getFullYear());

  const employe = EMPLOYES.find(e => e.nom === actif) ?? EMPLOYES[0];
  const payslip = calculerPayslip(employe);

  function presKey(nom: string) { return `${anneeP}-${moisP}-${nom}`; }
  function getPresence(nom: string): Etat { return presences[presKey(nom)] ?? "present"; }
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

  const mesDemandes = demandes.filter(d => d.employe === actif);
  const joursOuvr   = joursOuvrables(anneeP, moisP);

  const tabs = [
    { id: "paie"      as const, label: "💰 Paie",      icon: CreditCard   },
    { id: "conges"    as const, label: "🌴 Congés",    icon: CalendarDays },
    { id: "presences" as const, label: "📋 Présences", icon: UserCheck    },
  ];

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 md:px-8">

      {/* En-tête */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold md:text-4xl">Mon Espace</h1>
        <p className="mt-1 text-muted-foreground text-sm">Connecté en tant que {actif}</p>
      </div>

      {/* Sélecteur d'employé */}
      <div className="mt-4 flex items-center gap-3">
        <label className="text-sm font-medium shrink-0">Je suis :</label>
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
          </button>
        ))}
      </div>

      {/* ── ONGLET PAIE ────────────────────────────────────────────────────── */}
      {onglet === "paie" && (
        <div className="mt-5">
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
                { label: "Salaire brut",  val: employe.brut,       signe: " " },
                { label: "IPRES salarié", val: payslip.ipresTotal, signe: "−" },
                { label: "IR / ITS",      val: payslip.its,        signe: "−" },
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
        </div>
      )}

      {/* ── ONGLET CONGÉS ──────────────────────────────────────────────────── */}
      {onglet === "conges" && (
        <div className="mt-5 flex flex-col gap-5">
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
                      <p className="text-sm font-medium">{d.dateDebut} → {d.dateFin}</p>
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
        </div>
      )}
    </section>
  );
}
