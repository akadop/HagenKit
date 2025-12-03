import { createAuthClient } from "better-auth/react";
import { lastLoginMethodClient, adminClient, magicLinkClient } from "better-auth/client/plugins";
import { polarClient } from "@polar-sh/better-auth";

// Check if billing is enabled (client-side)
const isBillingEnabled = process.env.NEXT_PUBLIC_ENABLE_BILLING === "true";

// Build plugins array conditionally
const plugins = [lastLoginMethodClient(), adminClient(), magicLinkClient()];

// Only add Polar client plugin if billing is enabled
if (isBillingEnabled) {
  plugins.push(polarClient());
}

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins,
});

export const { signIn, signOut, signUp, useSession } = authClient;

// Export billing status for use in components
export { isBillingEnabled };
