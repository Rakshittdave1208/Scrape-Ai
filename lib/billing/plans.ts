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
