import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";

const schema = z.object({
  beatId: z.string().min(1)
});

async function createCheckoutSession(beatId: string) {
  if (env.stripeSecretKey.includes("***")) {
    throw new Error("Stripe is not configured. Add a real STRIPE_SECRET_KEY in .env and restart dev server.");
  }

  const beat = await db.beat.findUnique({ where: { id: beatId } });

  if (!beat || !beat.isPublished) {
    return { error: "Beat not found", status: 404 } as const;
  }

  if (beat.slug !== "dark-magician-kit") {
    return { error: "Product unavailable", status: 400 } as const;
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${env.appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: env.appUrl,
    allow_promotion_codes: true,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: 2999,
          product_data: {
            name: beat.title
          }
        }
      }
    ],
    metadata: {
      beatId: beat.id,
      licenseTier: "kit"
    }
  });

  if (!session.url) {
    return { error: "Checkout unavailable", status: 500 } as const;
  }

  return { url: session.url } as const;
}

export async function GET(req: NextRequest) {
  try {
    const parsed = schema.parse({
      beatId: req.nextUrl.searchParams.get("beatId")
    });

    const result = await createCheckoutSession(parsed.beatId);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.redirect(result.url, 303);
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const parsed = schema.parse(await req.json());
    const result = await createCheckoutSession(parsed.beatId);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ url: result.url });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
