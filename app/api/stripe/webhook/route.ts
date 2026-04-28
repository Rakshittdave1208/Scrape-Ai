import { NextResponse } from "next/server";
import type Stripe from "stripe";

import {
  downgradeBillingAccountToFree,
  recordBillingEvent,
  syncBillingAccountFromStripeSubscription,
} from "@/lib/billing/account";
import { getStripeClient } from "@/lib/stripe";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing webhook configuration" }, { status: 400 });
  }

  const payload = await request.text();
  const stripe = getStripeClient();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  const alreadyProcessed = !(await recordBillingEvent(event.id, event.type));

  if (alreadyProcessed) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
        const customerId =
          typeof session.customer === "string" ? session.customer : session.customer?.id;
        const userId = session.metadata?.userId ?? session.client_reference_id ?? null;

        if (subscriptionId && customerId && userId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
            expand: ["items.data.price"],
          });

          await syncBillingAccountFromStripeSubscription({
            userId,
            stripeCustomerId: customerId,
            subscription,
          });
        }

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
        const userId = subscription.metadata?.userId ?? null;

        await syncBillingAccountFromStripeSubscription({
          userId,
          stripeCustomerId: customerId,
          subscription,
        });

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
        const userId = subscription.metadata?.userId ?? null;

        await downgradeBillingAccountToFree({
          userId,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscription.id,
          status: "cancelled",
        });

        break;
      }

      case "invoice.paid":
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId =
          typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
            expand: ["items.data.price"],
          });
          const customerId =
            typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

          await syncBillingAccountFromStripeSubscription({
            userId: subscription.metadata?.userId ?? null,
            stripeCustomerId: customerId,
            subscription,
          });
        }

        break;
      }

      default:
        break;
    }
  } catch {
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
