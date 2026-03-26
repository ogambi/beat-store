import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { getTierById } from "@/lib/licenseTiers";

const schema = z.object({
  beatId: z.string().min(1),
  licenseTier: z.string().min(1).optional()
});

export async function POST(req: NextRequest) {
  try {
    if (env.stripeSecretKey.includes("***")) {
      return NextResponse.json(
        { error: "Stripe is not configured. Add a real STRIPE_SECRET_KEY in .env and restart dev server." },
        { status: 500 }
      );
    }

    const parsed = schema.parse(await req.json());
    const beat = await db.beat.findUnique({ where: { id: parsed.beatId } });

    if (!beat || !beat.isPublished) {
      return NextResponse.json({ error: "Beat not found" }, { status: 404 });
    }

    const isKit = beat.slug === "dark-magician-kit";
    const selectedTier = isKit ? null : getTierById(parsed.licenseTier ?? "");

    if (!isKit && !selectedTier) {
      return NextResponse.json({ error: "Invalid license tier" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${env.appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.appUrl}/cancel`,
      allow_promotion_codes: true,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: isKit ? 2999 : selectedTier!.priceCents,
            product_data: {
              name: beat.title,
              ...(isKit
                ? {}
                : {
                    description: `${selectedTier!.name} • ${beat.genre} • ${beat.bpm} BPM • ${beat.key}`
                  })
            }
          }
        }
      ],
      metadata: {
        beatId: beat.id,
        licenseTier: isKit ? "kit" : selectedTier!.id
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
