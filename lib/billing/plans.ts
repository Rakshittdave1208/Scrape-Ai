export const PLANS = {
  FREE: {
    key: "FREE",
    name: "Free",
    credits: 100,
    workflows: 3,
    priceId: null,
  },
  PRO: {
    key: "PRO",
    name: "Pro",
    credits: 1000,
    workflows: 20,
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? null,
  },
} as const;

export type PlanKey = keyof typeof PLANS;
