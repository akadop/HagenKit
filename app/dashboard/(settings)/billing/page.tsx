"use client";

import { authClient } from "@/lib/auth-client";
import { PLANS } from "@/config/plans";
import { BillingCTA } from "@/components/billing/billing-cta";
import { PortalButton } from "@/components/billing/portal-button";
import { useEffect, useState } from "react";

export default function BillingPage() {
  const { data: session } = authClient.useSession();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const { data } = await authClient.customer.subscriptions.list();
        if (data) {
          setSubscriptions(data);
        }
      } catch (error) {
        console.error("Failed to fetch subscriptions", error);
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      fetchSubscriptions();
    }
  }, [session]);

  if (!session) {
    return <div>Please sign in to view billing.</div>;
  }

  if (loading) {
    return <div>Loading billing information...</div>;
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
                            You are currently subscribed to {activeSubscription.product.name}.
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
