import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { generateToken } from "@/lib/tokens";
import { sendDownloadEmail } from "@/lib/email";

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new NextResponse("Missing signature", { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, env.stripeWebhookSecret);
  } catch (error) {
    console.error("Webhook signature invalid", error);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const beatId = session.metadata?.beatId;
    const customerEmail = session.customer_details?.email;

    if (!beatId || !customerEmail || !session.id) {
      return new NextResponse("Missing session metadata", { status: 400 });
    }

    const beat = await db.beat.findUnique({ where: { id: beatId } });
    if (!beat) {
      return new NextResponse("Beat not found", { status: 404 });
    }

    const order = await db.order.upsert({
      where: { stripeCheckoutId: session.id },
      create: {
        stripeCheckoutId: session.id,
        stripePaymentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
        customerEmail,
        amountTotalCents: session.amount_total ?? beat.priceCents,
        status: "PAID",
        beatId,
        fulfilledAt: new Date()
      },
      update: {
        stripePaymentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
        customerEmail,
        amountTotalCents: session.amount_total ?? beat.priceCents,
        status: "PAID",
        fulfilledAt: new Date()
      }
    });

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 72);

    await db.downloadLink.create({
      data: {
        token,
        orderId: order.id,
        expiresAt,
        maxDownloads: 5
      }
    });

    const downloadUrl = `${env.appUrl}/api/download/${token}`;

    await sendDownloadEmail({
      to: customerEmail,
      beatTitle: beat.title,
      downloadUrl,
      expiresAtIso: expiresAt.toISOString()
    });
  }

  return new NextResponse("ok", { status: 200 });
}
