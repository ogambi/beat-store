import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { createPresignedPutUrl } from "@/lib/storage";

const schema = z.object({
  title: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  bpm: z.number().int().min(40).max(240),
  key: z.string().min(1),
  genre: z.string().min(1),
  mood: z.string().min(1),
  priceCents: z.number().int().min(99),
  previewUrl: z.string().url(),
  archiveFileName: z.string().min(1),
  archiveFileType: z.string().min(1),
  archiveFileSize: z.number().int().min(1)
});

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = schema.parse(await req.json());
    const archiveObjectKey = `beats/${body.slug}-${Date.now()}-${body.archiveFileName}`;

    const beat = await db.beat.create({
      data: {
        title: body.title,
        slug: body.slug,
        bpm: body.bpm,
        key: body.key,
        genre: body.genre,
        mood: body.mood,
        priceCents: body.priceCents,
        previewUrl: body.previewUrl,
        archiveObjectKey,
        archiveFileName: body.archiveFileName,
        archiveFileType: body.archiveFileType,
        archiveFileSize: body.archiveFileSize,
        isPublished: true
      }
    });

    const upload = createPresignedPutUrl({
      key: archiveObjectKey,
      contentType: body.archiveFileType,
      expiresInSeconds: 900
    });

    return NextResponse.json({ beatId: beat.id, upload });
  } catch (error) {
    console.error(error);
    return new NextResponse("Invalid payload", { status: 400 });
  }
}
