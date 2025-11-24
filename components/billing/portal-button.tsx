"use client";

import { authClient } from "@/lib/auth-client";
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

  const handlePortal = () => {
    startTransition(async () => {
      try {
        await authClient.customer.portal();
      } catch (error) {
        toast.error("Something went wrong. Please try again.");
      }
    });
  };

  return (
    <Button
      onClick={handlePortal}
      disabled={isPending}
      className={className}
      variant={variant}
      aria-busy={isPending}
    >
      {isPending ? "Loading..." : children || "Manage Billing"}
    </Button>
  );
}
