import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // Check required fields
    if (!email || !password) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
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
    if (typeof password !== 'string' || password.length < 6) {
      return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (exists) {
      return Response.json({ error: "User already exists" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email: trimmedEmail, password: hashed },
    });

    return Response.json({ success: true, user });
  } catch (error) {
    console.error("Registration error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
