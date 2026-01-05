import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessagesButtonWithBadge } from "@/components/MessagesButtonWithBadge";
import { MessagesCard } from "@/components/MessagesCard";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Check if user has a profile
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  // Get user role
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  const isAdmin = currentUser?.role === "ADMIN" || currentUser?.role === "MODERATOR";

  // Get match count
  const matchCount = await prisma.match.count({
    where: {
      OR: [
        { initiatorId: session.user.id, status: "ACCEPTED" },
        { receiverId: session.user.id, status: "ACCEPTED" },
      ],
    },
  });

  // Get subscription status
  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  const isPremium = subscription?.plan === "PREMIUM" && subscription?.status === "ACTIVE";

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-semibold">Matchmaking App</h1>
            <div className="flex items-center gap-4">
              {isAdmin && (
                <Link href="/admin">
                  <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    🛡️ Admin Panel
                  </Button>
                </Link>
              )}
              {!isPremium && (
                <Link href="/pricing">
                  <Button variant="ghost" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                    ⭐ Upgrade to Premium
                  </Button>
                </Link>
              )}
              {isPremium && (
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  ⭐ Premium Member
                </Badge>
              )}
              <MessagesButtonWithBadge />
              <span className="text-gray-700">
                {session.user?.name || session.user?.email}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Status Card */}
        {!profile ? (
          <Card className="mb-6 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="text-purple-900">Complete Your Profile</CardTitle>
              <CardDescription>
                Create your profile to start connecting with others
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                You haven't created your profile yet. Fill out some basic information to get started!
              </p>
              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <Link href="/profile/create">Create Your Profile</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-green-900">Your Profile</CardTitle>
                  <CardDescription>Profile is active and visible</CardDescription>
                </div>
                <Badge className="bg-green-600">Active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Age</p>
                  <p className="text-lg text-gray-900">{profile.age}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Gender</p>
                  <p className="text-lg text-gray-900">{profile.gender}</p>
                </div>
                {profile.location && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Location</p>
                    <p className="text-lg text-gray-900">{profile.location}</p>
                  </div>
                )}
                {profile.bio && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Bio</p>
                    <p className="text-gray-700">{profile.bio}</p>
                  </div>
                )}
              </div>
              <div className="mt-6 flex gap-3">
                <Button asChild variant="outline">
                  <Link href={`/profile/${session.user.id}`}>View Full Profile</Link>
                </Button>
                <Button asChild>
                  <Link href="/profile/edit">Edit Profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        {profile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/discover">
                <CardHeader>
                  <CardTitle className="text-purple-900 flex items-center gap-2">
                    <span>💜</span> Discover
                  </CardTitle>
                  <CardDescription>Find new people to match with</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    Start Browsing
                  </Button>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/matches">
                <CardHeader>
                  <CardTitle className="text-green-900 flex items-center gap-2">
                    <span>✨</span> Matches
                  </CardTitle>
                  <CardDescription>View your mutual matches</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-green-600">{matchCount}</p>
                    <p className="text-sm text-gray-600">Total Matches</p>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <MessagesCard />

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/profile/edit">
                <CardHeader>
                  <CardTitle className="text-blue-900 flex items-center gap-2">
                    <span>📸</span> Photos
                  </CardTitle>
                  <CardDescription>Add or manage your photos</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Manage Photos
                  </Button>
                </CardContent>
              </Link>
            </Card>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">
            Welcome, {session.user?.name || "User"}!
          </h2>
          <p className="text-gray-600 mb-6">
            You're successfully logged in to your dashboard.
          </p>
          
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">
                ✅ Phase 2: Authentication - Complete!
              </h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• User registration & login</li>
                <li>• Session management</li>
                <li>• Protected routes</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">
                ✅ Phase 3: Profiles - Complete!
              </h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Profile creation & editing</li>
                <li>• Profile viewing</li>
                <li>• Shadcn UI components</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">
                ✅ Phase 4: Photo Uploads - Complete!
              </h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Cloudinary integration</li>
                <li>• Photo upload & management</li>
                <li>• Profile photo display</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">
                ✅ Phase 5: Messaging System - Complete!
              </h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Conversation list</li>
                <li>• Real-time chat interface</li>
                <li>• Message history</li>
                <li>• Match verification for messaging</li>
              </ul>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">              <h3 className="font-semibold text-green-900 mb-2">
                ✅ Phase 5: Messaging System - Complete!
              </h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Conversation list</li>
                <li>• Real-time chat interface</li>
                <li>• Message history</li>
                <li>• Match verification for messaging</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">              <h3 className="font-semibold text-purple-900 mb-2">
                ✨ Phase 6: Matching System - Complete!
              </h3>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Discover profiles (swipe-like UI)</li>
                <li>• Like/pass actions</li>
                <li>• Mutual match detection</li>
                <li>• Matches page</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">
                ✅ Phase 7: Search & Filters - Complete!
              </h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Age range filtering</li>
                <li>• Gender filtering</li>
                <li>• Location search</li>
                <li>• Filter UI on discover page</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">
                ✅ Phase 8: Stripe Subscriptions - Complete!
              </h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Free & Premium tiers ({isPremium ? 'You are Premium!' : 'You are on Free plan'})</li>
                <li>• Stripe checkout integration</li>
                <li>• Webhook handling (payments, updates)</li>
                <li>• Subscription status tracking</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">
                ✅ Phase 9: Admin Tools - Complete!
              </h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• User role management (ADMIN, MODERATOR, USER)</li>
                <li>• Analytics dashboard (users, engagement, revenue)</li>
                <li>• User moderation (ban/unban, role changes)</li>
                <li>• Self-promotion tools for development</li>
                {isAdmin && <li className="font-semibold text-red-600">• You are an Admin! Access the Admin Panel above.</li>}
              </ul>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">
                🎉 All 9 Phases Complete - Ready for Production!
              </h3>
              <p className="text-sm text-blue-800 mb-2">
                All core phases implemented! Full-featured matchmaking platform with admin tools.
              </p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• ✅ Authentication & Authorization</li>
                <li>• ✅ User Profiles & Photos</li>
                <li>• ✅ Matching & Messaging</li>
                <li>• ✅ Search & Filters</li>
                <li>• ✅ Stripe Subscriptions</li>
                <li>• ✅ Admin Panel & Moderation</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
