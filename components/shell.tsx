import Link from "next/link";
import { Header } from "./header";
import { getCurrentUser } from "@/lib/auth";

export async function Shell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <div className="min-h-screen bg-bg text-fg">
      <Header user={user ? { name: user.name, role: user.role } : null} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">{children}</main>
      <footer className="mt-16 border-t border-line bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Link href="/" className="font-semibold tracking-tight">CreditWise</Link>
            <p className="mt-1 max-w-md text-xs leading-5 text-muted">A decision-support tool for comparing Indian credit cards. Built to make the maths easier to understand.</p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-fg-2">
            <Link href="/explore" className="hover:text-brand">Explore</Link>
            <Link href="/compare" className="hover:text-brand">Compare</Link>
            <Link href="/recommend" className="hover:text-brand">Recommend</Link>
            <Link href="/learn" className="hover:text-brand">Learn</Link>
          </div>
        </div>
        <div className="border-t border-line px-4 py-3 text-center text-[11px] leading-5 text-muted sm:px-6">Educational tool, not financial advice. Card terms and reward rates can change; check the issuer's current terms before applying.</div>
      </footer>
    </div>
  );
}
