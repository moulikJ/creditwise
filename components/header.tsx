"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/explore", label: "Explore" },
  { href: "/compare", label: "Compare" },
  { href: "/recommend", label: "Recommend" },
  { href: "/learn", label: "Learn" },
];

export function Header({ user }: { user: { name: string; role: string } | null }) {
  const path = usePathname();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleTheme() {
    const el = document.documentElement;
    const next = !el.classList.contains("dark");
    el.classList.toggle("dark", next);
    localStorage.setItem("cw-theme", next ? "dark" : "light");
    setDark(next);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      {/* Top row: brand + credit + actions */}
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-brand text-brand-fg text-sm">C</span>
          <span className="text-[15px]">CreditWise</span>
        </Link>
        <span className="hidden text-xs text-muted sm:inline">
          Created by <span className="font-medium text-fg-2">Moulik Jindal</span>
        </span>

        {/* Desktop nav inline */}
        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {NAV.map((n) => {
            const active = path === n.href || path.startsWith(n.href + "/");
            return (
              <Link key={n.href} href={n.href}
                className={`rounded-md px-3 py-1.5 text-sm transition ${active ? "bg-surface-2 text-fg font-medium" : "text-fg-2 hover:text-fg"}`}>
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={toggleTheme} aria-label="Toggle theme"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-fg-2 hover:bg-surface-2">
            {dark ? "☀" : "☾"}
          </button>
          {user ? (
            <Link href="/account" className="shrink-0 rounded-md px-2.5 py-1.5 text-sm text-fg-2 hover:text-fg">
              {user.role === "admin" ? "Admin" : user.name.split(" ")[0]}
            </Link>
          ) : (
            <Link href="/login" className="shrink-0 rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-brand-fg hover:opacity-90">
              Sign in
            </Link>
          )}
        </div>
      </div>

      {/* Mobile nav: always visible, horizontally scrollable — no hamburger */}
      <nav className="flex gap-1 overflow-x-auto border-t border-line px-3 py-2 md:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {NAV.map((n) => {
          const active = path === n.href || path.startsWith(n.href + "/");
          return (
            <Link key={n.href} href={n.href}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm transition ${active ? "bg-brand text-brand-fg font-medium" : "bg-surface-2 text-fg-2"}`}>
              {n.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
