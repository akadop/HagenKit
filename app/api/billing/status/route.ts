import { NextResponse } from "next/server";
import { getBillingStatus } from "@/lib/billing/config";
import { Polar } from "@polar-sh/sdk";

/**
 * GET /api/billing/status
 * Returns the current billing configuration status (safe for client consumption)
 * Also validates credentials by making a test API call if billing is configured
 */
export async function GET() {
  const status = getBillingStatus();

  // If billing is enabled with credentials, validate them with a test API call
  if (status.enabled && status.configured && status.provider === "polar") {
    try {
      const polar = new Polar({
        accessToken: process.env.POLAR_ACCESS_TOKEN!,
        server: (process.env.POLAR_SERVER as "sandbox" | "production") || "sandbox",
      });

      // Make a simple API call to validate the token
      // Using organizations.list with limit 1 as a lightweight check
      const orgsIterator = await polar.organizations.list({ limit: 1 });
      for await (const _org of orgsIterator) {
        break; // Just need to check if the call succeeds
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Check if this is an invalid credentials error
      if (
        errorMessage.includes("401") ||
        errorMessage.includes("invalid_token") ||
        errorMessage.includes("expired") ||
        errorMessage.includes("revoked") ||
        errorMessage.includes("unauthorized")
      ) {
        return NextResponse.json({
          ...status,
          configured: false,
          configErrors: ["POLAR_ACCESS_TOKEN is invalid or expired"],
        });
      }

      // For other errors, log but don't fail the status check
      console.error("Polar API validation error:", errorMessage);
    }
  }

  return NextResponse.json(status);
}
