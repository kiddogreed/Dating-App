import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function GET() {
  try {
    // Test 1: Check if Stripe is initialized
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe secret key not configured" },
        { status: 500 }
      );
    }

    // Test 2: Try to retrieve account details
    const account = await stripe.accounts.retrieve();

    // Test 3: List products (if any exist)
    const products = await stripe.products.list({ limit: 3 });

    return NextResponse.json({
      success: true,
      message: "Stripe is configured correctly!",
      account: {
        id: account.id,
        country: account.country,
        email: account.email,
        type: account.type,
      },
      productsCount: products.data.length,
      products: products.data.map((p) => ({
        id: p.id,
        name: p.name,
        active: p.active,
      })),
      environment: process.env.STRIPE_SECRET_KEY.startsWith("sk_test_")
        ? "TEST MODE"
        : "LIVE MODE",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        type: error.type,
        hint: "Check if your Stripe API key is valid and has the correct permissions",
      },
      { status: 500 }
    );
  }
}
