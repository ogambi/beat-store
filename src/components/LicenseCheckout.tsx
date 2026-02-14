"use client";

import { useMemo, useState } from "react";
import { LICENSE_TIERS, LicenseTierId } from "@/lib/licenseTiers";
import { formatUsd } from "@/lib/format";

type Props = {
  beatId: string;
  initialTierId?: LicenseTierId;
  buttonPrefix?: string;
};

export function LicenseCheckout({
  beatId,
  initialTierId = "mp3_tagged",
  buttonPrefix = "Buy"
}: Props) {
  const [loading, setLoading] = useState(false);
  const [tierId, setTierId] = useState<LicenseTierId>(initialTierId);

  const selectedTier = useMemo(
    () => LICENSE_TIERS.find((tier) => tier.id === tierId) ?? LICENSE_TIERS[0],
    [tierId]
  );

  async function startCheckout() {
    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beatId, licenseTier: tierId })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Checkout failed");
      }

      const data = (await response.json()) as { url: string };
      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Could not start checkout. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stack">
      <label htmlFor="licenseTier" className="tiny">
        Choose License
      </label>
      <select
        id="licenseTier"
        className="select"
        value={tierId}
        onChange={(e) => setTierId(e.target.value as LicenseTierId)}
      >
        {LICENSE_TIERS.map((tier) => (
          <option key={tier.id} value={tier.id}>
            {tier.name} - {formatUsd(tier.priceCents)}
          </option>
        ))}
      </select>
      <button className="btn" onClick={startCheckout} disabled={loading}>
        {loading
          ? "Redirecting..."
          : `${buttonPrefix} ${selectedTier.name} (${formatUsd(selectedTier.priceCents)})`}
      </button>
    </div>
  );
}
