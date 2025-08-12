# caveboxing# Caveboxing

## Setup

1. Install dependencies:
   ```bash
   corepack enable
   pnpm install
"last-tested: 2025-07-31 10:28:03.65"  

```

## Stripe Setup (Test Mode)

1) Create `.env.local` with:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ADULT_UNLIMITED=price_...
STRIPE_PRICE_YOUTH_2X=price_...
STRIPE_PRICE_DROP_IN=price_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
STRIPE_BILLING_PORTAL_RETURN_URL=http://localhost:3000/membership

# NextAuth (optional if you unify sessions)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace_with_generated_secret
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Prisma (for NextAuth adapter)
DATABASE_URL=file:./prisma/dev.db
```

2) Install Stripe CLI (Windows): download from stripe.com/docs/stripe-cli and add to PATH.

3) Login and listen to webhooks:

```bat
stripe login
stripe listen --events checkout.session.completed,invoice.paid,invoice.payment_failed,customer.subscription.updated,customer.subscription.deleted --forward-to localhost:3000/api/stripe/webhook | cat
```

4) To add a new price later:
- Create Price in Stripe Dashboard
- Add `STRIPE_PRICE_<CODE>=price_...` to `.env.local`
- Restart dev server
  