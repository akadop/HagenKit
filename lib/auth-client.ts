import { createAuthClient } from "better-auth/react";
import { lastLoginMethodClient, adminClient, magicLinkClient } from "better-auth/client/plugins";
import { polarClient } from "@polar-sh/better-auth";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [lastLoginMethodClient(), adminClient(), magicLinkClient(), polarClient()],
});

export const { signIn, signOut, signUp, useSession } = authClient;
