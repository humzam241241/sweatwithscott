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
STRIPE_PRICE_ADULT_UNLIMITED=price_1RudyVABoeec0NRI67OzH8It
STRIPE_PRICE_YOUTH_2X=price_1RudywABoeec0NRlOK8rsBmD
STRIPE_PRICE_DROP_IN=price_1RudzyABoeec0NRIjqExFd6C
NEXT_PUBLIC_APP_URL=http://localhost:3000
STRIPE_BILLING_PORTAL_RETURN_URL=http://localhost:3000/membership
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
  