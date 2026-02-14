# BeatVault Store (Personalized Beat Selling Website)

This is a full-stack starter for selling beats online with:
- Public storefront with beat previews
- Stripe Checkout payments
- Automated fulfillment after payment
- Download links sent by email
- Admin upload page for beat archives (`.zip`, `.wav`, `.mp3`, etc.)

## Core Flow
1. You upload a beat archive + metadata from `/admin`.
2. Buyer chooses a beat and pays via Stripe.
3. Stripe webhook marks order as paid.
4. System creates a secure expiring download token.
5. Buyer receives an email with download link.

## Tech Stack
- Next.js (App Router) + TypeScript
- Prisma + SQLite (local dev)
- Stripe (payments)
- Resend (emails)
- S3-compatible object storage (AWS S3 / Cloudflare R2 / B2)

## Local Setup
1. Install dependencies:
```bash
npm install
```

2. Copy env file and fill values:
```bash
cp .env.example .env
```

3. Create DB and generate client:
```bash
npx prisma migrate dev --name init
npm run prisma:generate
```

4. Seed sample beats (optional):
```bash
npm run seed
```

5. Start dev server:
```bash
npm run dev
```

## Stripe Webhook Setup (local)
Install Stripe CLI and forward webhooks:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
Set generated webhook secret into `STRIPE_WEBHOOK_SECRET`.

## Production Checklist
- Use PostgreSQL instead of SQLite.
- Use private bucket + signed object URLs in `src/lib/storage.ts`.
- Add proper auth for admin page (e.g., NextAuth/Clerk).
- Configure your custom domain and SPF/DKIM for email deliverability.
- Add legal pages: Terms, Privacy, License Agreement, Refund Policy.

## High-Value Ideas To Add Next
- Multiple license tiers (MP3 Lease / WAV Lease / Exclusive)
- Discount codes and bundle deals
- Instant preview player with waveform and tags
- Customer portal for past orders and re-downloads
- Abandoned checkout email reminders
- Analytics dashboard (sales, top genres, conversion)
