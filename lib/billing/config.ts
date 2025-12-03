/**
 * Billing Configuration
 *
 * Centralized configuration for the billing system.
 * Supports multiple providers (Polar, Stripe) with optional billing.
 */

export type BillingProvider = "polar" | "stripe" | "none";

export interface BillingConfig {
  enabled: boolean;
  provider: BillingProvider;
  polar: {
    accessToken: string | undefined;
    server: "sandbox" | "production";
    webhookSecret: string | undefined;
    orgId: string | undefined;
  };
  stripe: {
    publicKey: string | undefined;
    secretKey: string | undefined;
    webhookSecret: string | undefined;
  };
}

/**
 * Load billing configuration from environment variables
 */
export const billingConfig: BillingConfig = {
  enabled: process.env.ENABLE_BILLING === "true",
  provider: (process.env.BILLING_PROVIDER as BillingProvider) || "polar",
  polar: {
    accessToken: process.env.POLAR_ACCESS_TOKEN,
    server: process.env.POLAR_SERVER === "production" ? "production" : "sandbox",
    webhookSecret: process.env.POLAR_WEBHOOK_SECRET,
    orgId: process.env.POLAR_ORG_ID,
  },
  stripe: {
    publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
};

/**
 * Validation result for billing configuration
 */
export interface ValidationResult {
  valid: boolean;
  message: string;
  warnings?: string[];
}

/**
 * Client-safe billing status (no secrets exposed)
 */
export interface BillingStatus {
  enabled: boolean;
  configured: boolean;
  provider: BillingProvider;
  mode: "sandbox" | "production" | null;
  configErrors: string[];
}

/**
 * Get billing status for client consumption (safe to expose)
 * This function returns configuration state without exposing any secrets.
 */
export function getBillingStatus(): BillingStatus {
  const configErrors: string[] = [];

  // If billing is not enabled, return early
  if (!billingConfig.enabled) {
    return {
      enabled: false,
      configured: false,
      provider: billingConfig.provider,
      mode: null,
      configErrors: [],
    };
  }

  // Check configuration based on provider
  let configured = true;
  let mode: "sandbox" | "production" | null = null;

  if (billingConfig.provider === "polar") {
    if (!billingConfig.polar.accessToken) {
      configured = false;
      configErrors.push("POLAR_ACCESS_TOKEN is not set");
    }
    mode = billingConfig.polar.server;
  } else if (billingConfig.provider === "stripe") {
    if (!billingConfig.stripe.secretKey) {
      configured = false;
      configErrors.push("STRIPE_SECRET_KEY is not set");
    }
    if (!billingConfig.stripe.publicKey) {
      configErrors.push("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set");
    }
    // Stripe doesn't have sandbox/production mode in the same way
    mode = "production";
  } else if (billingConfig.provider === "none") {
    configured = false;
    configErrors.push("BILLING_PROVIDER is set to 'none' but billing is enabled");
  }

  return {
    enabled: billingConfig.enabled,
    configured,
    provider: billingConfig.provider,
    mode,
    configErrors,
  };
}

/**
 * Check if billing is enabled on the client side (only uses public env vars)
 * This is safe to use in browser context
 */
export function isClientBillingEnabled(): boolean {
  // Only check the public environment variable
  return process.env.NEXT_PUBLIC_ENABLE_BILLING === "true";
}

/**
 * Validate billing configuration based on enabled state and provider
 * Note: This should only be used server-side as it checks for secrets
 */
export function validateBillingConfig(): ValidationResult {
  const warnings: string[] = [];

  // If billing is disabled, no validation needed
  if (!billingConfig.enabled) {
    return {
      valid: true,
      message: "Billing is disabled. Set ENABLE_BILLING=true to enable billing features.",
    };
  }

  // Validate based on provider
  if (billingConfig.provider === "polar") {
    if (!billingConfig.polar.accessToken) {
      return {
        valid: false,
        message: "POLAR_ACCESS_TOKEN is required when billing is enabled with Polar provider.",
      };
    }

    if (!billingConfig.polar.webhookSecret) {
      warnings.push(
        "POLAR_WEBHOOK_SECRET is not set. Webhooks will not be secure. Set this in production."
      );
    }

    if (!billingConfig.polar.orgId) {
      warnings.push(
        "POLAR_ORG_ID is not set. Some operations may require this for filtering."
      );
    }

    return {
      valid: true,
      message: `Billing enabled with Polar (${billingConfig.polar.server} mode)`,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  if (billingConfig.provider === "stripe") {
    if (!billingConfig.stripe.secretKey) {
      return {
        valid: false,
        message: "STRIPE_SECRET_KEY is required when billing is enabled with Stripe provider.",
      };
    }

    if (!billingConfig.stripe.publicKey) {
      warnings.push(
        "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set. Client-side operations will fail."
      );
    }

    if (!billingConfig.stripe.webhookSecret) {
      warnings.push(
        "STRIPE_WEBHOOK_SECRET is not set. Webhooks will not be secure. Set this in production."
      );
    }

    return {
      valid: true,
      message: "Billing enabled with Stripe",
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  // If provider is "none" but billing is enabled, that's a misconfiguration
  if (billingConfig.provider === "none") {
    return {
      valid: false,
      message: 'BILLING_PROVIDER is set to "none" but ENABLE_BILLING is true. Either set BILLING_PROVIDER to "polar" or "stripe", or set ENABLE_BILLING=false.',
    };
  }

  // Unknown provider
  return {
    valid: false,
    message: `Unknown billing provider: ${billingConfig.provider}. Supported providers: polar, stripe, none.`,
  };
}

/**
 * Log billing configuration status (useful for debugging)
 */
export function logBillingStatus() {
  const validation = validateBillingConfig();

  if (!billingConfig.enabled) {
    console.log("ℹ️  Billing is disabled");
    return;
  }

  if (validation.valid) {
    console.log(`✅ ${validation.message}`);
    if (validation.warnings) {
      validation.warnings.forEach((warning) => console.warn(`⚠️  ${warning}`));
    }
  } else {
    console.error(`❌ Billing configuration error: ${validation.message}`);
  }
}
