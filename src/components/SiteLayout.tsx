import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  CalendarDays, FileText,
  Home, Mail, Menu, UserCircle, Users, X,
} from "lucide-react";
import AgentIA from "@/components/AgentIA";

type NavLink = { to: string; label: string; Icon: React.ElementType };

const NAV_SECTIONS: { title: string | null; items: NavLink[] }[] = [
  {
    title: null,
    items: [{ to: "/", label: "Accueil", Icon: Home }],
  },
  {
    title: "Espace RH",
    items: [
      { to: "/employes",  label: "Employés",  Icon: Users },
      { to: "/conges",    label: "Congés",     Icon: CalendarDays },
      { to: "/saisie-rh", label: "Saisie RH",  Icon: FileText },
    ],
  },
  {
    title: "Espace Employé",
    items: [
      { to: "/employe", label: "Mon Espace", Icon: UserCircle },
    ],
  },
  {
    title: null,
    items: [{ to: "/contact", label: "Contact", Icon: Mail }],
  },
];

function NavItem({ to, label, Icon, onClick }: NavLink & { onClick?: () => void }) {
  const { location } = useRouterState();
  const active = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      onClick={onClick}
      className={
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors " +
        (active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground")
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  );
}

function Sidebar({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-background">
      {/* Profile */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-5">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          PL
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">PostLab RH</p>
          <p className="truncate text-xs text-muted-foreground">Gestionnaire</p>
        </div>
      </div>

      {/* Nav avec sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_SECTIONS.map((section, i) => (
          <div key={i} className={i > 0 ? "mt-4" : ""}>
            {section.title && (
              <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map(link => (
                <NavItem key={link.to} {...link} onClick={onClose} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom branding */}
      <div className="border-t border-border px-5 py-4">
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} PostLab SARL</p>
        <p className="text-xs text-muted-foreground">Dakar, Sénégal</p>
      </div>
    </div>
  );
}

export function SiteLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-border lg:block">
        <div className="sticky top-0 h-screen">
          <Sidebar />
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside className={
        "fixed inset-y-0 left-0 z-50 w-56 border-r border-border shadow-xl transition-transform duration-200 lg:hidden " +
        (mobileOpen ? "translate-x-0" : "-translate-x-full")
      }>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="font-bold text-primary">💼 PostLab</span>
            <button onClick={() => setMobileOpen(false)} className="rounded-md p-1 hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <Sidebar onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
          <button onClick={() => setMobileOpen(true)} className="rounded-md p-1.5 hover:bg-muted" aria-label="Ouvrir le menu">
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="flex items-center gap-2 text-base font-bold text-primary">
            <span>💼</span> PostLab
          </Link>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>

        <footer className="border-t border-border bg-muted/40">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-sm text-muted-foreground md:grid-cols-3 md:px-8">
            <div>
              <div className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                <span>💼</span> PostLab
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

      <AgentIA />
    </div>
  );
}
