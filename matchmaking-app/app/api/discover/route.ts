import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Get profiles to browse (exclude already interacted users)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get filter parameters from URL
    const { searchParams } = new URL(req.url);
    const minAge = searchParams.get("minAge");
    const maxAge = searchParams.get("maxAge");
    const gender = searchParams.get("gender");
    const location = searchParams.get("location");

    // Get IDs of users already interacted with
    const interactedMatches = await prisma.match.findMany({
      where: {
        initiatorId: session.user.id,
      },
      select: {
        receiverId: true,
      },
    });

    const interactedUserIds = interactedMatches.map((m: any) => m.receiverId);

    // Build dynamic filter object
    const filters: any = {
      userId: {
        notIn: [...interactedUserIds, session.user.id],
      },
      age: { not: null },
      gender: { not: null },
    };

    // Add age range filter
    if (minAge || maxAge) {
      filters.age = {
        ...filters.age,
        ...(minAge && { gte: Number.parseInt(minAge) }),
        ...(maxAge && { lte: Number.parseInt(maxAge) }),
      };
    }

    // Add gender filter
    if (gender && gender !== "all") {
      filters.gender = gender;
    }

    // Add location filter (partial match)
    if (location) {
      filters.location = {
        contains: location,
        mode: "insensitive",
      };
    }

    // Get profiles to show (with filters applied)
    const profiles = await prisma.profile.findMany({
      where: filters,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            photos: {
              take: 3,
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
      take: 20,
      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json({ profiles }, { status: 200 });
  } catch (error) {
    console.error("Discover profiles error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
