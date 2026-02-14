import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const beats = [
    {
      title: "Midnight Asphalt",
      slug: "midnight-asphalt",
      bpm: 142,
      key: "F minor",
      genre: "Trap",
      mood: "Dark",
      priceCents: 4999,
      previewUrl: "https://filesamples.com/samples/audio/mp3/sample3.mp3",
      archiveObjectKey: "beats/midnight-asphalt.zip",
      archiveFileName: "midnight-asphalt.zip",
      archiveFileType: "application/zip",
      archiveFileSize: 18_400_000,
      isPublished: true
    },
    {
      title: "Golden Window",
      slug: "golden-window",
      bpm: 94,
      key: "C major",
      genre: "Lo-Fi",
      mood: "Warm",
      priceCents: 3499,
      previewUrl: "https://filesamples.com/samples/audio/mp3/sample1.mp3",
      archiveObjectKey: "beats/golden-window.zip",
      archiveFileName: "golden-window.zip",
      archiveFileType: "application/zip",
      archiveFileSize: 12_100_000,
      isPublished: true
    }
  ] as const;

  for (const beat of beats) {
    await prisma.beat.upsert({
      where: { slug: beat.slug },
      update: beat,
      create: beat
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
