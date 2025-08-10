import { dbOperations } from "@/lib/database";

export function isMembershipActiveForUserId(userId: number, opts?: { graceDays?: number }): boolean {
  const sub = dbOperations.getSubscriptionByUserId(userId) as
    | { status?: string; current_period_end?: string | null; delinquent_since?: string | null }
    | undefined;
  if (!sub) return false;

  const status = (sub.status || "").toLowerCase();
  if (status === "active" || status === "trialing") return true;

  // grace for past_due
  if (status === "past_due") {
    const graceDays = opts?.graceDays ?? 7;
    if (sub.delinquent_since) {
      const since = new Date(sub.delinquent_since).getTime();
      if (Date.now() - since <= graceDays * 864e5) return true;
    }
  }

  // allow until period end if set and in future
  if (sub.current_period_end) {
    const end = new Date(sub.current_period_end).getTime();
    if (end > Date.now()) return true;
  }
  return false;
}

export function getMemberWithSubscription(userId: number) {
  const sub = dbOperations.getSubscriptionByUserId(userId);
  return { userId, subscription: sub };
}


