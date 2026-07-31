"use client";
export function LogoutButton() {
  return <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/"; }} className="rounded-lg border border-line px-3 py-2 text-sm hover:bg-surface-2">Sign out</button>;
}
