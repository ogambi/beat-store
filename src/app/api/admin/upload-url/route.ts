import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { createPresignedPutUrl } from "@/lib/storage";
import { env } from "@/lib/env";

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
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid payload",
          details: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        },
        { status: 400 }
      );
    }

    const body = parsed.data;

    if (env.storageEndpoint.includes("<") || env.storageEndpoint.includes(">")) {
      return new NextResponse("Storage is not configured. Set STORAGE_ENDPOINT to a real bucket endpoint in .env.", { status: 500 });
    }

    const archiveObjectKey = `beats/${body.slug}-${Date.now()}-${body.archiveFileName}`;
    const previewUrl = body.previewUrl.trim();

    let upload;
    try {
      upload = createPresignedPutUrl({
        key: archiveObjectKey,
        contentType: body.archiveFileType,
        expiresInSeconds: 900
      });
    } catch (error) {
      console.error("createPresignedPutUrl failed", error);
      return new NextResponse("Storage signing failed. Verify STORAGE_ENDPOINT, bucket, and credentials.", { status: 500 });
    }

    const beat = await db.beat.create({
      data: {
        title: body.title,
        slug: body.slug,
        bpm: body.bpm,
        key: body.key,
        genre: body.genre,
        mood: body.mood,
        priceCents: body.priceCents,
        previewUrl,
        archiveObjectKey,
        archiveFileName: body.archiveFileName,
        archiveFileType: body.archiveFileType,
        archiveFileSize: body.archiveFileSize,
        isPublished: true
      }
    });

    return NextResponse.json({ beatId: beat.id, upload });
  } catch (error) {
    console.error(error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return new NextResponse("Slug already exists. Use a different slug.", { status: 409 });
    }
    return new NextResponse("Failed to create beat upload.", { status: 500 });
  }
}
