import { NextResponse } from "next/server";
import { z } from "@/lib/z";
import { getStripe, getPriceId, type PlanCode } from "@/lib/stripe";
import { getCurrentUserId } from "@/lib/auth";
import { dbOperations } from "@/lib/database";

const bodySchema = z.object({
  planCode: z.enum(["ADULT_UNLIMITED", "YOUTH_2X", "DROP_IN"]),
  // Optional: when paying for a single class drop-in, include the instance id
  class_instance_id: z.number().int().positive().optional(),
});

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
    }

    const { planCode, class_instance_id } = parsed.data;
    // Validate required env first to give actionable error
    const missing: string[] = [];
    if (!process.env.STRIPE_SECRET_KEY) missing.push("STRIPE_SECRET_KEY");
    if (!process.env.NEXT_PUBLIC_APP_URL) missing.push("NEXT_PUBLIC_APP_URL");
    try { getPriceId(planCode as PlanCode); } catch { missing.push(`STRIPE_PRICE_${planCode}`); }
    if (missing.length) {
      return NextResponse.json({ error: "Missing configuration", missing }, { status: 500 });
    }

    const stripe = getStripe();

    // Ensure Stripe customer
    let customerId = dbOperations.getStripeCustomerByUserId(userId)?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { userId: String(userId) },
      });
      customerId = customer.id;
      dbOperations.insertStripeCustomer(userId, customerId);
    }

    const priceId = getPriceId(planCode as PlanCode);

    const mode = planCode === "DROP_IN" ? "payment" : "subscription";
    const session = await stripe.checkout.sessions.create({
      mode,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/membership?status=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/membership?status=cancel`,
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      client_reference_id: String(userId),
      metadata: {
        planCode,
        // Tag drop-in flows so webhook can confirm bookings
        ...(mode === "payment"
          ? { flow: "DROP_IN", class_instance_id: class_instance_id ? String(class_instance_id) : undefined }
          : {}),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("/api/stripe/checkout error:", message);
    return NextResponse.json({ error: "Checkout error", message }, { status: 500 });
  }
}


