"use client";

import { useTransition } from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { createCustomerPortalSession } from "@/actions/billing/createCustomerPortalSession";
import { Button } from "@/components/ui/button";

export default function ManageSubscriptionButton({
  disabled,
}: {
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      disabled={disabled || isPending}
      onClick={() => {
        startTransition(async () => {
          try {
            const { url } = await createCustomerPortalSession();
            window.location.href = url;
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Failed to open customer portal";
            toast.error(message);
          }
        });
      }}
    >
      {isPending ? <Loader2Icon className="animate-spin" /> : "Manage subscription"}
    </Button>
  );
}
