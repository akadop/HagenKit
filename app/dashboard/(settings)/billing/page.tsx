"use client";

import { authClient } from "@/lib/auth-client";
import { billingService } from "@/lib/billing";
import { PLANS } from "@/config/plans";
import { BillingCTA } from "@/components/billing/billing-cta";
import { PortalButton } from "@/components/billing/portal-button";
import { useEffect, useState } from "react";
import type { Subscription } from "@/lib/billing";
import Link from "next/link";
import { CreditCardIcon, ArrowUpRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function BillingPage() {
  const { data: session } = authClient.useSession();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const isBillingEnabled = billingService.isEnabled();

  useEffect(() => {
    async function fetchSubscriptions() {
      if (!isBillingEnabled) {
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

    if (session) {
      fetchSubscriptions();
    } else {
      setLoading(false);
    }
  }, [session, isBillingEnabled]);

  if (!session) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Billing</h3>
          <p className="text-sm text-muted-foreground">
            Please sign in to view billing information.
          </p>
        </div>
      </div>
    );
  }

  if (!isBillingEnabled) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Billing</h3>
          <p className="text-sm text-muted-foreground">
            Manage your subscription and billing details.
          </p>
        </div>
        <Empty variant="icon">
          <EmptyMedia>
            <CreditCardIcon className="h-6 w-6 text-muted-foreground" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>Billing Not Configured</EmptyTitle>
            <EmptyDescription>
              Enable billing to start accepting payments and managing subscriptions for your application.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <p className="text-sm text-muted-foreground mb-4">
              To enable billing features, set <code className="rounded bg-muted px-1 py-0.5">ENABLE_BILLING=true</code> in your environment variables and configure your payment provider credentials.
            </p>
            <Button variant="outline" asChild>
              <Link href="/help/polar-integration">
                View setup guide
                <ArrowUpRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Billing</h3>
          <p className="text-sm text-muted-foreground">
            Loading billing information…
          </p>
        </div>
      </div>
    );
  }

  const activeSubscription = subscriptions.find((sub) => sub.status === "active");
  const isSubscribed = !!activeSubscription;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Billing</h3>
        <p className="text-sm text-muted-foreground">
          Manage your subscription and billing details.
        </p>
      </div>
      <div className="border-t border-border pt-6">
        {isSubscribed ? (
            <div className="rounded-md border p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium">Current Subscription</p>
                        <p className="text-sm text-muted-foreground">
                            You are currently subscribed to {activeSubscription.productName || "a plan"}.
                        </p>
                    </div>
                    <PortalButton />
                </div>
            </div>
        ) : (
            <div className="grid gap-6 lg:grid-cols-2">
                {PLANS.map((plan) => (
                    <div key={plan.id} className="rounded-md border p-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium">{plan.name}</h4>
                            <span className="text-sm font-medium">{plan.price.displayAmount}</span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                        <ul className="mt-4 space-y-2 text-sm">
                            {plan.features.map((feature) => (
                                <li key={feature.text} className="flex items-center">
                                    <span className={`mr-2 ${feature.included ? "text-green-500" : "text-gray-400"}`}>
                                        {feature.included ? "✓" : "✕"}
                                    </span>
                                    {feature.text}
                                </li>
                            ))}
                        </ul>
                        <div className="mt-6">
                            <BillingCTA 
                                planId={plan.polarProductId || ""} 
                                className="w-full"
                                // workspaceId={...} // If we need org support, we'd pass it here
                            >
                                Upgrade to {plan.name}
                            </BillingCTA>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
