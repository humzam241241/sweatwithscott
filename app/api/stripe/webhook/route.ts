import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe } from "@/lib/stripe";
import { dbOperations } from "@/lib/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const stripe = getStripe();
  const sig = (await headers()).get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
  }

  let event: any;
  const rawBody = await req.text();
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: "Signature verification failed" }, { status: 400 });
  }

  // Idempotency
  if (dbOperations.hasProcessedStripeEvent(event.id)) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as {
          mode: string;
          customer: string;
          subscription?: string | null;
          client_reference_id?: string | null;
          metadata?: Record<string, string>;
        };
        const userId = Number(session.client_reference_id);
        if (!Number.isFinite(userId)) break;
        // Ensure customer mapping
        if (session.customer) {
          dbOperations.insertStripeCustomer(userId, session.customer);
        }
        if (session.mode === "subscription" && session.subscription) {
          const planCode = session.metadata?.planCode ?? null;
          dbOperations.upsertSubscription({
            userId,
            stripeSubscriptionId: session.subscription,
            planCode,
            status: "active",
          });
        }
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as any;
        const subId = String(invoice.subscription ?? "");
        if (subId) {
          dbOperations.setSubscriptionStatus(subId, "active", new Date(invoice.lines.data[0]?.period?.end * 1000).toISOString());
          dbOperations.clearDelinquent(subId);
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as any;
        const subId = String(invoice.subscription ?? "");
        if (subId) {
          dbOperations.setDelinquent(subId);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        const status = String(subscription.status ?? "");
        const periodEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null;
        dbOperations.setSubscriptionStatus(subscription.id, status, periodEnd);
        if (event.type === "customer.subscription.deleted") {
          // keep record with canceled status
        }
        break;
      }
      default:
        break;
    }
    dbOperations.markProcessedStripeEvent(event.id);
    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Webhook handler error", message }, { status: 500 });
  }
}


