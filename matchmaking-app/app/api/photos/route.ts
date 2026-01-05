import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64File = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(base64File, {
      folder: "matchmaking-app",
      resource_type: "auto",
    });

    // Save photo URL to database
    const photo = await prisma.photo.create({
      data: {
        userId: session.user.id,
        url: uploadResponse.secure_url,
      },
    });

    return Response.json({ success: true, photo }, { status: 201 });
  } catch (error) {
    console.error("Photo upload error:", error);
    return Response.json({ error: "Failed to upload photo" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const photos = await prisma.photo.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ photos }, { status: 200 });
  } catch (error) {
    console.error("Fetch photos error:", error);
    return Response.json({ error: "Failed to fetch photos" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const photoId = searchParams.get("id");

    if (!photoId) {
      return Response.json({ error: "Photo ID required" }, { status: 400 });
    }

    // Verify photo belongs to user
    const photo = await prisma.photo.findFirst({
      where: {
        id: photoId,
        userId: session.user.id,
      },
    });

    if (!photo) {
      return Response.json({ error: "Photo not found" }, { status: 404 });
    }

    // Delete from Cloudinary
    const publicId = photo.url.split("/").pop()?.split(".")[0];
    if (publicId) {
      await cloudinary.uploader.destroy(`matchmaking-app/${publicId}`);
    }

    // Delete from database
    await prisma.photo.delete({
      where: { id: photoId },
    });

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete photo error:", error);
    return Response.json({ error: "Failed to delete photo" }, { status: 500 });
  }
}
