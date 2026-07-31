"use client";
import { useState } from "react";
import { Button } from "@/components/ui";

export function AuthForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setBusy(true);
    const r = await fetch(`/api/auth/${mode}`, { method: "POST", body: JSON.stringify(form) });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) { setErr(d.error || "Something went wrong"); return; }
    window.location.href = d.user?.role === "admin" ? "/admin" : "/account";
  }

  return (
    <div className="mx-auto max-w-sm rounded-xl border border-line bg-surface p-6">
      <div className="mb-4 flex rounded-lg bg-surface-2 p-1 text-sm">
        <button onClick={() => setMode("login")} className={`flex-1 rounded-md py-1.5 ${mode === "login" ? "bg-surface font-medium" : "text-muted"}`}>Sign in</button>
        <button onClick={() => setMode("register")} className={`flex-1 rounded-md py-1.5 ${mode === "register" ? "bg-surface font-medium" : "text-muted"}`}>Create account</button>
      </div>
      <form onSubmit={submit} className="space-y-3">
        {mode === "register" && <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-brand" />}
        <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-brand" />
        <input required type="password" placeholder="Password (6+ chars)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-brand" />
        {err && <div className="rounded-lg bg-surface-2 px-3 py-2 text-sm text-neg">{err}</div>}
        <Button type="submit" disabled={busy} className="w-full">{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</Button>
      </form>
      <p className="mt-3 text-center text-xs text-muted">Tip: register with an email containing "admin" to access the admin dashboard.</p>
    </div>
  );
}
