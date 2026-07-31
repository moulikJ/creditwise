import { Shell } from "@/components/shell";
import { AuthForm } from "./login-client";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <Shell>
      <h1 className="text-center text-2xl font-semibold">Welcome to CreditWise</h1>
      <p className="mt-1 text-center text-sm text-fg-2">Save cards, keep your recommendation history, and sync favourites.</p>
      <div className="mt-6"><AuthForm /></div>
    </Shell>
  );
}
