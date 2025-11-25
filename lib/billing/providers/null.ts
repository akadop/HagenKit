/**
 * Null Billing Provider
 *
 * Implementation of BillingProvider for when billing is disabled.
 * Returns helpful error messages instead of crashing.
 */

import type {
  BillingProvider,
  CheckoutParams,
  CheckoutResult,
  PortalResult,
  Subscription,
} from "../types";
import { BillingNotEnabledError } from "../types";

/**
 * Null implementation when billing is disabled
 */
export class NullBillingProvider implements BillingProvider {
  isEnabled(): boolean {
    return false;
  }

  async checkout(_params: CheckoutParams): Promise<CheckoutResult> {
    throw new BillingNotEnabledError();
  }

  async portal(): Promise<PortalResult> {
    throw new BillingNotEnabledError();
  }

  async listSubscriptions(): Promise<Subscription[]> {
    // Return empty array instead of throwing - allows billing page to render
    return [];
  }

  async cancelSubscription(_subscriptionId: string, _immediately?: boolean): Promise<void> {
    throw new BillingNotEnabledError();
  }
}
