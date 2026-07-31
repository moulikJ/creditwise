"use client";
import { useEffect, useState } from "react";

export function FavButton({ cardId }: { cardId: string }) {
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/favorites").then((r) => r.ok ? r.json() : null).then((d) => {
      if (d?.favorites) setActive(d.favorites.includes(cardId));
    }).catch(() => {});
  }, [cardId]);

  async function toggle() {
    setLoading(true);
    const r = await fetch("/api/favorites", { method: "POST", body: JSON.stringify({ cardId }) });
    if (r.status === 401) { window.location.href = "/login"; return; }
    const d = await r.json();
    setActive(d.active); setLoading(false);
  }
  return (
    <button onClick={toggle} disabled={loading}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition ${active ? "border-brand bg-brand-soft text-brand" : "border-line text-fg-2 hover:bg-surface-2"}`}>
      {active ? "★ Saved" : "☆ Save"}
    </button>
  );
}
