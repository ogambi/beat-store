export const LICENSE_TIERS = [
  { id: "mp3_tagged", name: "MP3 + Tag Files", priceCents: 2499 },
  { id: "mp3_no_tag", name: "MP3 (No Tag)", priceCents: 2999 },
  { id: "wav_no_tag", name: "WAV (No Tag)", priceCents: 3999 },
  { id: "wav_stems", name: "WAV + Stems", priceCents: 5799 }
] as const;

export type LicenseTierId = (typeof LICENSE_TIERS)[number]["id"];

export function getTierById(id: string) {
  return LICENSE_TIERS.find((tier) => tier.id === id) ?? null;
}

export function getLowestTierPriceCents() {
  return LICENSE_TIERS[0].priceCents;
}
