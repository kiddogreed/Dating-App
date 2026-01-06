import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Quick endpoint to promote current user to admin
 * Use this to give yourself admin access
 */
async function promoteCurrentUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Not logged in. Please login first." },
      { status: 401 }
    );
  }

  // Update current user to ADMIN role
  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { role: "ADMIN" },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  });

  return NextResponse.json({
    success: true,
    message: "🎉 You are now an ADMIN! Please logout and login again to see the Admin Panel button.",
    user,
  });
}

export async function GET() {
  try {
    return await promoteCurrentUser();
  } catch (error: any) {
    console.error("Promote self error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to promote user" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    return await promoteCurrentUser();
  } catch (error: any) {
    console.error("Promote self error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to promote user" },
      { status: 500 }
    );
  }
}
