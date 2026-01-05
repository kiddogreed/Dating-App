import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default async function ProfileViewPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Await params in Next.js 15+
  const { userId } = await params;

  // Fetch the profile for the given userId
  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          photos: {
            orderBy: { createdAt: "desc" },
            take: 6,
          },
        },
      },
    },
  });

  if (!profile) {
    notFound();
  }

  // Check if this is the current user's profile
  const isOwnProfile = session.user.id === userId;

  // Get user initials for avatar
  const initials = profile.user.name
    ? profile.user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/dashboard" className="text-xl font-semibold hover:text-purple-600">
              Matchmaking App
            </Link>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarFallback className="text-2xl bg-purple-600 text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-3xl text-purple-900">
                      {profile.user.name || "Anonymous"}
                    </CardTitle>
                    <CardDescription className="text-lg mt-1">
                      {profile.age} years old • {profile.gender}
                    </CardDescription>
                  </div>
                  {isOwnProfile && (
                    <Button asChild>
                      <Link href="/profile/edit">Edit Profile</Link>
                    </Button>
                  )}
                </div>
                {profile.location && (
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="outline" className="bg-white">
                      📍 {profile.location}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* About Section */}
        {profile.bio && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>About Me</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {profile.bio}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Profile Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-600">Age</p>
                <p className="text-lg text-gray-900">{profile.age} years old</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-600">Gender</p>
                <p className="text-lg text-gray-900">
                  {profile.gender === "MALE" && "Male"}
                  {profile.gender === "FEMALE" && "Female"}
                  {profile.gender === "OTHER" && "Other"}
                </p>
              </div>
              {profile.location && (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-600">Location</p>
                  <p className="text-lg text-gray-900">{profile.location}</p>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-600">Member Since</p>
                <p className="text-lg text-gray-900">
                  {new Date(profile.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Photos Section */}
        {profile.user.photos && profile.user.photos.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {profile.user.photos.map((photo: any) => (
                  <img
                    key={photo.id}
                    src={photo.url}
                    alt="User upload"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State for Future Features */}
        {!isOwnProfile && (
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="py-8">
              <div className="text-center">
                <p className="text-blue-900 font-semibold mb-2">
                  🚀 Coming Soon
                </p>
                <p className="text-blue-700 text-sm">
                  Send messages, like profiles, and connect with {profile.user.name || "this user"}!
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
