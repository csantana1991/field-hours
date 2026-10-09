import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { usePlan } from "@/lib/progress";

const NAV = [
  { to: "/", label: "Bulletin" },
  { to: "/six-months", label: "Six months" },
  { to: "/prerequisites", label: "Prerequisites" },
  { to: "/catalog", label: "Catalog" },
  { to: "/library", label: "Library" },
  { to: "/plan", label: "My plan" },
] as const;

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    void usePlan.persist.rehydrate();
  }, []);

  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/" className="group block">
            <span className="block font-display text-2xl text-ink">Field Hours</span>
            <span className="block text-xs tracking-widest text-muted uppercase">
              A study bulletin, not a degree
            </span>
          </Link>
          <nav className="flex flex-wrap gap-1" aria-label="Sections">
            {NAV.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={
                    "inline-flex h-11 items-center px-3 text-sm " +
                    (active ? "bg-teal text-paper" : "text-ink hover:bg-teal-soft")
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">{children}</main>
      <footer className="border-t border-line">
        <p className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted sm:px-6">
          Independent of Texas A&M University. Course blurbs are shortened from the public CSCE graduate catalog so you can match them to free lectures. Finishing a plan does not confer credit, a diploma, or admission.
        </p>
      </footer>
    </div>
  );
}
