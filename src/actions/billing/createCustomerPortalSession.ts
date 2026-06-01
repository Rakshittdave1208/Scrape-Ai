"use server";

import { auth } from "@clerk/nextjs/server";

import { ensureBillingAccount } from "@/lib/billing/account";
import { getStripeClient } from "@/lib/stripe";

export async function createCustomerPortalSession() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthenticated");
  }

  const billingAccount = await ensureBillingAccount(userId);

  if (!billingAccount.stripeCustomerId) {
    throw new Error("No Stripe customer found for this account");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const stripe = getStripeClient();

  const session = await stripe.billingPortal.sessions.create({
    customer: billingAccount.stripeCustomerId,
    return_url: `${appUrl}/billing`,
  });

  if (!session.url) {
    throw new Error("Failed to create customer portal session");
  }

  return { url: session.url };
}
