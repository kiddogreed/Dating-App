import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { resend } from "@/lib/resend";
import { VerificationEmailTemplate } from "@/components/emails/templates";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, password } = await req.json();

    // Check required fields
    if (!firstName || !lastName || !email || !password) {
      return Response.json({ error: "All fields are required" }, { status: 400 });
    }

    // Validate email is a string and trim whitespace
    const trimmedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    
    if (!trimmedEmail) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return Response.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Validate password strength
    if (typeof password !== 'string' || password.length < 8) {
      return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    // Check for uppercase and lowercase
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
      return Response.json({ 
        error: "Password must contain both uppercase and lowercase letters" 
      }, { status: 400 });
    }

    // Check for number
    if (!/[0-9]/.test(password)) {
      return Response.json({ error: "Password must contain at least one number" }, { status: 400 });
    }

    // Validate first and last name
    if (typeof firstName !== 'string' || firstName.trim().length === 0) {
      return Response.json({ error: "First name is required" }, { status: 400 });
    }
    
    if (typeof lastName !== 'string' || lastName.trim().length === 0) {
      return Response.json({ error: "Last name is required" }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (exists) {
      return Response.json({ error: "User already exists" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    
    // Generate email verification token
    const verificationToken = randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: { 
        id: randomBytes(16).toString('hex'),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: trimmedEmail, 
        password: hashed,
        emailVerificationToken: verificationToken,
        updatedAt: new Date(),
      },
    });

    // Send verification email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificationLink = `${appUrl}/auth/verify-email?token=${verificationToken}`;

    try {
      if (resend) {
        await resend.emails.send({
          from: 'MatchMaking App <onboarding@resend.dev>', // Update this with your verified domain
          to: trimmedEmail,
          subject: 'Verify your email address',
          react: VerificationEmailTemplate({
            firstName: firstName.trim(),
            verificationLink,
          }),
        });
      } else {
        console.warn('Email service not configured. Verification email not sent.');
      }
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail registration if email fails
    }

    return Response.json({ 
      success: true, 
      message: 'Registration successful! Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

