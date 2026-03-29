"use client";

import { useTransition } from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { createCheckoutSession } from "@/actions/billing/createCheckoutSession";
import { Button } from "@/components/ui/button";

export default function CheckoutButton({
  disabled,
}: {
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      disabled={disabled || isPending}
      onClick={() => {
        startTransition(async () => {
          try {
            const { url } = await createCheckoutSession();
            window.location.href = url;
          } catch {
            toast.error("Failed to start checkout");
          }
        });
      }}
    >
      {isPending ? <Loader2Icon className="animate-spin" /> : "Upgrade to Pro"}
    </Button>
  );
}
