import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();

    const [
      totalUsers,
      activeUsers,
      bannedUsers,
      totalMatches,
      totalMessages,
      premiumUsers,
      newUsersToday,
      newUsersWeek,
      totalPhotos,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true, isBanned: false } }),
      prisma.user.count({ where: { isBanned: true } }),
      prisma.match.count({ where: { status: "ACCEPTED" } }),
      prisma.message.count(),
      prisma.subscription.count({ where: { plan: "PREMIUM", status: "ACTIVE" } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.photo.count(),
    ]);

    // Get revenue stats (Premium subscriptions * $9.99)
    const monthlyRevenue = premiumUsers * 9.99;

    return NextResponse.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          banned: bannedUsers,
          newToday: newUsersToday,
          newThisWeek: newUsersWeek,
        },
        engagement: {
          totalMatches,
          totalMessages,
          totalPhotos,
          avgMessagesPerUser: totalUsers > 0 ? (totalMessages / totalUsers).toFixed(2) : 0,
        },
        revenue: {
          premiumSubscriptions: premiumUsers,
          monthlyRevenue: monthlyRevenue.toFixed(2),
          annualRevenue: (monthlyRevenue * 12).toFixed(2),
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unauthorized" },
      { status: error.message?.includes("Unauthorized") ? 403 : 500 }
    );
  }
}
