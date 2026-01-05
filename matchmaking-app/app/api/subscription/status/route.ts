import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (!subscription) {
      // User has no subscription record, create a free one
      const newSubscription = await prisma.subscription.create({
        data: {
          userId: session.user.id,
          status: "INACTIVE",
          plan: "FREE",
        },
      });

      return NextResponse.json({
        plan: newSubscription.plan,
        status: newSubscription.status,
        isPremium: false,
        isActive: false,
      });
    }

    const isPremium = subscription.plan === "PREMIUM";
    const isActive = subscription.status === "ACTIVE";
    const isExpired = subscription.stripeCurrentPeriodEnd 
      ? new Date(subscription.stripeCurrentPeriodEnd) < new Date()
      : false;

    return NextResponse.json({
      plan: subscription.plan,
      status: subscription.status,
      isPremium,
      isActive: isActive && !isExpired,
      currentPeriodEnd: subscription.stripeCurrentPeriodEnd,
    });
  } catch (error: any) {
    console.error("Get subscription error:", error);
    return NextResponse.json(
      { error: "Failed to get subscription" },
      { status: 500 }
    );
  }
}
