"use client";

import { billingService, BillingNotEnabledError } from "@/lib/billing";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { toast } from "sonner";

interface PortalButtonProps {
  children?: React.ReactNode;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function PortalButton({ children, className, variant = "outline" }: PortalButtonProps) {
  const [isPending, startTransition] = useTransition();
  const isEnabled = billingService.isEnabled();

  const handlePortal = () => {
    if (!isEnabled) {
      toast.error("Billing is not configured. Please contact support.");
      return;
    }

    startTransition(async () => {
      try {
        await billingService.portal();
      } catch (error) {
        console.error("Portal error:", error);

        if (error instanceof BillingNotEnabledError) {
          toast.error("Billing is not configured. Please contact support.");
        } else if (error instanceof Error) {
          toast.error(error.message || "Failed to access billing portal. Please try again.");
        } else {
          toast.error("Something went wrong. Please try again.");
        }
      }
    });
  };

  return (
    <Button
      onClick={handlePortal}
      disabled={isPending || !isEnabled}
      className={className}
      variant={variant}
      aria-busy={isPending}
    >
      {isPending ? "Loading…" : children || "Manage Billing"}
    </Button>
  );
}
