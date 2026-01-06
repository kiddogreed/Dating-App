import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const filter = searchParams.get("filter") || "all"; // all, active, banned, premium

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    if (filter === "active") {
      where.isActive = true;
      where.isBanned = false;
    } else if (filter === "banned") {
      where.isBanned = true;
    } else if (filter === "premium") {
      where.subscription = {
        plan: "PREMIUM",
        status: "ACTIVE",
      };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          isActive: true,
          isBanned: true,
          bannedReason: true,
          lastLoginAt: true,
          createdAt: true,
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
          _count: {
            select: {
              photos: true,
              matchesInitiated: true,
              messagesSent: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unauthorized" },
      { status: error.message?.includes("Unauthorized") ? 403 : 500 }
    );
  }
}
