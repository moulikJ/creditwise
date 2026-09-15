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
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  function toggleTheme() {
    const el = document.documentElement;
    const next = !el.classList.contains("dark");
    el.classList.toggle("dark", next);
    localStorage.setItem("cw-theme", next ? "dark" : "light");
    setDark(next);
  }
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-3 sm:px-6">
        <Link href="/" aria-label="CreditWise home" className="flex shrink-0 items-center gap-2 font-semibold">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand text-sm text-brand-fg shadow-sm">C</span>
          <span className="text-[15px] tracking-tight">CreditWise</span>
        </Link>
        <span className="hidden text-xs text-muted lg:inline">Created by <span className="font-medium text-fg-2">Moulik Jindal</span></span>
        <nav className="ml-3 hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {NAV.map((n) => {
            const active = path === n.href || path.startsWith(n.href + "/");
            return <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined} className={`rounded-lg px-3 py-1.5 text-sm transition ${active ? "bg-brand-soft text-brand font-semibold" : "text-fg-2 hover:bg-surface-2 hover:text-fg"}`}>{n.label}</Link>;
          })}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <Link href="/recommend" className="hidden rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-brand-fg shadow-sm transition hover:-translate-y-0.5 hover:opacity-90 sm:inline-flex">Find my card</Link>
          <button onClick={toggleTheme} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-fg-2 transition hover:bg-surface-2 hover:text-fg">{dark ? "☀" : "☾"}</button>
          {user ? <Link href="/account" className="shrink-0 rounded-lg px-2.5 py-1.5 text-sm text-fg-2 hover:bg-surface-2 hover:text-fg">{user.role === "admin" ? "Admin" : user.name.split(" ")[0]}</Link> : <Link href="/login" className="shrink-0 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-medium text-fg transition hover:border-brand hover:text-brand">Sign in</Link>}
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-line px-3 py-2 md:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Mobile navigation">
        {NAV.map((n) => { const active = path === n.href || path.startsWith(n.href + "/"); return <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined} className={`shrink-0 rounded-full px-4 py-1.5 text-sm transition ${active ? "bg-brand text-brand-fg font-semibold" : "bg-surface-2 text-fg-2 hover:text-fg"}`}>{n.label}</Link>; })}
      </nav>
    </header>
  );
}
