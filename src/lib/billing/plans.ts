export const PLANS = {
  FREE: {
    key: "FREE",
    name: "Free",
    workflowCredits: 10_000,
    architectureCredits: 100_000,
    workflows: 3,
    priceId: null,
  },
  PRO: {
    key: "PRO",
    name: "Pro",
    workflowCredits: 100_000,
    architectureCredits: 1_000_000,
    workflows: 20,
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? null,
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export function resolvePlanKey(planKey?: string | null): PlanKey {
  return planKey === "PRO" ? "PRO" : "FREE";
}

export function getPlanSnapshot(planKey?: string | null) {
  const resolvedPlanKey = resolvePlanKey(planKey);
  const plan = PLANS[resolvedPlanKey];

  return {
    key: resolvedPlanKey,
    name: plan.name,
    workflowCredits: plan.workflowCredits,
    architectureCredits: plan.architectureCredits,
    workflows: plan.workflows,
    priceId: plan.priceId,
  };
}

export function getPlanKeyFromPriceId(priceId?: string | null): PlanKey {
  if (priceId && priceId === PLANS.PRO.priceId) {
    return "PRO";
  }

  return "FREE";
}
