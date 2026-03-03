# Sweat with Scott

Online boxing and fitness coaching platform with:
- One-time program: `8-Week Boxing Reset`
- Subscription program: `Sweat with Scott Daily`
- In-person class memberships

## Local setup

```bash
corepack enable
pnpm install
pnpm dev
```

## Environment variables

Copy `.env.example` to `.env.local` and fill values.

Required Stripe keys for checkout:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ADULT_UNLIMITED`
- `STRIPE_PRICE_YOUTH_2X`
- `STRIPE_PRICE_DROP_IN`
- `STRIPE_PRICE_EIGHT_WEEK_RESET`
- `STRIPE_PRICE_DAILY_DRILLS_MONTHLY`
- `NEXT_PUBLIC_APP_URL`
- `STRIPE_BILLING_PORTAL_RETURN_URL`

## Stripe webhook (local)

```bat
stripe login
stripe listen --events checkout.session.completed,invoice.paid,invoice.payment_failed,customer.subscription.updated,customer.subscription.deleted --forward-to localhost:3000/api/stripe/webhook
```

## Vercel notes

- Add all env vars from `.env.example` in Vercel Project Settings.
- This app currently uses local SQLite (`gym.db`) for app data. Vercel filesystem is ephemeral, so data will not persist between deployments/cold starts.
- For production persistence, migrate app data to a hosted database (Neon, Supabase, PlanetScale, etc.) before scaling paid users.
  