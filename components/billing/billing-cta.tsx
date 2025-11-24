"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { toast } from "sonner";

interface BillingCTAProps {
  planId: string; // This should be the Polar Product ID or slug if configured
  children?: React.ReactNode;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  workspaceId?: string; // Optional: for organization reference
}

export function BillingCTA({ planId, children, className, variant = "default", workspaceId }: BillingCTAProps) {
  const [isPending, startTransition] = useTransition();

  const handleCheckout = () => {
    startTransition(async () => {
      try {
        await authClient.checkout({
          products: [planId],
          referenceId: workspaceId, // Pass workspace ID as reference if needed
        });
      } catch (error) {
        toast.error("Something went wrong. Please try again.");
      }
    });
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={isPending}
      className={className}
      variant={variant}
      aria-busy={isPending}
    >
      {isPending ? "Loading..." : children || "Upgrade"}
    </Button>
  );
}
