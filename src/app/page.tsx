import { db } from "@/lib/db";
import { DuelLanding } from "@/components/DuelLanding";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let kitProductId: string | null = null;

  try {
    const kitProduct = await db.beat.findUnique({
      where: { slug: "dark-magician-kit" },
      select: { id: true }
    });

    kitProductId = kitProduct?.id ?? null;
  } catch (error) {
    console.error("HomePage kit query failed. Falling back to empty state.", error);
  }

  return <DuelLanding kitProductId={kitProductId} />;
}
