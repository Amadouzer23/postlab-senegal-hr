import { useState } from "react";

export type StatutConge = "En attente" | "Acceptée" | "Refusée";

export type DemandeConge = {
  id: string;
  employe: string;
  dateDebut: string;
  dateFin: string;
  raison: string;
  statut: StatutConge;
  createdAt: string;
};

const STORAGE_KEY = "postlab_demandes_conge";

const DEMANDES_INIT: DemandeConge[] = [
  { id: "1", employe: "Modou Fall",    dateDebut: "2026-07-01", dateFin: "2026-07-05", raison: "Vacances en famille",    statut: "En attente", createdAt: "2026-06-18" },
  { id: "2", employe: "Awa Ndiaye",    dateDebut: "2026-06-22", dateFin: "2026-06-24", raison: "Raisons personnelles",   statut: "Acceptée",   createdAt: "2026-06-15" },
  { id: "3", employe: "Fatou Sow",     dateDebut: "2026-07-10", dateFin: "2026-07-18", raison: "Congés annuels",         statut: "En attente", createdAt: "2026-06-17" },
  { id: "4", employe: "Aïssatou Ba",   dateDebut: "2026-06-15", dateFin: "2026-06-16", raison: "Rendez-vous médical",    statut: "Refusée",    createdAt: "2026-06-10" },
];

function lireStorage(): DemandeConge[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEMANDES_INIT;
    return JSON.parse(raw) as DemandeConge[];
  } catch {
    return DEMANDES_INIT;
  }
}

function ecrireStorage(demandes: DemandeConge[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(demandes)); } catch {}
}

export function useDemandesConge() {
  const [demandes, setDemandes] = useState<DemandeConge[]>(lireStorage);

  function ajouterDemande(d: Omit<DemandeConge, "id" | "statut" | "createdAt">) {
    setDemandes((prev) => {
      const next = [
        { ...d, id: Date.now().toString(), statut: "En attente" as StatutConge, createdAt: new Date().toISOString().slice(0, 10) },
        ...prev,
      ];
      ecrireStorage(next);
      return next;
    });
  }

  function changerStatut(id: string, statut: StatutConge) {
    setDemandes((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, statut } : r));
      ecrireStorage(next);
      return next;
    });
  }

  return { demandes, ajouterDemande, changerStatut };
}
