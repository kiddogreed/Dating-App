import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bio, age, gender, location } = await req.json();

    // Validate required fields
    if (!age || !gender) {
      return Response.json(
        { error: "Age and gender are required" },
        { status: 400 }
      );
    }

    // Validate age range
    if (age < 18 || age > 100) {
      return Response.json(
        { error: "Age must be between 18 and 100" },
        { status: 400 }
      );
    }

    // Check if profile already exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (existingProfile) {
      return Response.json(
        { error: "Profile already exists. Use update endpoint." },
        { status: 400 }
      );
    }

    // Create profile
    const profile = await prisma.profile.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        bio: bio?.trim() || null,
        age: Number.parseInt(age),
        gender,
        location: location?.trim() || null,
        updatedAt: new Date(),
      },
    });

    return Response.json({ success: true, profile }, { status: 201 });
  } catch (error) {
    console.error("Profile creation error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: {
        User: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!profile) {
      return Response.json({ profile: null }, { status: 200 });
    }

    return Response.json({ profile }, { status: 200 });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bio, age, gender, location } = await req.json();

    // Validate age if provided
    if (age && (age < 18 || age > 100)) {
      return Response.json(
        { error: "Age must be between 18 and 100" },
        { status: 400 }
      );
    }

    // Update profile
    const profile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        ...(bio !== undefined && { bio: bio?.trim() || null }),
        ...(age && { age: Number.parseInt(age) }),
        ...(gender && { gender }),
        ...(location !== undefined && { location: location?.trim() || null }),
      },
    });

    return Response.json({ success: true, profile }, { status: 200 });
  } catch (error) {
    console.error("Profile update error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
