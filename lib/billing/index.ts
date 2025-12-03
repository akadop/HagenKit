/**
 * Billing Service
 *
 * Provider-agnostic billing abstraction layer.
 * Automatically selects the correct provider based on configuration.
 */

import { billingConfig, validateBillingConfig, isClientBillingEnabled } from "./config";
import type { BillingProvider } from "./types";
import { PolarBillingProvider } from "./providers/polar";
import { NullBillingProvider } from "./providers/null";

// Check if we're running on the client or server
const isClient = typeof window !== "undefined";

// Use appropriate validation based on environment
let isEnabled: boolean;
let validation: { valid: boolean; message: string; warnings?: string[] } | null = null;

if (isClient) {
  // Client-side: Only check public env var
  isEnabled = isClientBillingEnabled();
} else {
  // Server-side: Full validation including secrets
  validation = validateBillingConfig();
  isEnabled = billingConfig.enabled && validation.valid;

  // Server-side logging
  if (!validation.valid) {
    console.error(`❌ Billing configuration error: ${validation.message}`);
  } else if (billingConfig.enabled) {
    console.log(`✅ ${validation.message}`);
    if (validation.warnings) {
      validation.warnings.forEach((warning) => console.warn(`⚠️  ${warning}`));
    }
  }
}

/**
 * Create the appropriate billing provider based on configuration
 */
function createBillingProvider(): BillingProvider {
  // If billing is disabled, return null provider
  if (!isEnabled) {
    return new NullBillingProvider();
  }

  // Return provider based on configuration
  switch (billingConfig.provider) {
    case "polar":
      return new PolarBillingProvider();

    case "stripe":
      // TODO: Implement StripeProvider when ready
      console.warn("⚠️  Stripe provider not yet implemented. Using null provider.");
      return new NullBillingProvider();

    case "none":
    default:
      return new NullBillingProvider();
  }
}

/**
 * Singleton billing service instance
 *
 * Use this throughout your application for all billing operations:
 *
 * @example
 * ```typescript
 * import { billingService } from "@/lib/billing";
 *
 * // Check if billing is enabled
 * if (billingService.isEnabled()) {
 *   // Create checkout
 *   await billingService.checkout({ products: ["prod_123"] });
 * }
 * ```
 */
export const billingService = createBillingProvider();

/**
 * Check if billing is enabled
 * Use this for conditional rendering in components
 */
export const isBillingEnabled = isEnabled;

// Re-export types for convenience
export type {
  BillingProvider,
  Subscription,
  SubscriptionStatus,
  CheckoutParams,
  CheckoutResult,
  PortalResult,
} from "./types";

export { BillingError, BillingNotEnabledError } from "./types";
export { billingConfig } from "./config";
