import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarDays, CheckCircle, Clock, Info, XCircle } from "lucide-react";
import { useDemandesConge, type StatutConge } from "@/hooks/useDemandesConge";

export const Route = createFileRoute("/conges")({
  head: () => ({
    meta: [
      { title: "Calculateur de congés — PostLab" },
      { name: "description", content: "Calculez les jours de congés acquis selon le Code du travail sénégalais." },
    ],
  }),
  component: CongesPage,
});

function moisComplets(embauche: Date, ref: Date): number {
  const mois =
    (ref.getFullYear() - embauche.getFullYear()) * 12 +
    (ref.getMonth() - embauche.getMonth());
  const ajustement = ref.getDate() < embauche.getDate() ? -1 : 0;
  return Math.max(0, mois + ajustement);
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

function CongesPage() {
  const [dateEmbauche, setDateEmbauche] = useState("");
  const { demandes, changerStatut } = useDemandesConge();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString().slice(0, 10);

  const mois = dateEmbauche ? moisComplets(new Date(dateEmbauche), today) : null;
  const joursAcquis = mois !== null ? mois * 2 : null;

  const annees = mois !== null ? Math.floor(mois / 12) : 0;
  const moisRest = mois !== null ? mois % 12 : 0;

  const ancienneteLabel =
    mois === null
      ? ""
      : annees === 0
      ? `${moisRest} mois`
      : moisRest === 0
      ? `${annees} an${annees > 1 ? "s" : ""}`
      : `${annees} an${annees > 1 ? "s" : ""} et ${moisRest} mois`;

  const estFutur = dateEmbauche ? new Date(dateEmbauche) > today : false;

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 md:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold md:text-4xl">Calculateur de congés</h1>
        <p className="text-muted-foreground">
          2 jours ouvrables par mois de service — Code du travail sénégalais
        </p>
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <label htmlFor="embauche" className="block text-sm font-semibold">
          Date d'embauche
        </label>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Saisissez la date à laquelle l'employé a commencé son contrat.
        </p>
        <div className="relative mt-3">
          <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            id="embauche"
            type="date"
            max={todayISO}
            value={dateEmbauche}
            onChange={(e) => setDateEmbauche(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
          />
        </div>
      </div>

      {dateEmbauche && (
        <div className="mt-5 rounded-xl border border-border bg-card p-6">
          {estFutur ? (
            <p className="text-sm text-muted-foreground">
              La date d'embauche ne peut pas être dans le futur.
            </p>
          ) : mois === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun mois complet de service — aucun congé acquis pour l'instant.
            </p>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold tabular-nums">{mois}</p>
                    <p className="text-xs text-muted-foreground">Mois de service</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-primary/5 p-4 ring-1 ring-primary/20">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/15">
                    <CalendarDays className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold tabular-nums text-primary">{joursAcquis}</p>
                    <p className="text-xs text-muted-foreground">Jours acquis</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
                <p className="font-medium">Détail du calcul</p>
                <p className="mt-1 text-muted-foreground">
                  Ancienneté : <span className="font-medium text-foreground">{ancienneteLabel}</span>
                  {" · "}
                  {mois} mois × 2 j = <span className="font-semibold text-foreground">{joursAcquis} jours ouvrables</span>
                </p>
              </div>

              <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  Calcul basé sur l'article L143 du Code du travail sénégalais. Seuls les mois complets de service sont comptabilisés. Des droits supplémentaires peuvent s'appliquer selon la convention collective ou l'ancienneté.
                </span>
              </div>
            </div>
          )}
        </div>
      )}
      {/* ── Demandes de congés ───────────────────────────────────────────── */}
      <div className="mt-10">
        <h2 className="text-xl font-bold">Demandes de congés</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Validez ou refusez les demandes soumises par les employés depuis leur espace.
        </p>

        {(() => {
          const enAttente = demandes.filter(d => d.statut === "En attente");
          return enAttente.length > 0 ? (
            <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
              <p className="text-sm font-semibold text-orange-700">
                {enAttente.length} demande{enAttente.length > 1 ? "s" : ""} en attente de validation
              </p>
            </div>
          ) : null;
        })()}

        <div className="mt-4 flex flex-col gap-3">
          {demandes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune demande pour le moment.</p>
          ) : (
            demandes.map(d => (
              <div key={d.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2 shrink-0">
                  {iconStatut(d.statut)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold">{d.employe}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${badgeStatut(d.statut)}`}>
                      {d.statut}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {d.dateDebut} → {d.dateFin} · {d.raison}
                  </p>
                  <p className="text-[11px] text-muted-foreground/60">Soumise le {d.createdAt}</p>
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
            ))
          )}
        </div>
      </div>
    </section>
  );
}
