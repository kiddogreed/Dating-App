import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Get all conversations for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all matches for the user
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { initiatorId: session.user.id, status: "ACCEPTED" },
          { receiverId: session.user.id, status: "ACCEPTED" },
        ],
      },
      include: {
        initiator: {
          select: {
            id: true,
            name: true,
            image: true,
            photos: {
              take: 1,
              orderBy: { createdAt: "desc" },
            },
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            image: true,
            photos: {
              take: 1,
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    });

    // For each match, get the last message and unread count
    const conversations = await Promise.all(
      matches.map(async (match) => {
        const otherUser =
          match.initiatorId === session.user.id
            ? match.receiver
            : match.initiator;

        const lastMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: session.user.id, receiverId: otherUser.id },
              { senderId: otherUser.id, receiverId: session.user.id },
            ],
          },
          orderBy: { createdAt: "desc" },
        });

        // Count unread messages from this user
        const unreadCount = await prisma.message.count({
          where: {
            senderId: otherUser.id,
            receiverId: session.user.id,
            isRead: false,
          },
        });

        return {
          user: otherUser,
          lastMessage: lastMessage || null,
          matchedAt: match.createdAt,
          unreadCount,
        };
      })
    );

    // Sort by last message time (most recent first)
    conversations.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || a.matchedAt;
      const bTime = b.lastMessage?.createdAt || b.matchedAt;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });

    return Response.json({ conversations }, { status: 200 });
  } catch (error) {
    console.error("Get conversations error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
