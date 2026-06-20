import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { useDemandesConge, type StatutConge } from "@/hooks/useDemandesConge";

export const Route = createFileRoute("/conges")({
  head: () => ({
    meta: [
      { title: "Congés — PostLab" },
      { name: "description", content: "Gestion des demandes de congés des employés." },
    ],
  }),
  component: CongesPage,
});

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
  const { demandes, changerStatut } = useDemandesConge();
  const enAttente = demandes.filter(d => d.statut === "En attente");

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 md:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold md:text-4xl">Congés</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestion des demandes de congés des employés
        </p>
      </div>

      {enAttente.length > 0 && (
        <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
          <p className="text-sm font-semibold text-orange-700">
            {enAttente.length} demande{enAttente.length > 1 ? "s" : ""} en attente de validation
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3">
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
    </section>
  );
}
