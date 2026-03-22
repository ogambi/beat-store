# Production Launch Guide

This project is ready for a first production deployment, but a few pieces still need to be configured before taking real payments.

## 1. Create Production Services

Set up these services first:

- A production Postgres database
- An S3-compatible storage bucket
- A Stripe account with live keys
- A Resend sender domain for order emails
- A hosting target for the Next.js app

This repo already builds successfully with `npm run build`, so the main work is infrastructure and configuration.

## 2. Required Production Environment Variables

Start from `.env.production.example` and fill in real values.

Key points:

- `NEXT_PUBLIC_APP_URL` must be your real public site URL
- `DATABASE_URL` should point to Postgres, not SQLite
- Stripe values must be live keys for launch
- `EMAIL_FROM` must use a domain verified in Resend
- Storage values must point to a real production bucket

## 3. Database

Local development uses SQLite. Do not launch production on SQLite.

Recommended path:

1. Create a hosted Postgres database
2. Set `DATABASE_URL` to the Postgres connection string
3. Run Prisma migrations against production

Example:

```bash
npx prisma migrate deploy
```

If you want sample products in production, seed intentionally after migration instead of relying on local data.

## 4. Object Storage

Your delivery flow depends on uploaded beat archives existing in a real bucket.

Before launch:

1. Create a production bucket
2. Fill in the storage env vars
3. Verify `/admin` can upload a beat archive successfully
4. Verify downloads work after payment

Important:

- `src/lib/storage.ts` currently returns a direct object URL for downloads
- The repo notes that production should use a private bucket and signed download URLs

That means the safer launch path is:

1. Use a private bucket
2. Update [src/lib/storage.ts](/Users/gambino/Documents/Codex Projects /Beat Store Web /src/lib/storage.ts) to generate signed download URLs
3. Re-test the full purchase flow

## 5. Stripe

Production payments require all of these:

1. Set `STRIPE_SECRET_KEY` to a live secret key
2. Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to a live publishable key
3. Set `NEXT_PUBLIC_APP_URL` to the production domain
4. Configure a Stripe webhook to:

```text
https://your-domain.com/api/webhooks/stripe
```

5. Put the resulting webhook secret into `STRIPE_WEBHOOK_SECRET`

The checkout flow depends on the webhook to mark orders paid, create download tokens, and send delivery emails. If the webhook is not configured correctly, customers can pay but never receive fulfillment.

## 6. Email

Order fulfillment emails are sent from [src/lib/email.ts](/Users/gambino/Documents/Codex Projects /Beat Store Web /src/lib/email.ts).

Before launch:

1. Verify a sending domain in Resend
2. Set `RESEND_API_KEY`
3. Set `EMAIL_FROM` to a verified sender identity
4. Send a real test email through the purchase flow

Also configure SPF and DKIM on your domain so emails do not land in spam as often.

## 7. Admin Security

The current repo explicitly calls out admin auth as unfinished. Treat this as a launch blocker if the site will be public.

At minimum:

- Use a strong `ADMIN_SECRET`
- Do not reuse local secrets in production

Better:

- Add real authentication to `/admin`

If you want to launch safely, this should be one of the next code changes after deployment setup.

## 8. Deploy

Typical deployment flow:

1. Push the repo to your Git host
2. Create the project in your hosting provider
3. Add all production environment variables
4. Deploy
5. Attach your custom domain

After deploy, confirm:

- `/` loads correctly
- `/beat/[slug]` pages render
- `/checkout/[slug]` works
- `/admin` is reachable only the way you expect

## 9. End-to-End Launch Test

Do one complete live-like test before announcing the site:

1. Upload a real test beat from `/admin`
2. Open the storefront
3. Start checkout
4. Complete a payment in Stripe test mode or a controlled live test
5. Confirm the webhook succeeds
6. Confirm the order is marked paid
7. Confirm the email arrives
8. Confirm the download link works
9. Confirm the archive downloads correctly

This is the most important launch test for this app.

## 10. Business Pages

Before public launch, add these pages:

- Terms
- Privacy
- License Agreement
- Refund Policy

This matters for trust, payment disputes, and basic store legitimacy.

## Recommended Launch Order

1. Set up Postgres
2. Set up production bucket storage
3. Add production env vars
4. Configure Stripe webhook
5. Configure Resend domain and sender
6. Deploy the app
7. Run one end-to-end purchase test
8. Lock down `/admin`
9. Add legal pages

## Current Known Risks

- Production still needs a real Postgres database
- Downloads should move to signed/private URLs before serious launch
- `/admin` needs stronger protection
- Legal pages are still missing
