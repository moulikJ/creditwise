import { notFound } from "next/navigation";
import Link from "next/link";
import { Shell } from "@/components/shell";
import { Badge } from "@/components/ui";
import { articleRepo } from "@/lib/repo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = articleRepo.bySlug(slug);
  return { title: a?.title ?? "Article" };
}

export default async function Article({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = articleRepo.bySlug(slug);
  if (!a) notFound();
  return (
    <Shell>
      <article className="mx-auto max-w-2xl">
        <Link href="/learn" className="text-sm text-brand">← All articles</Link>
        <div className="mt-4"><Badge tone="brand">{a.category}</Badge></div>
        <h1 className="mt-3 text-3xl font-semibold leading-tight" style={{ fontFamily: "var(--font-display)" }}>{a.title}</h1>
        <div className="mt-2 text-sm text-muted">{a.readMins} min read</div>
        <div className="mt-6 space-y-4 text-fg-2 leading-relaxed">
          {a.body.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </article>
    </Shell>
  );
}
