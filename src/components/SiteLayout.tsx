import { Link, Outlet } from "@tanstack/react-router";
import type { ReactNode } from "react";

function NavLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
      activeProps={{ className: "px-3 py-2 text-sm font-semibold text-primary" }}
      activeOptions={{ exact: true }}
    >
      {children}
    </Link>
  );
}

export function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-primary">
            <span className="text-2xl" aria-hidden>💼</span>
            <span>PostLab</span>
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink to="/">Accueil</NavLink>
            <NavLink to="/employes">Employés</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border bg-muted/40">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-sm text-muted-foreground md:grid-cols-3 md:px-8">
          <div>
            <div className="mb-2 flex items-center gap-2 font-semibold text-foreground">
              <span aria-hidden>💼</span> PostLab
            </div>
            <p>La RH simplifiée pour les PME sénégalaises.</p>
          </div>
          <div>
            <div className="mb-2 font-semibold text-foreground">Contact</div>
            <p>contact@postlab.sn</p>
            <p>+221 33 824 00 00</p>
            <p>Sicap Liberté 6, Dakar, Sénégal</p>
          </div>
          <div>
            <div className="mb-2 font-semibold text-foreground">Mentions légales</div>
            <p>© {new Date().getFullYear()} PostLab SARL — NINEA 005678901</p>
            <p>Conditions d'utilisation · Confidentialité</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
