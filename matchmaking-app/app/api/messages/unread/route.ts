import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Get unread message count for current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Count unread messages where user is the receiver
    const unreadCount = await prisma.message.count({
      where: {
        receiverId: session.user.id,
        isRead: false,
      },
    });

    return Response.json({ unreadCount }, { status: 200 });
  } catch (error) {
    console.error("Get unread count error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

// Mark messages as read
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { senderId } = await req.json();

    if (!senderId) {
      return Response.json(
        { error: "Sender ID required" },
        { status: 400 }
      );
    }

    // Mark all messages from senderId to current user as read
    await prisma.message.updateMany({
      where: {
        senderId: senderId,
        receiverId: session.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Mark as read error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
