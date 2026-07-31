import { Header } from "./header";
import { getCurrentUser } from "@/lib/auth";

export async function Shell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <>
      <Header user={user ? { name: user.name, role: user.role } : null} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">{children}</main>
      <footer className="border-t border-line">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 text-xs text-muted">
          CreditWise · Educational tool, not financial advice. Reward rates are approximate, not official bank terms.
        </div>
      </footer>
    </>
  );
}
