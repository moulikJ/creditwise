import Link from "next/link";
import { CreditCard } from "@/lib/types";

export function Badge({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "brand" | "pos" | "warn" }) {
  const tones: Record<string, string> = {
    default: "bg-surface-2 text-fg-2",
    brand: "bg-brand-soft text-brand",
    pos: "bg-pos-soft text-pos",
    warn: "bg-surface-2 text-warn",
  };
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-line bg-surface ${className}`}>{children}</div>;
}

export function CardArt({ card, className = "" }: { card: CreditCard; className?: string }) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-lg text-white shadow-sm ${className}`}
      style={{ background: `linear-gradient(135deg, ${card.color}, ${shade(card.color, -22)})` }}
    >
      <div className="flex h-full flex-col justify-between p-2">
        <div className="h-2.5 w-3.5 rounded-[2px] bg-white/55" />
        <div className="leading-tight">
          <div className="text-[7px] opacity-80">{card.bank}</div>
          <div className="text-[9px] font-bold">{card.name}</div>
        </div>
      </div>
    </div>
  );
}

export function shade(hex: string, pct: number): string {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp((n >> 16) + Math.round(2.55 * pct));
  const g = clamp(((n >> 8) & 0xff) + Math.round(2.55 * pct));
  const b = clamp((n & 0xff) + Math.round(2.55 * pct));
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

export function Button({
  children, href, onClick, variant = "primary", size = "md", type, disabled, className = "",
}: {
  children: React.ReactNode; href?: string; onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost"; size?: "sm" | "md" | "lg";
  type?: "button" | "submit"; disabled?: boolean; className?: string;
}) {
  const v: Record<string, string> = {
    primary: "bg-brand text-brand-fg hover:opacity-90",
    secondary: "border border-line bg-surface text-fg hover:bg-surface-2",
    ghost: "text-fg-2 hover:text-fg hover:bg-surface-2",
  };
  const s: Record<string, string> = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2 text-sm", lg: "px-5 py-2.5 text-base" };
  const cls = `inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${v[variant]} ${s[size]} ${className}`;
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return <button type={type ?? "button"} onClick={onClick} disabled={disabled} className={cls}>{children}</button>;
}

export function Stat({ label, value, tone = "default", sub }: { label: string; value: string; tone?: "default" | "pos" | "warn" | "brand"; sub?: string }) {
  const c: Record<string, string> = { default: "text-fg", pos: "text-pos", warn: "text-warn", brand: "text-brand" };
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className={`mt-1 text-2xl font-semibold tabular ${c[tone]}`}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted">{sub}</div>}
    </div>
  );
}

export function inr(n: number): string {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}
