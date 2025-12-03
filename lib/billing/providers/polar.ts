/**
 * Polar Billing Provider
 *
 * Implementation of BillingProvider interface for Polar.sh
 * Uses the @polar-sh/better-auth plugin via authClient.
 */

import { authClient } from "@/lib/auth-client";
import type {
  BillingProvider,
  CheckoutParams,
  CheckoutResult,
  PortalResult,
  Subscription,
  SubscriptionStatus,
} from "../types";
import { BillingError } from "../types";

/**
 * Polar implementation of the billing provider
 */
export class PolarBillingProvider implements BillingProvider {
  isEnabled(): boolean {
    return true;
  }

  async checkout(params: CheckoutParams): Promise<CheckoutResult> {
    try {
      const result = await authClient.checkout({
        products: params.products,
        referenceId: params.referenceId,
      });

      // Polar's checkout returns void and redirects automatically
      // We need to return a placeholder since the user is redirected
      return {
        id: "redirecting",
        url: params.successUrl || "/dashboard/billing?success=true",
      };
    } catch (error) {
      console.error("Polar checkout error:", error);
      throw new BillingError(
        error instanceof Error ? error.message : "Failed to create checkout session",
        "CHECKOUT_FAILED"
      );
    }
  }

  async portal(): Promise<PortalResult> {
    try {
      await authClient.customer.portal();

      // Polar's portal() redirects automatically
      // Return placeholder since user is redirected
      return {
        url: "/dashboard/billing",
      };
    } catch (error) {
      console.error("Polar portal error:", error);
      throw new BillingError(
        error instanceof Error ? error.message : "Failed to access customer portal",
        "PORTAL_FAILED"
      );
    }
  }

  async listSubscriptions(): Promise<Subscription[]> {
    try {
      const result = await authClient.customer.subscriptions.list();

      // Transform Polar subscriptions to our normalized format
      if (!result.data || !Array.isArray(result.data)) {
        return [];
      }

      return result.data.map((sub: any) => ({
        id: sub.id,
        status: this.mapPolarStatus(sub.status),
        productId: sub.product?.id || sub.productId || "",
        productName: sub.product?.name || sub.productName,
        currentPeriodStart: new Date(sub.currentPeriodStart || sub.current_period_start),
        currentPeriodEnd: new Date(sub.currentPeriodEnd || sub.current_period_end),
        cancelAtPeriodEnd: sub.cancelAtPeriodEnd || sub.cancel_at_period_end || false,
        canceledAt: sub.canceledAt || sub.canceled_at ? new Date(sub.canceledAt || sub.canceled_at) : undefined,
        metadata: sub.metadata || {},
      }));
    } catch (error) {
      console.error("Polar list subscriptions error:", error);

      // Detect 401 invalid token errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes("401") ||
        errorMessage.includes("invalid_token") ||
        errorMessage.includes("expired") ||
        errorMessage.includes("revoked")
      ) {
        throw new BillingError(
          "Your Polar access token is expired, revoked, or invalid.",
          "INVALID_CREDENTIALS"
        );
      }

      throw new BillingError(
        errorMessage || "Failed to list subscriptions",
        "LIST_SUBSCRIPTIONS_FAILED"
      );
    }
  }

  async cancelSubscription(subscriptionId: string, immediately = false): Promise<void> {
    try {
      // Note: This might need to be adjusted based on actual Polar API
      // The authClient might not expose cancel directly
      throw new BillingError(
        "Subscription cancellation should be done through the customer portal",
        "USE_PORTAL_TO_CANCEL"
      );
    } catch (error) {
      console.error("Polar cancel subscription error:", error);
      if (error instanceof BillingError) {
        throw error;
      }
      throw new BillingError(
        error instanceof Error ? error.message : "Failed to cancel subscription",
        "CANCEL_SUBSCRIPTION_FAILED"
      );
    }
  }

  /**
   * Map Polar subscription status to our normalized status
   */
  private mapPolarStatus(polarStatus: string): SubscriptionStatus {
    const statusMap: Record<string, SubscriptionStatus> = {
      active: "active",
      canceled: "canceled",
      incomplete: "incomplete",
      incomplete_expired: "incomplete_expired",
      past_due: "past_due",
      trialing: "trialing",
      unpaid: "unpaid",
    };

    return statusMap[polarStatus.toLowerCase()] || "active";
  }
}
