import { Link, Outlet } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";

export function SiteLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const links = [
    { to: "/", label: "Accueil" },
    { to: "/employes", label: "Employés" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-primary">
            <span className="text-2xl" aria-hidden>💼</span>
            <span>PostLab</span>
          </Link>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
              aria-expanded={isOpen}
              aria-haspopup="menu"
            >
              Menu <span aria-hidden>☰</span>
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-44 origin-top-right rounded-md border border-border bg-card shadow-lg ring-1 ring-black/5 animate-fade-in">
                <ul role="menu" className="py-1">
                  {links.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        onClick={() => setIsOpen(false)}
                        activeProps={{ className: "bg-primary/10 text-primary font-semibold" }}
                        activeOptions={{ exact: true }}
                        className="block px-4 py-2 text-sm text-foreground transition hover:bg-muted"
                        role="menuitem"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
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
