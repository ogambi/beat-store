import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatBytes } from "@/lib/format";
import { LICENSE_TIERS, LicenseTierId } from "@/lib/licenseTiers";
import { LicenseCheckout } from "@/components/LicenseCheckout";

type SearchParams = {
  tier?: string;
};

type Props = {
  params: { slug: string };
  searchParams: SearchParams;
};

function parseTier(value: string | undefined): LicenseTierId {
  const match = LICENSE_TIERS.find((tier) => tier.id === value);
  return (match?.id ?? "mp3_tagged") as LicenseTierId;
}

export default async function CheckoutPage({ params, searchParams }: Props) {
  const beat = await db.beat.findUnique({ where: { slug: params.slug } });
  if (!beat || !beat.isPublished) {
    notFound();
  }

  const initialTier = parseTier(searchParams.tier);

  return (
    <main className="container page-pad">
      <div className="panel stack">
        <h1>Checkout</h1>
        <p className="meta">{beat.title}</p>
        <p className="tiny">
          {beat.bpm} BPM • {beat.key} • {beat.genre} • {beat.mood}
        </p>
        <p className="tiny">
          Delivery format: {beat.archiveFileName} ({formatBytes(beat.archiveFileSize)})
        </p>
      </div>

      <div className="panel stack" style={{ marginTop: "1rem" }}>
        <h2>License & Payment</h2>
        <LicenseCheckout beatId={beat.id} initialTierId={initialTier} buttonPrefix="Pay for" />
      </div>
    </main>
  );
}
