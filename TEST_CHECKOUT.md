# Test Checkout Guide

Use this flow to verify checkout, webhook fulfillment, email delivery, and file download without touching live payments.

## 1. Prepare local test env

Copy the test env template:

```bash
cp .env.test.example .env
```

Fill in:

- `STRIPE_SECRET_KEY` with your Stripe test secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` with your Stripe test publishable key
- `RESEND_API_KEY`
- `EMAIL_FROM`
- storage credentials
- database URL

Keep `NEXT_PUBLIC_APP_URL=http://localhost:3000` for local testing.

## 2. Start the app

```bash
npm install
npm run dev
```

## 3. Forward Stripe test webhooks

Open a second terminal:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret that Stripe CLI prints and place it into:

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

Restart the dev server after updating `.env`.

## 4. Use a safe test email recipient

Recommended for Resend delivery checks:

```text
delivered@resend.dev
```

You can also use:

```text
delivered+kit@resend.dev
```

## 5. Run a test payment

Open the app:

```text
http://localhost:3000
```

Go through checkout and use Stripe’s test card:

```text
4242 4242 4242 4242
```

Use:

- any future expiry date
- any CVC
- any ZIP/postal code

## 6. What should happen

After successful test payment:

1. Stripe Checkout completes
2. Stripe CLI forwards `checkout.session.completed`
3. your webhook creates the order
4. your app creates a download token
5. Resend sends the email
6. the email contains a working download link

## 7. What to verify

Verify all of these:

- the order is marked paid in the database
- a `downloadLink` row exists
- the email reaches the test inbox
- the download URL works
- the archive downloads successfully

## 8. If checkout works but email fails

Check:

- `RESEND_API_KEY`
- `EMAIL_FROM`
- your verified sender domain in Resend

## 9. If webhook fails

Check:

- Stripe CLI is running
- `STRIPE_WEBHOOK_SECRET` matches the current CLI session
- the app is running on `localhost:3000`

## 10. If download fails

Check:

- storage credentials
- bucket name
- uploaded file key/path in the database
