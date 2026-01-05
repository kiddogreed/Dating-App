import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalUsers,
      usersWithProfiles,
      usersWithPhotos,
      totalMatches,
      acceptedMatches,
      totalMessages,
      unreadMessages,
      premiumUsers,
      freeUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.profile.count(),
      prisma.user.count({ where: { photos: { some: {} } } }),
      prisma.match.count(),
      prisma.match.count({ where: { status: "ACCEPTED" } }),
      prisma.message.count(),
      prisma.message.count({ where: { isRead: false } }),
      prisma.subscription.count({ where: { plan: "PREMIUM" } }),
      prisma.subscription.count({ where: { plan: "FREE" } }),
    ]);

    // Get sample users for testing
    const sampleUsers = await prisma.user.findMany({
      where: {
        email: {
          endsWith: "@test.com",
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        profile: {
          select: {
            age: true,
            gender: true,
            location: true,
          },
        },
        subscription: {
          select: {
            plan: true,
            status: true,
          },
        },
      },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          withProfiles: usersWithProfiles,
          withPhotos: usersWithPhotos,
        },
        matches: {
          total: totalMatches,
          accepted: acceptedMatches,
          pending: totalMatches - acceptedMatches,
        },
        messages: {
          total: totalMessages,
          unread: unreadMessages,
          read: totalMessages - unreadMessages,
        },
        subscriptions: {
          premium: premiumUsers,
          free: freeUsers,
        },
      },
      testCredentials: {
        password: "password123",
        note: "Use any email from sampleUsers below",
      },
      sampleUsers: sampleUsers.map((u) => ({
        email: u.email,
        name: u.name,
        age: u.profile?.age,
        gender: u.profile?.gender,
        location: u.profile?.location,
        plan: u.subscription?.plan,
      })),
    });
  } catch (error: any) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get stats" },
      { status: 500 }
    );
  }
}
