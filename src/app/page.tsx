import { db } from "@/lib/db";
import { DuelLanding } from "@/components/DuelLanding";

export default async function HomePage() {
  const beats = await db.beat.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      bpm: true,
      key: true,
      genre: true,
      mood: true,
      previewUrl: true
    }
  });

  return <DuelLanding beats={beats} />;
}
