import { db } from "@/lib/db";
import { DuelLanding } from "@/components/DuelLanding";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let beats: Array<{
    id: string;
    slug: string;
    title: string;
    bpm: number;
    key: string;
    genre: string;
    mood: string;
    previewUrl: string;
  }> = [];

  try {
    beats = await db.beat.findMany({
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
  } catch (error) {
    console.error("HomePage beat query failed. Falling back to empty list.", error);
  }

  return <DuelLanding beats={beats} />;
}
