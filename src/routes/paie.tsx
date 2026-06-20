import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Info } from "lucide-react";

export const Route = createFileRoute("/paie")({
  head: () => ({
    meta: [
      { title: "Paie conforme — PostLab" },
      { name: "description", content: "Calculez IPRES, CSS et IR pour chaque bulletin de paie." },
    ],
  }),
  component: PaiePage,
});

// ── Taux légaux (Code du travail sénégalais / IPRES / CSS 2024) ─────────────
const SMIG = 63_703;

const IPRES_RG_SAL  = 0.056;  const IPRES_RG_EMP  = 0.084;  const IPRES_RG_PLAF = 600_000;
const IPRES_RC_SAL  = 0.024;  const IPRES_RC_EMP  = 0.036;  const IPRES_RC_PLAF = 1_500_000;
const CSS_AF        = 0.07;   const CSS_AT        = 0.03;   // AT : taux moyen tous secteurs

// Barème ITS mensuel (annuel ÷ 12) — source DGID Sénégal
const BAREMES = [
  { seuil: 75_000,   taux: 0.00 },
  { seuil: 230_000,  taux: 0.20 },
  { seuil: 500_000,  taux: 0.30 },
  { seuil: 833_333,  taux: 0.35 },
  { seuil: Infinity, taux: 0.40 },
];

function calculerITS(revenuMensuel: number, parts: number): number {
  if (revenuMensuel <= 0) return 0;
  const annuelParPart = (revenuMensuel * 12) / parts;
  let tax = 0;
  let prev = 0;
  for (const { seuil, taux } of BAREMES) {
    if (annuelParPart <= prev) break;
    tax += (Math.min(annuelParPart, seuil) - prev) * taux;
    prev = seuil;
  }
  return Math.max(0, (tax * parts) / 12);
}

function f(n: number) {
  return Math.round(n).toLocaleString("fr-FR") + " FCFA";
}

function Ligne({ label, valeur, accent = false, signe = "-" }: { label: string; valeur: number; accent?: boolean; signe?: string }) {
  return (
    <div className={"flex items-center justify-between py-2 text-sm " + (accent ? "font-semibold text-foreground" : "text-muted-foreground")}>
      <span>{label}</span>
      <span className={accent ? "" : "tabular-nums"}>
        {valeur > 0 ? `${signe} ${f(valeur)}` : "—"}
      </span>
    </div>
  );
}

function PaiePage() {
  const [brut, setBrut] = useState("");
  const [cadre, setCadre] = useState(false);
  const [marie, setMarie] = useState(false);
  const [enfants, setEnfants] = useState(0);

  const brutNum = parseFloat(brut.replace(/\s/g, "")) || 0;

  // ── Calculs salarié ──────────────────────────────────────────────────────
  const ipresRGSal  = brutNum > 0 ? Math.min(brutNum, IPRES_RG_PLAF) * IPRES_RG_SAL : 0;
  const ipresRCSal  = cadre && brutNum > 0 ? Math.min(brutNum, IPRES_RC_PLAF) * IPRES_RC_SAL : 0;
  const totalIPRESSal = ipresRGSal + ipresRCSal;

  const abattement  = brutNum > 0 ? Math.min(Math.max(brutNum * 0.20, 20_000), 75_000) : 0;
  const revImposable = Math.max(0, brutNum - totalIPRESSal - abattement);

  const parts = 1 + (marie ? 0.5 : 0) + enfants * 0.5;
  const its   = calculerITS(revImposable, parts);

  const totalRetenues = totalIPRESSal + its;
  const net = Math.max(0, brutNum - totalRetenues);

  // ── Calculs employeur ────────────────────────────────────────────────────
  const ipresRGEmp = brutNum > 0 ? Math.min(brutNum, IPRES_RG_PLAF) * IPRES_RG_EMP : 0;
  const ipresRCEmp = cadre && brutNum > 0 ? Math.min(brutNum, IPRES_RC_PLAF) * IPRES_RC_EMP : 0;
  const cssAF      = brutNum * CSS_AF;
  const cssAT      = brutNum * CSS_AT;
  const totalChargesEmp = ipresRGEmp + ipresRCEmp + cssAF + cssAT;
  const coutTotal  = brutNum + totalChargesEmp;

  const estEnDessousSMIG = brutNum > 0 && brutNum < SMIG;
  const hasBrut = brutNum > 0;

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 md:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold md:text-4xl">Paie conforme</h1>
        <p className="text-muted-foreground">IPRES, CSS et IR calculés selon le Code du travail sénégalais</p>
      </div>

      {/* Formulaire */}
      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold">Salaire brut mensuel (FCFA)</label>
            {estEnDessousSMIG && (
              <p className="mt-1 text-xs text-orange-600">⚠ Inférieur au SMIG ({SMIG.toLocaleString("fr-FR")} FCFA)</p>
            )}
            <input
              type="text"
              inputMode="numeric"
              placeholder={`Min. SMIG : ${SMIG.toLocaleString("fr-FR")} FCFA`}
              value={brut}
              onChange={(e) => setBrut(e.target.value)}
              className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">Catégorie</label>
            <div className="mt-2 flex rounded-lg border border-border overflow-hidden">
              {[false, true].map((isCadre) => (
                <button
                  key={String(isCadre)}
                  onClick={() => setCadre(isCadre)}
                  className={"flex-1 py-2 text-sm font-medium transition " +
                    (cadre === isCadre ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted")}
                >
                  {isCadre ? "Cadre" : "Non-cadre"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold">Situation familiale</label>
            <div className="mt-2 flex rounded-lg border border-border overflow-hidden">
              {[false, true].map((isMarie) => (
                <button
                  key={String(isMarie)}
                  onClick={() => setMarie(isMarie)}
                  className={"flex-1 py-2 text-sm font-medium transition " +
                    (marie === isMarie ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted")}
                >
                  {isMarie ? "Marié(e)" : "Célibataire"}
                </button>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold">Nombre d'enfants à charge</label>
            <div className="mt-2 flex items-center gap-3">
              <button onClick={() => setEnfants(Math.max(0, enfants - 1))}
                className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card text-lg font-bold hover:border-primary transition">−</button>
              <span className="w-8 text-center text-lg font-semibold tabular-nums">{enfants}</span>
              <button onClick={() => setEnfants(Math.min(10, enfants + 1))}
                className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card text-lg font-bold hover:border-primary transition">+</button>
              <span className="text-xs text-muted-foreground">{parts} part{parts > 1 ? "s" : ""} fiscale{parts > 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>
      </div>

      {hasBrut && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {/* Bulletin salarié */}
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-bold">Bulletin salarié</p>
            <div className="mt-3 divide-y divide-border">
              <Ligne label="Salaire brut" valeur={brutNum} accent signe=" " />
              <Ligne label={`IPRES Rég. général (${(IPRES_RG_SAL * 100).toFixed(1)} %)`} valeur={ipresRGSal} />
              {cadre && <Ligne label={`IPRES Rég. cadre (${(IPRES_RC_SAL * 100).toFixed(1)} %)`} valeur={ipresRCSal} />}
              <Ligne label={`ITS / IR (${parts} part${parts > 1 ? "s" : ""})`} valeur={its} />
              <Ligne label="Total retenues" valeur={totalRetenues} accent />
              <div className="flex items-center justify-between pt-3 text-base font-bold text-primary">
                <span>Net à payer</span>
                <span>{f(net)}</span>
              </div>
            </div>
          </div>

          {/* Charges employeur */}
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-bold">Charges employeur</p>
            <div className="mt-3 divide-y divide-border">
              <Ligne label="Salaire brut" valeur={brutNum} accent signe=" " />
              <Ligne label={`IPRES Rég. général (${(IPRES_RG_EMP * 100).toFixed(1)} %)`} valeur={ipresRGEmp} />
              {cadre && <Ligne label={`IPRES Rég. cadre (${(IPRES_RC_EMP * 100).toFixed(1)} %)`} valeur={ipresRCEmp} />}
              <Ligne label={`CSS Alloc. familiales (${CSS_AF * 100} %)`} valeur={cssAF} />
              <Ligne label={`CSS Acc. travail (~${CSS_AT * 100} %)`} valeur={cssAT} />
              <Ligne label="Total charges patronales" valeur={totalChargesEmp} accent />
              <div className="flex items-center justify-between pt-3 text-base font-bold text-foreground">
                <span>Coût total employeur</span>
                <span className="tabular-nums">{f(coutTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 flex items-start gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          Calcul indicatif basé sur les taux IPRES, CSS et le barème ITS en vigueur au Sénégal (2024).
          SMIG : {SMIG.toLocaleString("fr-FR")} FCFA/mois. Les taux AT/MP varient selon le secteur d'activité.
          Consultez un comptable agréé pour vos bulletins officiels.
        </span>
      </div>
    </section>
  );
}
