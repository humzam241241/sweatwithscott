import Stripe from "stripe";

declare global {
  // eslint-disable-next-line no-var
  var __stripe__: Stripe | undefined;
}

export type PlanCode = "ADULT_UNLIMITED" | "YOUTH_2X" | "DROP_IN";

export function getStripe(): Stripe {
  if (!global.__stripe__) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    global.__stripe__ = new Stripe(secretKey, {
      // Use your Stripe account's default API version
      // apiVersion: "2024-06-20",
    });
  }
  return global.__stripe__;
}

export const PRICE_ENV_MAP: Record<PlanCode, string | undefined> = {
  ADULT_UNLIMITED: process.env.STRIPE_PRICE_ADULT_UNLIMITED,
  YOUTH_2X: process.env.STRIPE_PRICE_YOUTH_2X,
  DROP_IN: process.env.STRIPE_PRICE_DROP_IN,
};

export function getPriceId(plan: PlanCode): string {
  const price = PRICE_ENV_MAP[plan];
  if (!price) {
    throw new Error(`Missing Stripe price ID for plan ${plan}`);
  }
  return price;
}
