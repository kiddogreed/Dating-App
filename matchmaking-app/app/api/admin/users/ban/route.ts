import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const { userId, reason } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: true,
        bannedAt: new Date(),
        bannedReason: reason || "Violation of terms of service",
        isActive: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        isBanned: true,
        bannedReason: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "User banned successfully",
      user,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to ban user" },
      { status: error.message?.includes("Unauthorized") ? 403 : 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin();

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: false,
        bannedAt: null,
        bannedReason: null,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        isBanned: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "User unbanned successfully",
      user,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to unban user" },
      { status: error.message?.includes("Unauthorized") ? 403 : 500 }
    );
  }
}
