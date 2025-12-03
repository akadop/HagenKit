# Polar.sh Automated OAuth Integration Plan

A guide for implementing automated Polar billing setup - similar to how Prisma provisions databases with Vercel.

---

## Vision

User signs up → Clicks "Connect Polar" → Automatically:
- Creates/connects Polar organization
- Creates products matching plan definitions
- Sets up webhooks
- Stores credentials securely

**Result:** Complete billing setup in under 2 minutes with zero manual configuration.

---

## Polar API Endpoints

### Authentication & OAuth

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `POST /v1/oauth2/token` | Exchange authorization code for tokens |
| `GET /v1/oauth2/userinfo` | Get authenticated user/org info |
| `POST /v1/oauth2/introspect` | Check token validity |
| `POST /v1/oauth2/revoke` | Revoke tokens on disconnect |

**OAuth Scopes Needed:**
- `organizations:read` - Verify org access
- `products:read` / `products:write` - Create/list products
- `webhooks:read` / `webhooks:write` - Setup webhook endpoints

### Organizations

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `POST /v1/organizations/` | Create new organization |
| `GET /v1/organizations/` | List organizations |
| `GET /v1/organizations/{id}` | Get organization details |
| `PATCH /v1/organizations/{id}` | Update organization |

### Products

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `POST /v1/products/` | Create product |
| `GET /v1/products/` | List products |
| `GET /v1/products/{id}` | Get product details |
| `PATCH /v1/products/{id}` | Update product |
| `POST /v1/products/{id}/benefits` | Attach benefits to product |

**Product Creation Payload:**
```json
{
  "name": "Pro Plan",
  "description": "For growing teams",
  "recurring_interval": "month",
  "prices": [{
    "amount_type": "fixed",
    "price_amount": 2900,
    "price_currency": "usd"
  }],
  "organization_id": "org_xxx"
}
```

### Webhooks

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `POST /v1/webhooks/endpoints` | Create webhook endpoint |
| `GET /v1/webhooks/endpoints` | List webhooks |
| `PATCH /v1/webhooks/endpoints/{id}` | Update webhook |
| `DELETE /v1/webhooks/endpoints/{id}` | Delete webhook |

**Webhook Creation Payload:**
```json
{
  "url": "https://yourapp.com/api/webhooks/polar",
  "events": [
    "order.created",
    "subscription.active",
    "subscription.canceled",
    "customer.state_changed"
  ],
  "organization_id": "org_xxx"
}
```

### Customers

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `POST /v1/customers/` | Create customer |
| `GET /v1/customers/` | List customers |
| `GET /v1/customers/external/{external_id}/state` | Get customer state by your ID |

### Checkout & Subscriptions

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `POST /v1/checkouts/` | Create checkout session |
| `POST /v1/checkout-links/` | Create shareable checkout link |
| `GET /v1/subscriptions/` | List subscriptions |
| `PATCH /v1/subscriptions/{id}` | Update subscription |

---

## Base URLs

| Environment | URL |
|-------------|-----|
| **Sandbox** | `https://sandbox-api.polar.sh/v1` |
| **Production** | `https://api.polar.sh/v1` |

**Rate Limit:** 300 requests/minute per organization

---

## OAuth Flow

```
1. User clicks "Connect Polar"
   ↓
2. Redirect to Polar authorization:
   https://polar.sh/oauth2/authorize?
     response_type=code&
     client_id=YOUR_CLIENT_ID&
     redirect_uri=YOUR_CALLBACK_URL&
     scope=organizations:read products:write webhooks:write&
     state=ENCRYPTED_STATE
   ↓
3. User authorizes on Polar (selects organization)
   ↓
4. Polar redirects to your callback with code:
   GET /api/polar/callback?code=XXX&state=YYY
   ↓
5. Exchange code for tokens:
   POST /v1/oauth2/token
   {
     "grant_type": "authorization_code",
     "code": "XXX",
     "redirect_uri": "YOUR_CALLBACK_URL",
     "client_id": "YOUR_CLIENT_ID",
     "client_secret": "YOUR_CLIENT_SECRET"
   }
   ↓
6. Store tokens, trigger auto-provisioning
   ↓
7. Redirect to success page
```

---

## Auto-Provisioning Flow

After OAuth completes:

```
1. Get organization info (GET /v1/oauth2/userinfo)
   ↓
2. Check for existing products (GET /v1/products/)
   ↓
3. Create products from your plan definitions:
   POST /v1/products/ (for each plan)
   ↓
4. Create webhook endpoint:
   POST /v1/webhooks/endpoints
   ↓
5. Store product IDs and webhook secret in database
   ↓
6. Done - billing fully configured!
```

---

## Database Schema (Reference)

```sql
-- Store OAuth tokens per workspace/user
CREATE TABLE polar_integration (
  id TEXT PRIMARY KEY,
  workspace_id TEXT UNIQUE NOT NULL,

  -- Encrypted OAuth tokens
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,

  -- Polar organization info
  polar_org_id TEXT NOT NULL,
  polar_org_slug TEXT,
  polar_org_name TEXT,

  -- Provisioning state
  provisioned_at TIMESTAMP,
  webhook_endpoint_id TEXT,
  webhook_secret TEXT,

  environment TEXT DEFAULT 'sandbox',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Map your plans to Polar product IDs
CREATE TABLE polar_product_mapping (
  id TEXT PRIMARY KEY,
  integration_id TEXT NOT NULL REFERENCES polar_integration(id),
  plan_id TEXT NOT NULL,        -- Your plan ID (e.g., "pro-monthly")
  polar_product_id TEXT NOT NULL, -- Polar's UUID
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(integration_id, plan_id)
);
```

---

## Environment Variables

```env
# Polar OAuth Client (register at polar.sh/settings/oauth)
POLAR_OAUTH_CLIENT_ID=polar_ci_xxx
POLAR_OAUTH_CLIENT_SECRET=polar_cs_xxx

# OAuth callback URL
POLAR_OAUTH_REDIRECT_URI=https://yourapp.com/api/polar/callback

# Token encryption (openssl rand -hex 32)
POLAR_TOKEN_ENCRYPTION_KEY=your-32-byte-hex-key

# Environment
POLAR_SERVER=sandbox  # or "production"
```

---

## Future: Partnership API

When Polar provides partnership API access (like Prisma/Vercel), the flow becomes even simpler:

```
User clicks "Setup Billing"
  → Auto-create Polar organization (partnership API)
  → Auto-create products
  → Auto-configure webhooks
  → Inject secrets into user's Vercel deployment
  → Done - complete zero-touch setup
```

**To discuss with Polar:**
- Programmatic organization creation
- Pre-authorized token generation for new orgs
- Direct Vercel env var injection

---

## Webhook Events

Key events to subscribe to:

| Event | When |
|-------|------|
| `order.created` | New purchase completed |
| `subscription.active` | Subscription activated |
| `subscription.canceled` | Subscription canceled |
| `subscription.revoked` | Subscription immediately revoked |
| `customer.state_changed` | Customer benefits changed |
| `checkout.created` | Checkout session started |

---

## SDK

Install: `npm install @polar-sh/sdk`

```typescript
import { Polar } from "@polar-sh/sdk";

const polar = new Polar({
  accessToken: "polar_at_xxx",
  server: "sandbox" // or "production"
});

// Create product
const product = await polar.products.create({
  name: "Pro Plan",
  recurringInterval: "month",
  prices: [{
    amountType: "fixed",
    priceAmount: 2900,
    priceCurrency: "usd"
  }],
  organizationId: "org_xxx"
});

// Create webhook
const webhook = await polar.webhooks.endpoints.create({
  url: "https://yourapp.com/api/webhooks/polar",
  events: ["order.created", "subscription.active"],
  organizationId: "org_xxx"
});
```

---

## Resources

- [Polar OAuth2 Docs](https://polar.sh/docs/integrate/oauth2/connect)
- [Polar API Reference](https://docs.polar.sh/api)
- [Polar SDK (npm)](https://www.npmjs.com/package/@polar-sh/sdk)
- [Polar Webhooks](https://polar.sh/docs/integrate/webhooks/endpoints)
- [Better Auth Plugin](https://www.better-auth.com/docs/plugins/polar)
