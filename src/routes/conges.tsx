import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarDays, Clock, Info } from "lucide-react";

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

function CongesPage() {
  const [dateEmbauche, setDateEmbauche] = useState("");

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
    <section className="mx-auto max-w-2xl px-4 py-12 md:px-8">
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
    </section>
  );
}
