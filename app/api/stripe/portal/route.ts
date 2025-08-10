import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getCurrentUserId } from "@/lib/auth";
import { dbOperations } from "@/lib/database";

export async function POST() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const customerId = dbOperations.getStripeCustomerByUserId(userId)?.stripe_customer_id;
    if (!customerId) return NextResponse.json({ error: "No Stripe customer" }, { status: 400 });

    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: process.env.STRIPE_BILLING_PORTAL_RETURN_URL || `${process.env.NEXT_PUBLIC_APP_URL}/membership`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Portal error", message }, { status: 500 });
  }
}


