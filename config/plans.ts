export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: {
    amount: number;
    currency: string;
    interval: "month" | "year" | "one_time";
    displayAmount: string;
  };
  features: PlanFeature[];
  polarProductId?: string;
  stripePriceId?: string;
  isPopular?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "pro-monthly",
    name: "Pro",
    description: "For growing teams and businesses.",
    price: {
      amount: 2900, // in cents
      currency: "USD",
      interval: "month",
      displayAmount: "$29/mo",
    },
    features: [
      { text: "Unlimited projects", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Priority support", included: true },
      { text: "Custom domain", included: true },
    ],
    polarProductId: process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID,
    isPopular: true,
  },
  {
    id: "starter-monthly",
    name: "Starter",
    description: "Perfect for hobbyists and side projects.",
    price: {
      amount: 900,
      currency: "USD",
      interval: "month",
      displayAmount: "$9/mo",
    },
    features: [
      { text: "5 projects", included: true },
      { text: "Basic analytics", included: true },
      { text: "Community support", included: true },
      { text: "Custom domain", included: false },
    ],
    polarProductId: process.env.NEXT_PUBLIC_POLAR_STARTER_PRODUCT_ID,
  },
];
