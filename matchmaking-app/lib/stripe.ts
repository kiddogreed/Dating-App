import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
  typescript: true,
});

// Stripe Price IDs - Create these in your Stripe Dashboard or use the ones below
// Or programmatically create them on first run
export const STRIPE_PLANS = {
  FREE: {
    name: "Free Plan",
    price: 0,
    priceId: null, // No Stripe price ID for free tier
    features: [
      "10 likes per day",
      "Basic profile",
      "Limited messaging",
      "Standard matching",
    ],
  },
  PREMIUM: {
    name: "Premium Plan",
    price: 999, // $9.99 in cents
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID, // Set this in .env
    features: [
      "Unlimited likes",
      "Premium profile badge",
      "Unlimited messaging",
      "Advanced search filters",
      "See who liked you",
      "Priority support",
    ],
  },
};

// Helper function to create or get a Stripe customer
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string
): Promise<string> {
  const { prisma } = await import("./prisma");

  // Check if user already has a stripe customer
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (subscription?.stripeCustomerId) {
    return subscription.stripeCustomerId;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    metadata: {
      userId,
    },
  });

  // Save customer ID to database
  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId: customer.id,
      status: "INACTIVE",
      plan: "FREE",
    },
    update: {
      stripeCustomerId: customer.id,
    },
  });

  return customer.id;
}
