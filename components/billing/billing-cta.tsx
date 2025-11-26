"use client";

import { billingService, BillingNotEnabledError } from "@/lib/billing";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface BillingCTAProps {
  planId: string; // This should be the Product ID from your billing provider
  children?: React.ReactNode;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  workspaceId?: string; // Optional: for organization reference
}

export function BillingCTA({ planId, children, className, variant = "default", workspaceId }: BillingCTAProps) {
  const [isPending, startTransition] = useTransition();
  const isEnabled = billingService.isEnabled();

  const handleCheckout = () => {
    if (!isEnabled) {
      toast.error("Billing is not configured. Please contact support.");
      return;
    }

    if (!planId) {
      toast.error("Invalid plan selected. Please try again.");
      return;
    }

    startTransition(async () => {
      try {
        await billingService.checkout({
          products: [planId],
          referenceId: workspaceId,
        });
      } catch (error) {
        console.error("Checkout error:", error);

        if (error instanceof BillingNotEnabledError) {
          toast.error("Billing is not configured. Please contact support.");
        } else if (error instanceof Error) {
          toast.error(error.message || "Failed to start checkout. Please try again.");
        } else {
          toast.error("Something went wrong. Please try again.");
        }
      }
    });
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={isPending || !isEnabled || !planId}
      className={className}
      variant={variant}
      aria-busy={isPending}
    >
      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children || "Upgrade"}
    </Button>
  );
}
