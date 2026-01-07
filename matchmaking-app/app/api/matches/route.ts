import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// Like a profile (create or update match)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetUserId, action } = await req.json();

    if (!targetUserId || !action) {
      return Response.json(
        { error: "Target user ID and action required" },
        { status: 400 }
      );
    }

    if (action !== "LIKE" && action !== "PASS") {
      return Response.json(
        { error: "Action must be LIKE or PASS" },
        { status: 400 }
      );
    }

    // Can't like yourself
    if (targetUserId === session.user.id) {
      return Response.json(
        { error: "Cannot like yourself" },
        { status: 400 }
      );
    }

    // Check if already interacted
    const existingMatch = await prisma.match.findFirst({
      where: {
        initiatorId: session.user.id,
        receiverId: targetUserId,
      },
    });

    if (existingMatch) {
      return Response.json(
        { error: "Already interacted with this user" },
        { status: 400 }
      );
    }

    if (action === "PASS") {
      // Just record the pass, don't create a match
      await prisma.match.create({
        data: {
          id: crypto.randomUUID(),
          initiatorId: session.user.id,
          receiverId: targetUserId,
          status: "REJECTED",
        },
      });

      return Response.json({ success: true, matched: false }, { status: 201 });
    }

    // Check if the other user already liked you
    const reverseMatch = await prisma.match.findFirst({
      where: {
        initiatorId: targetUserId,
        receiverId: session.user.id,
        status: "PENDING",
      },
    });

    let isMatch = false;

    if (reverseMatch) {
      // It's a match! Just update the existing record
      await prisma.match.update({
        where: { id: reverseMatch.id },
        data: { status: "ACCEPTED" },
      });

      isMatch = true;
    } else {
      // Create a pending like
      await prisma.match.create({
        data: {
          id: crypto.randomUUID(),
          initiatorId: session.user.id,
          receiverId: targetUserId,
          status: "PENDING",
        },
      });
    }

    return Response.json(
      { success: true, matched: isMatch },
      { status: 201 }
    );
  } catch (error) {
    console.error("Match action error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

// Get user's matches
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all accepted matches
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { initiatorId: session.user.id, status: "ACCEPTED" },
          { receiverId: session.user.id, status: "ACCEPTED" },
        ],
      },
      include: {
        User_Match_initiatorIdToUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
            Profile: true,
            Photo: {
              take: 1,
              orderBy: { createdAt: "desc" },
            },
          },
        },
        User_Match_receiverIdToUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
            Profile: true,
            Photo: {
              take: 1,
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format matches to show the other user
    const formattedMatches = matches.map((match: any) => {
      const otherUser =
        match.initiatorId === session.user.id
          ? match.User_Match_receiverIdToUser
          : match.User_Match_initiatorIdToUser;

      return {
        matchId: match.id,
        matchedAt: match.createdAt,
        user: otherUser,
      };
    });

    return Response.json({ matches: formattedMatches }, { status: 200 });
  } catch (error) {
    console.error("Get matches error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
