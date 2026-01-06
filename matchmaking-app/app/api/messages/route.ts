import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Get conversation messages between two users
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const otherUserId = searchParams.get("userId");

    if (!otherUserId) {
      return Response.json(
        { error: "User ID required" },
        { status: 400 }
      );
    }

    // Get all messages between the two users
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: session.user.id },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            image: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return Response.json({ messages }, { status: 200 });
  } catch (error) {
    console.error("Get messages error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

// Send a new message
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiverId, content } = await req.json();

    if (!receiverId || !content) {
      return Response.json(
        { error: "Receiver ID and content required" },
        { status: 400 }
      );
    }

    if (!content.trim()) {
      return Response.json(
        { error: "Message cannot be empty" },
        { status: 400 }
      );
    }

    // Verify users have matched before allowing messages
    const match = await prisma.match.findFirst({
      where: {
        OR: [
          {
            initiatorId: session.user.id,
            receiverId: receiverId,
            status: "ACCEPTED",
          },
          {
            initiatorId: receiverId,
            receiverId: session.user.id,
            status: "ACCEPTED",
          },
        ],
      },
    });

    if (!match) {
      return Response.json(
        { error: "Can only message matched users" },
        { status: 403 }
      );
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId,
        content: content.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            image: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            image: true,
          },
        },
      },
    });

    return Response.json({ success: true, message }, { status: 201 });
  } catch (error) {
    console.error("Send message error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
