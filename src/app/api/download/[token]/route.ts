import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getObjectDownloadUrl } from "@/lib/storage";

export async function GET(
  _req: Request,
  { params }: { params: { token: string } }
) {
  const row = await db.downloadLink.findUnique({
    where: { token: params.token },
    include: {
      order: {
        include: {
          beat: true
        }
      }
    }
  });

  if (!row) {
    return new NextResponse("Invalid link", { status: 404 });
  }

  const expired = row.expiresAt.getTime() < Date.now();
  if (expired) {
    return new NextResponse("Link expired", { status: 410 });
  }

  if (row.downloads >= row.maxDownloads) {
    return new NextResponse("Download limit reached", { status: 429 });
  }

  await db.downloadLink.update({
    where: { id: row.id },
    data: {
      downloads: { increment: 1 }
    }
  });

  const archiveUrl = await getObjectDownloadUrl(row.order.beat.archiveObjectKey);

  return NextResponse.redirect(archiveUrl, {
    status: 302
  });
}
