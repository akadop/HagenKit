# Billing Setup Guide

HagenKit includes an optional, provider-agnostic billing system. Billing is **disabled by default** for easy setup.

## Quick Start (No Billing)

The application works out of the box without billing configured:

```bash
cp .env.example .env
pnpm install
pnpm dev
```

Users can sign up and use the app freely. Billing features are hidden when disabled.

---

## Enable Billing with Polar

### Prerequisites

1. Create a Polar account at [https://sandbox.polar.sh](https://sandbox.polar.sh) (sandbox) or [https://polar.sh](https://polar.sh) (production)
2. Create at least one product in your Polar dashboard
3. Get your organization access token from Settings → API → Access Tokens

### Step 1: Configure Environment Variables

Update your `.env` file:

```bash
# Enable billing
ENABLE_BILLING=true
NEXT_PUBLIC_ENABLE_BILLING=true

# Set provider to Polar
BILLING_PROVIDER=polar

# Polar credentials (from your Polar dashboard)
POLAR_ACCESS_TOKEN="polar_oat_your_token_here"
POLAR_SERVER="sandbox"  # or "production"
POLAR_WEBHOOK_SECRET="your_webhook_secret"
POLAR_ORG_ID="your_org_id"

# Product IDs (from your Polar products)
NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID="prod_your_pro_id"
NEXT_PUBLIC_POLAR_STARTER_PRODUCT_ID="prod_your_starter_id"
```

### Step 2: Test the Integration

Run the test script to verify your configuration:

```bash
pnpm test:polar
```

This will:
- ✅ Validate your environment variables
- ✅ Test API connection
- ✅ List your Polar products
- ✅ Create a test checkout session

### Step 3: Set Up Webhooks (Production Only)

For production deployments:

1. In Polar dashboard → Settings → Webhooks
2. Add endpoint: `https://yourdomain.com/api/auth/webhook/polar`
3. Copy the webhook secret to `POLAR_WEBHOOK_SECRET` in `.env`

---

## Architecture Overview

### Provider Abstraction

The billing system uses a provider-agnostic interface:

```typescript
import { billingService } from "@/lib/billing";

// Check if enabled
if (billingService.isEnabled()) {
  // Create checkout
  await billingService.checkout({ products: ["prod_123"] });

  // Open portal
  await billingService.portal();

  // List subscriptions
  const subscriptions = await billingService.listSubscriptions();
}
```

### File Structure

```
lib/billing/
├── index.ts              # Main export & factory
├── config.ts             # Configuration & validation
├── types.ts              # Provider interface & types
└── providers/
    ├── polar.ts          # Polar implementation
    ├── null.ts           # Disabled state
    └── stripe.ts         # Future: Stripe implementation
```

### Components

- `<BillingCTA>` - Checkout button
- `<PortalButton>` - Customer portal access
- `<PlanStatus>` - Current plan indicator
- `/dashboard/billing` - Billing management page

---

## User Flow

### Post-Login Upgrade (Default)

1. User signs up freely (no payment required)
2. User explores dashboard and features
3. User clicks "Upgrade" button → redirected to `/dashboard/billing`
4. User selects plan → redirected to Polar checkout
5. After payment → redirected back with `?success=true`
6. Webhook updates subscription status

### Benefits

- ✅ Lower friction signup
- ✅ Try before buy
- ✅ Standard SaaS pattern
- ✅ Higher conversion rates

---

## Switching Providers

To switch from Polar to Stripe (when available):

1. Update `.env`:
   ```bash
   BILLING_PROVIDER=stripe
   ```

2. Add Stripe credentials:
   ```bash
   STRIPE_SECRET_KEY="sk_test_..."
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

3. The application automatically uses the Stripe provider

---

## Troubleshooting

### "Billing is not configured" error

**Cause:** `ENABLE_BILLING=false` or missing credentials

**Fix:** Set `ENABLE_BILLING=true` and configure provider credentials

### Test script fails with 401 error

**Cause:** Using production token with sandbox environment (or vice versa)

**Fix:** Ensure `POLAR_SERVER` matches where you created the access token

### Checkout button is disabled

**Causes:**
- Billing not enabled
- Missing product ID in plan configuration
- Invalid product ID

**Fix:** Check browser console for specific error messages

### Webhooks not working

**Causes:**
- Missing `POLAR_WEBHOOK_SECRET`
- Incorrect webhook URL
- Local development (webhooks need public URL)

**Fix:**
- For local testing, use ngrok: `ngrok http 3000`
- Set webhook URL to: `https://your-ngrok-url.ngrok.io/api/auth/webhook/polar`

---

## FAQ

**Q: Can I use the app without billing?**
A: Yes! Billing is optional and disabled by default.

**Q: How do I test locally?**
A: Use Polar's sandbox environment. Set `POLAR_SERVER="sandbox"` and create a sandbox account.

**Q: Do I need webhooks for local development?**
A: No. Webhooks are only needed in production for real-time subscription updates.

**Q: Can I support multiple plans?**
A: Yes! Add products in Polar, update `config/plans.ts` with product IDs.

**Q: How do I handle free tier users?**
A: Users without subscriptions automatically have the free tier. Check `subscriptions.length === 0`.

---

## Next Steps

- [ ] Create products in Polar dashboard
- [ ] Configure environment variables
- [ ] Run `pnpm test:polar` to verify setup
- [ ] Test checkout flow in sandbox
- [ ] Set up webhooks for production
- [ ] Deploy and test end-to-end

For more help, see:
- [Polar Documentation](https://polar.sh/docs)
- [Better Auth Polar Plugin](https://polar.sh/docs/better-auth)
