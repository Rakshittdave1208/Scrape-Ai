"use server";

import { auth, currentUser } from "@clerk/nextjs/server";

import { ensureBillingAccount } from "@/lib/billing/account";
import { PLANS } from "@/lib/billing/plans";
import { getStripeClient } from "@/lib/stripe";

export async function createCheckoutSession() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthenticated");
  }

  const proPlan = PLANS.PRO;

  if (!proPlan.priceId) {
    throw new Error("Missing Stripe price configuration");
  }

  const billingAccount = await ensureBillingAccount(userId);

  if (
    billingAccount.planKey === "PRO" &&
    ["active", "trialing", "past_due"].includes(billingAccount.status)
  ) {
    throw new Error("You already have an active Pro subscription");
  }

  const user = await currentUser();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const stripe = getStripeClient();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: proPlan.priceId,
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/billing?checkout=success`,
    cancel_url: `${appUrl}/billing?checkout=cancelled`,
    customer: billingAccount.stripeCustomerId ?? undefined,
    customer_email:
      billingAccount.stripeCustomerId
        ? undefined
        : user?.emailAddresses[0]?.emailAddress ?? undefined,
    client_reference_id: userId,
    allow_promotion_codes: true,
    metadata: {
      userId,
      plan: proPlan.key,
    },
    subscription_data: {
      metadata: {
        userId,
        plan: proPlan.key,
      },
    },
  });

  if (!session.url) {
    throw new Error("Failed to create Stripe checkout session");
  }

  return { url: session.url };
}
