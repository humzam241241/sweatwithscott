import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe } from "@/lib/stripe";
import { sendMail } from "@/lib/utils";
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
          try {
            const u = dbOperations.getUserById(userId) as any;
            if (u?.email && (u.email_opt_in ?? 1)) {
              await sendMail({ to: u.email, subject: "Cave Boxing – Subscription active", text: `Your membership is now active. Welcome back to the Cave!` });
            }
          } catch {}
        }
        // Handle drop-in payments → create confirmed booking
        if (session.mode === "payment" && session.metadata?.flow === "DROP_IN") {
          const instanceIdRaw = session.metadata?.class_instance_id;
          const instanceId = instanceIdRaw ? Number(instanceIdRaw) : NaN;
          if (Number.isFinite(instanceId)) {
            // Avoid duplicate booking if already exists
            const existing = (dbOperations as any).getUserBookingForClass?.(userId, instanceId);
            if (!existing) {
              try {
                const bookingId = (dbOperations as any).bookClass?.(userId, instanceId);
                if (bookingId) {
                  (dbOperations as any).markPaymentPaid?.(Number(bookingId), "stripe_drop_in");
                }
              } catch {
                // swallow; keep webhook idempotent
              }
            } else {
              try {
                (dbOperations as any).markPaymentPaid?.(existing.id ?? existing.booking_id ?? existing, "stripe_drop_in");
              } catch {}
            }
            try {
              const u = dbOperations.getUserById(userId) as any;
              if (u?.email && (u.email_opt_in ?? 1)) {
                await sendMail({ to: u.email, subject: "Cave Boxing – Drop-in confirmed", text: `Thanks for your drop-in payment. See you in class!` });
              }
            } catch {}
          }
        }
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as any;
        const subId = String(invoice.subscription ?? "");
        if (subId) {
          dbOperations.setSubscriptionStatus(subId, "active", new Date(invoice.lines.data[0]?.period?.end * 1000).toISOString());
          dbOperations.clearDelinquent(subId);
          try {
            const uid = Number(invoice.client_reference_id || 0) || undefined;
            if (uid) {
              const u = dbOperations.getUserById(uid) as any;
              if (u?.email && (u.email_opt_in ?? 1)) await sendMail({ to: u.email, subject: "Cave Boxing – Invoice paid", text: `Your latest invoice was paid successfully.` });
            }
          } catch {}
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as any;
        const subId = String(invoice.subscription ?? "");
        if (subId) {
          dbOperations.setDelinquent(subId);
          try {
            const uid = Number(invoice.client_reference_id || 0) || undefined;
            if (uid) {
              const u = dbOperations.getUserById(uid) as any;
              if (u?.email && (u.email_opt_in ?? 1)) await sendMail({ to: u.email, subject: "Cave Boxing – Payment failed", text: `Your recent payment failed. Please update your payment method in the billing portal.` });
            }
          } catch {}
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


