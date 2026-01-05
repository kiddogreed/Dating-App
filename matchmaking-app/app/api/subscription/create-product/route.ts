import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST() {
  try {
    // Create Premium product
    const product = await stripe.products.create({
      name: "Matchmaking App Premium",
      description: "Unlock all premium features to find your perfect match faster",
      metadata: {
        plan: "PREMIUM",
      },
    });

    // Create price for the product ($9.99/month)
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 999, // $9.99 in cents
      currency: "usd",
      recurring: {
        interval: "month",
      },
      metadata: {
        plan: "PREMIUM",
      },
    });

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
      },
      price: {
        id: price.id,
        amount: price.unit_amount,
        currency: price.currency,
        interval: price.recurring?.interval,
      },
      message: `Add this to your .env file:\nSTRIPE_PREMIUM_PRICE_ID="${price.id}"`,
    });
  } catch (error: any) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
