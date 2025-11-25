"use client";

import { billingService } from "@/lib/billing";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Subscription } from "@/lib/billing";

export function PlanStatus() {
  const { data: session } = authClient.useSession();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const isBillingEnabled = billingService.isEnabled();

  useEffect(() => {
    async function fetchSubscriptions() {
      if (!isBillingEnabled || !session) {
        setLoading(false);
        return;
      }

      try {
        const data = await billingService.listSubscriptions();
        setSubscriptions(data);
      } catch (error) {
        console.error("Failed to fetch subscriptions", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSubscriptions();
  }, [session, isBillingEnabled]);

  // Don't show if billing is disabled
  if (!isBillingEnabled) {
    return null;
  }

  // Don't show if not logged in
  if (!session) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Loading plan…</span>
      </div>
    );
  }

  const activeSubscription = subscriptions.find((sub) => sub.status === "active");

  // Show upgrade button if no active subscription
  if (!activeSubscription) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Free Plan</span>
        <Button
          onClick={() => router.push("/dashboard/billing")}
          size="sm"
          variant="default"
        >
          Upgrade
        </Button>
      </div>
    );
  }

  // Show current plan with manage button
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium">{activeSubscription.productName || "Pro"}</span>
      <Button
        onClick={() => router.push("/dashboard/billing")}
        size="sm"
        variant="outline"
      >
        Manage
      </Button>
    </div>
  );
}
