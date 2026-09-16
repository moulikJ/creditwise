import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { ThemeScript } from "@/components/theme-script";

export const metadata: Metadata = {
  title: {
    default: "CreditWise — Find the right credit card",
    template: "%s · CreditWise",
  },
  description:
    "Discover, compare and evaluate Indian credit cards based on how you actually spend. Reward calculator, side-by-side comparison, and a personalised recommendation engine.",
  keywords: ["credit cards india","credit card comparison","reward calculator","best credit card","cashback cards","travel credit cards"],
  openGraph: {
    title: "CreditWise — Find the right credit card",
    description: "Compare 30+ Indian credit cards, calculate real rewards, and get personalised recommendations.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head><ThemeScript /></head>
      <body className="min-h-full flex flex-col bg-bg text-fg">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
