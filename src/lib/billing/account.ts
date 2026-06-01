import type Stripe from "stripe";

import prisma from "@/lib/prisma";
import { getPlanKeyFromPriceId, getPlanSnapshot, resolvePlanKey, type PlanKey } from "@/lib/billing/plans";

export async function ensureBillingAccount(userId: string) {
  const existingAccount = await prisma.billingAccount.findUnique({
    where: { userId },
  });

  if (existingAccount) {
    return existingAccount;
  }

  const freePlan = getPlanSnapshot("FREE");

  return prisma.billingAccount.create({
    data: {
      userId,
      planKey: freePlan.key,
      status: "free",
      workflowCredits: freePlan.workflowCredits,
      architectureCredits: freePlan.architectureCredits,
      workflowLimit: freePlan.workflows,
    },
  });
}

export async function getBillingAccountForUser(userId: string) {
  return ensureBillingAccount(userId);
}

function getSubscriptionPriceId(subscription: Stripe.Subscription) {
  return subscription.items.data[0]?.price?.id ?? null;
}

function getSubscriptionPeriodEnd(subscription: Stripe.Subscription) {
  const periodEnd = subscription.items.data[0]?.current_period_end ?? null;

  if (!periodEnd) {
    return null;
  }

  return new Date(periodEnd * 1000);
}

export async function syncBillingAccountFromStripeSubscription(input: {
  userId?: string | null;
  stripeCustomerId: string;
  subscription: Stripe.Subscription;
}) {
  const priceId = getSubscriptionPriceId(input.subscription);
  const planKey = getPlanKeyFromPriceId(priceId);
  const plan = getPlanSnapshot(planKey);
  const resolvedUserId =
    input.userId ??
    (
      await prisma.billingAccount.findFirst({
        where: {
          OR: [
            { stripeCustomerId: input.stripeCustomerId },
            { stripeSubscriptionId: input.subscription.id },
          ],
        },
        select: { userId: true },
      })
    )?.userId;

  if (!resolvedUserId) {
    return null;
  }

  const existingAccount = await ensureBillingAccount(resolvedUserId);

  return prisma.billingAccount.update({
    where: { id: existingAccount.id },
    data: {
      planKey,
      status: input.subscription.status,
      workflowCredits: plan.workflowCredits,
      architectureCredits: plan.architectureCredits,
      workflowLimit: plan.workflows,
      stripeCustomerId: input.stripeCustomerId,
      stripeSubscriptionId: input.subscription.id,
      stripePriceId: priceId,
      stripeCurrentPeriodEnd: getSubscriptionPeriodEnd(input.subscription),
      stripeCancelAtPeriodEnd: input.subscription.cancel_at_period_end,
    },
  });
}

export async function downgradeBillingAccountToFree(input: {
  userId?: string | null;
  stripeCustomerId: string;
  stripeSubscriptionId?: string | null;
  status?: string;
}) {
  const resolvedUserId =
    input.userId ??
    (
      await prisma.billingAccount.findFirst({
        where: {
          OR: [
            { stripeCustomerId: input.stripeCustomerId },
            ...(input.stripeSubscriptionId ? [{ stripeSubscriptionId: input.stripeSubscriptionId }] : []),
          ],
        },
        select: { userId: true },
      })
    )?.userId;

  if (!resolvedUserId) {
    return null;
  }

  const freePlan = getPlanSnapshot("FREE");
  const existingAccount = await ensureBillingAccount(resolvedUserId);

  return prisma.billingAccount.update({
    where: { id: existingAccount.id },
    data: {
      planKey: freePlan.key,
      status: input.status ?? "free",
      workflowCredits: freePlan.workflowCredits,
      architectureCredits: freePlan.architectureCredits,
      workflowLimit: freePlan.workflows,
      stripeCustomerId: input.stripeCustomerId,
      stripeSubscriptionId: input.stripeSubscriptionId ?? null,
      stripePriceId: null,
      stripeCurrentPeriodEnd: null,
      stripeCancelAtPeriodEnd: false,
    },
  });
}

export async function recordBillingEvent(stripeEventId: string, type: string, userId?: string | null) {
  try {
    await prisma.billingEvent.create({
      data: {
        stripeEventId,
        type,
        userId: userId ?? null,
      },
    });

    return true;
  } catch {
    return false;
  }
}

export function getPlanSummaryFromAccount(account: {
  planKey: string;
  status: string;
  workflowCredits: number;
  architectureCredits: number;
  workflowLimit: number;
  stripeCurrentPeriodEnd: Date | null;
  stripeCancelAtPeriodEnd: boolean;
}) {
  const planKey = resolvePlanKey(account.planKey);
  const plan = getPlanSnapshot(planKey);

  return {
    ...plan,
    status: account.status,
    workflowCredits: account.workflowCredits,
    architectureCredits: account.architectureCredits,
    workflows: account.workflowLimit,
    currentPeriodEnd: account.stripeCurrentPeriodEnd,
    cancelAtPeriodEnd: account.stripeCancelAtPeriodEnd,
    isPaid: planKey === "PRO",
  };
}

export function getWorkflowLimitForPlan(planKey?: PlanKey | string | null) {
  return getPlanSnapshot(planKey).workflows;
}
