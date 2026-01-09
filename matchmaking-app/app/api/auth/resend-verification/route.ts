import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "node:crypto";
import { sendVerificationEmail } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        emailVerified: true,
        emailVerifiedAt: true,
      },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return Response.json(
        { error: "Email is already verified" },
        { status: 400 }
      );
    }

    // Generate new verification token
    const verificationToken = randomBytes(32).toString("hex");

    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
      },
    });

    // Send verification email
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${verificationToken}`;
    
    const emailSent = await sendVerificationEmail(
      user.email,
      user.firstName || "User",
      verificationLink
    );

    if (!emailSent) {
      // Email sending is optional, so we don't fail the request
      console.warn("Email sending is not configured. Verification token created but email not sent.");
    }

    return Response.json({
      success: true,
      message: "Verification email has been sent",
      emailSent,
    }, { status: 200 });
  } catch (error) {
    console.error("Resend verification error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
