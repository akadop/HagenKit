import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin, magicLink } from "better-auth/plugins";
import { polar, checkout, portal, webhooks } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
import { sendPasswordResetEmail, sendMagicLinkEmail } from "@/app/actions/email";
import { billingConfig, validateBillingConfig } from "@/lib/billing/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

// Validate billing configuration
const billingValidation = validateBillingConfig();
const isBillingEnabled = billingConfig.enabled && billingValidation.valid;

// Build plugins array conditionally
const plugins = [
  nextCookies(),
  admin({
    adminRoles: ["admin"],
    impersonationSessionDuration: 60 * 60, // 1 hour
  }),
  magicLink({
    sendMagicLink: async ({ email, token, url }, request) => {
      await sendMagicLinkEmail(
        {
          firstName: "there",
          magicLinkUrl: url,
          expiresInMinutes: 10,
        },
        email
      );
    },
  }),
];

// Conditionally add Polar billing plugin
if (isBillingEnabled && billingConfig.provider === "polar" && billingConfig.polar.accessToken) {
  plugins.push(
    polar({
      client: new Polar({
        accessToken: billingConfig.polar.accessToken,
        server: billingConfig.polar.server,
      }),
      createCustomerOnSignUp: true,
      use: [
        checkout({
          successUrl: "/dashboard/billing?success=true",
          authenticatedUsersOnly: true,
        }),
        portal(),
        webhooks({
          secret: billingConfig.polar.webhookSecret || "",
        }),
      ],
    })
  );
} else if (billingConfig.enabled && !billingValidation.valid) {
  console.warn(`⚠️  Billing is enabled but configuration is invalid: ${billingValidation.message}`);
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const userCount = await prisma.user.count();
          if (userCount === 0) {
            return {
              data: {
                ...user,
                role: "admin",
              },
            };
          }
          return { data: user };
        },
      },
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        input: false, // Don't allow users to set their own role
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url, token }) => {
      // Send password reset email using our email service
      await sendPasswordResetEmail(
        {
          firstName: user.name?.split(" ")[0] || "there",
          resetUrl: url,
          expiresInMinutes: 60, // 1 hour
        },
        user.email
      );
    },
    resetPasswordTokenExpiresIn: 3600, // 1 hour in seconds
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins,
});

// Export billing status for use in other parts of the app
export { isBillingEnabled };
