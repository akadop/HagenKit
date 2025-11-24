# Billing Integration Guide (Polar via Better Auth)

This guide explains how to configure and use the billing system using the `@polar-sh/better-auth` plugin.

## Quickstart

1.  **Environment Variables**:
    Copy `.env.example` to `.env` and set the following:
    ```bash
    POLAR_ACCESS_TOKEN="your_polar_token"
    POLAR_WEBHOOK_SECRET="your_webhook_secret"
    POLAR_SERVER="sandbox" # or "production"
    ```

2.  **Plan Configuration**:
    Update `config/plans.ts` with your Polar Product IDs.
    ```typescript
    export const PLANS = [
      {
        id: "pro-monthly",
        // ...
        polarProductId: "polar_prod_...",
      },
    ];
    ```

3.  **Webhooks**:
    - **Polar**: Point your Polar webhook to `https://your-app.com/api/auth/webhook/polar`.
    - **Local Dev**: Use a tunnel (e.g., ngrok) to expose `http://localhost:3000/api/auth/webhook/polar`.
    - **Note**: The Better Auth plugin handles the webhook route automatically.

## Architecture

-   **Plugin**: We use `@polar-sh/better-auth` which integrates Polar directly into Better Auth.
-   **Client**: `authClient` exposes methods for checkout, portal, and subscription management.
-   **Config**: `lib/auth.ts` configures the server-side plugin, `lib/auth-client.ts` configures the client-side plugin.

## Testing

-   Use `POLAR_SERVER="sandbox"` in `.env`.
-   Use Polar Sandbox dashboard to create products and view test data.
