"use server";

import { auth } from "@clerk/nextjs/server";

import { PLANS } from "@/lib/billing/plans";
import { stripe } from "@/lib/stripe";

export async function createCheckoutSession() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthenticated");
  }

  const proPlan = PLANS.PRO;

  if (!proPlan.priceId) {
    throw new Error("Missing Stripe price configuration");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

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
    client_reference_id: userId,
    metadata: {
      userId,
      plan: proPlan.key,
    },
  });

  if (!session.url) {
    throw new Error("Failed to create Stripe checkout session");
  }

  return { url: session.url };
}
