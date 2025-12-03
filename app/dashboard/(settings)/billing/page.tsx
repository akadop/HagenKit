"use client";

import { authClient } from "@/lib/auth-client";
import { billingService } from "@/lib/billing";
import { PLANS } from "@/config/plans";
import { BillingCTA } from "@/components/billing/billing-cta";
import { PortalButton } from "@/components/billing/portal-button";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import type { Subscription } from "@/lib/billing";
import type { BillingStatus } from "@/lib/billing/config";
import Link from "next/link";
import {
  CreditCardIcon,
  ArrowUpRightIcon,
  AlertCircleIcon,
  SettingsIcon,
  XCircleIcon,
  FlaskConicalIcon,
  RefreshCwIcon,
  KeyIcon,
} from "lucide-react";
import { BillingError } from "@/lib/billing";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { BillingSkeleton } from "@/components/billing/billing-skeleton";

export default function BillingPage() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);
  const isBillingEnabled = billingService.isEnabled();
  const searchParams = useSearchParams();

  // Fetch billing status from API
  useEffect(() => {
    async function fetchBillingStatus() {
      try {
        const res = await fetch("/api/billing/status");
        if (res.ok) {
          const data = await res.json();
          setBillingStatus(data);
        }
      } catch (err) {
        console.error("Failed to fetch billing status", err);
      }
    }
    fetchBillingStatus();
  }, []);

  // Handle checkout success - show toast + confetti
  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "true") {
      // Show success toast
      toast.success("Welcome to Pro!", {
        description: "Your subscription is now active.",
      });

      // Trigger confetti (same pattern as onboarding)
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 50 };

      const randomInRange = (min: number, max: number) =>
        Math.random() * (max - min) + min;

      const interval = window.setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }
        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [searchParams]);

  const fetchSubscriptions = useCallback(async () => {
    if (!isBillingEnabled) {
      setLoading(false);
      return;
    }

    setError(null);
    setErrorCode(null);
    setLoading(true);

    try {
      const data = await billingService.listSubscriptions();
      setSubscriptions(data);
    } catch (err) {
      console.error("Failed to fetch subscriptions", err);

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to load billing information. Please try again.";

      // Detect invalid credentials from error message OR BillingError code
      const isInvalidCredentials =
        (err instanceof BillingError && err.code === "INVALID_CREDENTIALS") ||
        errorMessage.includes("401") ||
        errorMessage.includes("invalid_token") ||
        errorMessage.includes("expired") ||
        errorMessage.includes("revoked");

      if (isInvalidCredentials) {
        setErrorCode("INVALID_CREDENTIALS");
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isBillingEnabled]);

  useEffect(() => {
    if (session) {
      fetchSubscriptions();
    } else {
      setLoading(false);
    }
  }, [session, fetchSubscriptions]);

  // State 0: Session still loading (prevents flicker)
  if (sessionLoading) {
    return <BillingSkeleton />;
  }

  // State 1: Not signed in
  if (!session) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
            <p className="text-muted-foreground mt-1">
              Please sign in to view billing information.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // State 2: Invalid credentials (401 error)
  if (errorCode === "INVALID_CREDENTIALS") {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
            <p className="text-muted-foreground mt-1">
              Manage your subscription and billing details.
            </p>
          </div>
          <Empty>
          <EmptyMedia variant="icon">
            <KeyIcon className="h-6 w-6 text-destructive" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>Invalid API Credentials</EmptyTitle>
            <EmptyDescription>
              Your Polar access token is expired, revoked, or invalid.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="text-left w-full">
              <p className="text-sm font-medium mb-2">To fix this:</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Go to Polar.sh Settings → API → Access Tokens</li>
                <li>Generate a new access token</li>
                <li>
                  Update{" "}
                  <code className="bg-muted px-1 rounded">
                    POLAR_ACCESS_TOKEN
                  </code>{" "}
                  in your .env file
                </li>
                <li>Restart your dev server</li>
              </ol>
            </div>
            <Button variant="outline" asChild className="mt-4">
              <Link href="/help/polar-integration">
                View setup guide
                <ArrowUpRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
        </div>
      </div>
    );
  }

  // State 3: Generic error fetching subscriptions
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
            <p className="text-muted-foreground mt-1">
              Manage your subscription and billing details.
            </p>
          </div>
          <Empty>
            <EmptyMedia variant="icon">
              <AlertCircleIcon className="h-6 w-6 text-destructive" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>Unable to Load Billing</EmptyTitle>
              <EmptyDescription>{error}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={fetchSubscriptions} variant="outline">
                <RefreshCwIcon className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      </div>
    );
  }

  // State 4: Partial config (enabled but missing credentials)
  if (billingStatus?.enabled && !billingStatus?.configured) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
            <p className="text-muted-foreground mt-1">
              Manage your subscription and billing details.
            </p>
          </div>
          <Empty>
            <EmptyMedia variant="icon">
              <SettingsIcon className="h-6 w-6 text-muted-foreground" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>Billing Partially Configured</EmptyTitle>
              <EmptyDescription>
                Billing is enabled but missing required credentials.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <div className="text-left w-full">
                <p className="text-sm font-medium mb-2">Missing configuration:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {billingStatus.configErrors.map((err) => (
                    <li key={err} className="flex items-center gap-2">
                      <XCircleIcon className="h-4 w-4 text-destructive" />
                      <code className="bg-muted px-1 rounded">{err}</code>
                    </li>
                  ))}
                </ul>
              </div>
              <Button variant="outline" asChild className="mt-4">
                <Link href="/help/polar-integration">
                  View setup guide
                  <ArrowUpRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      </div>
    );
  }

  // State 5: Billing not enabled
  if (!isBillingEnabled) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
            <p className="text-muted-foreground mt-1">
              Manage your subscription and billing details.
            </p>
          </div>
          <Empty>
            <EmptyMedia variant="icon">
              <CreditCardIcon className="h-6 w-6 text-muted-foreground" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>Billing Not Configured</EmptyTitle>
              <EmptyDescription>
                Enable billing to start accepting payments and managing
                subscriptions for your application.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <p className="text-sm text-muted-foreground mb-4">
                To enable billing features, set{" "}
                <code className="rounded bg-muted px-1 py-0.5">
                  ENABLE_BILLING=true
                </code>{" "}
                in your environment variables and configure your payment provider
                credentials.
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
      </div>
    );
  }

  // State 6: Loading
  if (loading) {
    return <BillingSkeleton />;
  }

  const activeSubscription = subscriptions.find(
    (sub) => sub.status === "active" || sub.status === "trialing"
  );
  const isSubscribed = !!activeSubscription;

  // Sandbox mode indicator component
  const SandboxBanner = () =>
    billingStatus?.mode === "sandbox" ? (
      <div className="mb-4 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 flex items-center gap-2">
        <FlaskConicalIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
        <span className="text-sm text-yellow-800 dark:text-yellow-200">
          Test Mode - Payments will not be charged. Use card{" "}
          <code className="font-mono bg-yellow-100 dark:bg-yellow-800/50 px-1 rounded">
            4242 4242 4242 4242
          </code>
        </span>
      </div>
    ) : null;

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground mt-1">
            Manage your subscription and billing details.
          </p>
        </div>
        <SandboxBanner />
        <div className="border-t border-border pt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {PLANS.map((plan) => {
              const isCurrentPlan =
                activeSubscription?.productId === plan.polarProductId;

              return (
                <div
                  key={plan.id}
                  className={`rounded-md border p-4 ${
                    isCurrentPlan ? "border-primary ring-1 ring-primary" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{plan.name}</h4>
                    {isCurrentPlan ? (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                        Current Plan
                      </span>
                    ) : (
                      <span className="text-sm font-medium">
                        {plan.price.displayAmount}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature.text} className="flex items-center">
                        <span
                          className={`mr-2 ${feature.included ? "text-green-500" : "text-gray-400"}`}
                        >
                          {feature.included ? "✓" : "✕"}
                        </span>
                        {feature.text}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    {isCurrentPlan ? (
                      <PortalButton className="w-full" />
                    ) : (
                      <BillingCTA
                        planId={plan.polarProductId || ""}
                        className="w-full"
                      >
                        {isSubscribed
                          ? `Switch to ${plan.name}`
                          : `Upgrade to ${plan.name}`}
                      </BillingCTA>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
