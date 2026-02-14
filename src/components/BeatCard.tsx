import Link from "next/link";
import { Beat } from "@prisma/client";
import { formatUsd } from "@/lib/format";
import { getLowestTierPriceCents } from "@/lib/licenseTiers";

export function BeatCard({ beat }: { beat: Beat }) {
  return (
    <article className="beat-card">
      <div className="pill">{beat.genre}</div>
      <h3>{beat.title}</h3>
      <p className="meta">
        {beat.bpm} BPM • {beat.key} • {beat.mood}
      </p>
      <audio controls preload="none" src={beat.previewUrl} className="audio" />
      <div className="card-footer">
        <strong>From {formatUsd(getLowestTierPriceCents())}</strong>
        <Link href={`/beat/${beat.slug}`} className="link-btn">
          Details
        </Link>
      </div>
    </article>
  );
}
