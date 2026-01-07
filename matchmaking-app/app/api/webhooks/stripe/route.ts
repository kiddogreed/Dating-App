import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import crypto from "crypto";

// This is needed to read the raw body for webhook signature verification
export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Get subscription ID from session
        if (session.subscription && session.customer) {
          const subscriptionId = session.subscription as string;
          const customerId = session.customer as string;
          const userId = session.metadata?.userId;

          if (!userId) {
            console.error("No userId in session metadata");
            break;
          }

          // Get full subscription details
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          
          // Type assertion to access current_period_end
          const currentPeriodEnd = (subscription as any).current_period_end;

          // Update database
          await prisma.subscription.upsert({
            where: { userId },
            create: {
              id: crypto.randomUUID(),
              userId,
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              stripePriceId: subscription.items.data[0].price.id,
              stripeCurrentPeriodEnd: new Date(currentPeriodEnd * 1000),
              status: "ACTIVE",
              plan: "PREMIUM",
              updatedAt: new Date(),
            },
            update: {
              stripeSubscriptionId: subscriptionId,
              stripePriceId: subscription.items.data[0].price.id,
              stripeCurrentPeriodEnd: new Date(currentPeriodEnd * 1000),
              status: "ACTIVE",
              plan: "PREMIUM",
            },
          });

          console.log(`✅ Subscription activated for user ${userId}`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const currentPeriodEnd = (subscription as any).current_period_end;
        
        const dbSubscription = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (dbSubscription) {
          await prisma.subscription.update({
            where: { id: dbSubscription.id },
            data: {
              stripePriceId: subscription.items.data[0].price.id,
              stripeCurrentPeriodEnd: new Date(currentPeriodEnd * 1000),
              status: subscription.status === "active" ? "ACTIVE" : "INACTIVE",
            },
          });

          console.log(`✅ Subscription updated for user ${dbSubscription.userId}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        
        const dbSubscription = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (dbSubscription) {
          await prisma.subscription.update({
            where: { id: dbSubscription.id },
            data: {
              status: "CANCELED",
              plan: "FREE",
            },
          });

          console.log(`✅ Subscription canceled for user ${dbSubscription.userId}`);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceSubscription = (invoice as any).subscription;
        
        if (invoiceSubscription) {
          const subscriptionId = invoiceSubscription as string;
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const currentPeriodEnd = (subscription as any).current_period_end;

          const dbSubscription = await prisma.subscription.findUnique({
            where: { stripeSubscriptionId: subscriptionId },
          });

          if (dbSubscription) {
            await prisma.subscription.update({
              where: { id: dbSubscription.id },
              data: {
                stripeCurrentPeriodEnd: new Date(currentPeriodEnd * 1000),
                status: "ACTIVE",
              },
            });

            console.log(`✅ Payment succeeded for user ${dbSubscription.userId}`);
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceSubscription = (invoice as any).subscription;
        
        if (invoiceSubscription) {
          const subscriptionId = invoiceSubscription as string;

          const dbSubscription = await prisma.subscription.findUnique({
            where: { stripeSubscriptionId: subscriptionId },
          });

          if (dbSubscription) {
            await prisma.subscription.update({
              where: { id: dbSubscription.id },
              data: {
                status: "INACTIVE",
              },
            });

            console.log(`⚠️ Payment failed for user ${dbSubscription.userId}`);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
