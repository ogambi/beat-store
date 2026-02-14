import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatBytes, formatUsd } from "@/lib/format";
import { LICENSE_TIERS } from "@/lib/licenseTiers";

export default async function BeatPage({ params }: { params: { slug: string } }) {
  const beat = await db.beat.findUnique({ where: { slug: params.slug } });

  if (!beat || !beat.isPublished) {
    notFound();
  }

  return (
    <main className="container page-pad">
      <div className="panel stack">
        <div className="pill">{beat.genre}</div>
        <h1>{beat.title}</h1>
        <p className="meta">
          {beat.bpm} BPM • {beat.key} • {beat.mood}
        </p>

        <audio controls preload="none" src={beat.previewUrl} className="audio" />

        <p className="tiny">
          Delivery format: {beat.archiveFileName} ({formatBytes(beat.archiveFileSize)})
        </p>

        <div className="panel stack">
          <h3>License Options</h3>
          {LICENSE_TIERS.map((tier) => (
            <p key={tier.id} className="meta">
              <Link href={`/checkout/${beat.slug}?tier=${tier.id}`} className="link-btn">
                {tier.name} - {formatUsd(tier.priceCents)}
              </Link>
            </p>
          ))}
        </div>

        <Link href={`/checkout/${beat.slug}`} className="btn">
          Continue to Checkout
        </Link>
      </div>
    </main>
  );
}
