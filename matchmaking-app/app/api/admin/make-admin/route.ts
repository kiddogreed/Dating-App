import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * Development endpoint to create an admin user
 * In production, this should be removed or heavily secured
 */
export async function POST(req: Request) {
  try {
    const { email, password, makeAdmin } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Update existing user to admin
      if (makeAdmin) {
        const updatedUser = await prisma.user.update({
          where: { email },
          data: { role: "ADMIN" },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        });

        return NextResponse.json({
          success: true,
          message: "User promoted to ADMIN",
          user: updatedUser,
        });
      }

      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: email.split("@")[0],
        role: makeAdmin ? "ADMIN" : "USER",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `User created ${makeAdmin ? "as ADMIN" : ""}`,
      user,
    });
  } catch (error: any) {
    console.error("Make admin error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create admin" },
      { status: 500 }
    );
  }
}
