/**
 * Billing Types & Interfaces
 *
 * Provider-agnostic types for the billing system.
 * These interfaces allow swapping between Polar, Stripe, or other providers.
 */

/**
 * Subscription status
 */
export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "past_due"
  | "trialing"
  | "unpaid";

/**
 * Subscription object (normalized across providers)
 */
export interface Subscription {
  id: string;
  status: SubscriptionStatus;
  productId: string;
  productName?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Checkout parameters for creating a checkout session
 */
export interface CheckoutParams {
  /**
   * Array of product IDs to include in checkout
   */
  products: string[];

  /**
   * Optional reference ID (e.g., workspace ID, user ID)
   */
  referenceId?: string;

  /**
   * Success redirect URL (overrides default)
   */
  successUrl?: string;

  /**
   * Cancel redirect URL (overrides default)
   */
  cancelUrl?: string;

  /**
   * Additional metadata to attach to the checkout session
   */
  metadata?: Record<string, string>;
}

/**
 * Checkout result returned after creating a checkout session
 */
export interface CheckoutResult {
  /**
   * Checkout session ID
   */
  id: string;

  /**
   * URL to redirect user to complete checkout
   */
  url: string;
}

/**
 * Customer portal result
 */
export interface PortalResult {
  /**
   * URL to redirect user to customer portal
   */
  url: string;
}

/**
 * Main billing provider interface
 *
 * Implement this interface for each payment provider (Polar, Stripe, etc.)
 */
export interface BillingProvider {
  /**
   * Check if billing is enabled and configured
   */
  isEnabled(): boolean;

  /**
   * Create a checkout session
   *
   * @param params Checkout parameters
   * @returns Promise resolving to checkout URL
   * @throws Error if billing is not enabled or checkout fails
   */
  checkout(params: CheckoutParams): Promise<CheckoutResult>;

  /**
   * Get customer portal URL
   *
   * @returns Promise resolving to portal URL
   * @throws Error if billing is not enabled or portal access fails
   */
  portal(): Promise<PortalResult>;

  /**
   * List active subscriptions for the current user
   *
   * @returns Promise resolving to array of subscriptions
   * @throws Error if billing is not enabled or listing fails
   */
  listSubscriptions(): Promise<Subscription[]>;

  /**
   * Cancel a subscription
   *
   * @param subscriptionId The subscription ID to cancel
   * @param immediately Whether to cancel immediately or at period end
   * @returns Promise resolving when cancellation is complete
   * @throws Error if billing is not enabled or cancellation fails
   */
  cancelSubscription(subscriptionId: string, immediately?: boolean): Promise<void>;
}

/**
 * Billing error class for provider-specific errors
 */
export class BillingError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "BillingError";
  }
}

/**
 * Error thrown when billing is not enabled
 */
export class BillingNotEnabledError extends BillingError {
  constructor() {
    super(
      "Billing is not enabled. Set ENABLE_BILLING=true in your environment variables to enable billing features.",
      "BILLING_NOT_ENABLED"
    );
    this.name = "BillingNotEnabledError";
  }
}
