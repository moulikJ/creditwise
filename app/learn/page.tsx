import Link from "next/link";
import { Shell } from "@/components/shell";
import { Badge } from "@/components/ui";
import { articleRepo } from "@/lib/repo";

export const metadata = { title: "Learn" };

export default function LearnPage() {
  const articles = articleRepo.all();
  return (
    <Shell>
      <h1 className="text-2xl font-semibold">Financial education hub</h1>
      <p className="mt-1 text-sm text-fg-2">Plain-English guides to using credit cards well and building healthy credit.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {articles.map((a) => (
          <Link key={a.slug} href={`/learn/${a.slug}`} className="rounded-xl border border-line bg-surface p-5 transition hover:border-brand hover:shadow-sm">
            <Badge tone="brand">{a.category}</Badge>
            <h2 className="mt-3 text-lg font-semibold leading-snug">{a.title}</h2>
            <p className="mt-2 text-sm text-fg-2">{a.excerpt}</p>
            <div className="mt-3 text-xs text-muted">{a.readMins} min read · Read →</div>
          </Link>
        ))}
      </div>
    </Shell>
  );
}
