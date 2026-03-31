import { CheckIcon, CpuIcon, SparklesIcon, WaypointsIcon, WorkflowIcon } from "lucide-react";

import CheckoutButton from "./_components/CheckoutButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PLANS } from "@/lib/billing/plans";

const planCards = [
  {
    ...PLANS.FREE,
    description: "Start building workflows and experimenting with the architecture canvas.",
    cta: "Current starter plan",
    featured: false,
  },
  {
    ...PLANS.PRO,
    description: "Unlock larger workflow runs and a bigger architecture simulation budget.",
    cta: "Upgrade to Pro",
    featured: true,
  },
];

export default function BillingPage() {
  const isStripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY && PLANS.PRO.priceId);

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <Badge variant="outline" className="w-fit">
          Pricing
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Plans</h1>
        <p className="max-w-3xl text-muted-foreground">
          ScrapeFlow plans are now aligned with the two core experiences in the product: workflow
          execution and architecture design. Start on Free, then upgrade when you need more workflow
          capacity and larger simulation budgets.
        </p>
      </section>

      {!isStripeConfigured && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Stripe setup required</CardTitle>
            <CardDescription>
              Add <code>STRIPE_SECRET_KEY</code>, <code>STRIPE_PRO_PRICE_ID</code>, and{" "}
              <code>NEXT_PUBLIC_APP_URL</code> to start live checkout sessions.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <section className="grid gap-4 xl:grid-cols-2">
        {planCards.map((plan) => (
          <Card
            key={plan.key}
            className={plan.featured ? "border-primary shadow-sm" : ""}
          >
            <CardHeader className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </div>
                {plan.featured && (
                  <Badge className="gap-1">
                    <SparklesIcon size={12} />
                    Recommended
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid gap-3 xl:grid-cols-3">
                <div className="rounded-lg border bg-secondary/30 p-4">
                  <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                    <CpuIcon size={16} />
                    <span className="text-sm font-medium">Workflow Credits</span>
                  </div>
                  <p className="text-2xl font-bold">{plan.workflowCredits.toLocaleString()}</p>
                </div>

                <div className="rounded-lg border bg-secondary/30 p-4">
                  <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                    <WorkflowIcon size={16} />
                    <span className="text-sm font-medium">Workflows</span>
                  </div>
                  <p className="text-2xl font-bold">{plan.workflows}</p>
                </div>

                <div className="rounded-lg border bg-secondary/30 p-4">
                  <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                    <WaypointsIcon size={16} />
                    <span className="text-sm font-medium">Architecture Credits</span>
                  </div>
                  <p className="text-2xl font-bold">{plan.architectureCredits.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckIcon size={14} className="text-primary" />
                  Workflow execution credits
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon size={14} className="text-primary" />
                  Architecture simulation credits
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon size={14} className="text-primary" />
                  Workflow creation limits
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon size={14} className="text-primary" />
                  Ready for Stripe Checkout
                </div>
              </div>

              {plan.key === "PRO" ? (
                <CheckoutButton disabled={!isStripeConfigured} />
              ) : (
                <div className="rounded-md border bg-muted/30 px-4 py-2 text-sm text-muted-foreground">
                  {plan.cta}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
