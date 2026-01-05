"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useUnreadCount } from "@/hooks/useUnreadCount";

interface Match {
  matchId: string;
  matchedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    profile: {
      age: number;
      gender: string;
      location: string | null;
      bio: string | null;
    } | null;
    photos: Array<{ id: string; url: string }>;
  };
}

export default function MatchesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const { unreadCount } = useUnreadCount();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchMatches();
    }
  }, [status, router]);

  const fetchMatches = async () => {
    try {
      const res = await fetch("/api/matches");
      if (res.ok) {
        const data = await res.json();
        setMatches(data.matches || []);
      }
    } catch (error) {
      console.error("Failed to fetch matches:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading matches...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/dashboard" className="text-xl font-semibold hover:text-purple-600">
              Matchmaking App
            </Link>
            <div className="flex gap-4">
              <Button asChild variant="outline" size="sm" className="relative">
                <Link href="/messages">
                  Messages
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/discover">Discover</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Matches</h1>
          <p className="text-gray-600 mt-2">
            People you've matched with ({matches.length})
          </p>
        </div>

        {matches.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Matches Yet</CardTitle>
              <CardDescription>
                Start browsing profiles to find your matches!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/discover">Start Discovering</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => {
              const initials = match.user.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || "?";

              const photoUrl = match.user.photos[0]?.url || null;

              return (
                <Card key={match.matchId} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={match.user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-5xl text-purple-300">{initials}</span>
                      </div>
                    )}
                  </div>

                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={photoUrl || undefined} />
                        <AvatarFallback className="bg-purple-600 text-white">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-xl">
                          {match.user.name}
                          {match.user.profile?.age && `, ${match.user.profile.age}`}
                        </CardTitle>
                        {match.user.profile?.location && (
                          <CardDescription>
                            📍 {match.user.profile.location}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {match.user.profile?.gender && (
                      <Badge variant="outline" className="mb-3">
                        {match.user.profile.gender}
                      </Badge>
                    )}
                    {match.user.profile?.bio && (
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {match.user.profile.bio}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-3">
                      Matched {new Date(match.matchedAt).toLocaleDateString()}
                    </p>
                  </CardContent>

                  <CardContent className="pt-0 space-y-2">
                    <Button asChild className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      <Link href={`/messages/${match.user.id}`}>💬 Send Message</Link>
                    </Button>
                    <Button asChild className="w-full" variant="outline">
                      <Link href={`/profile/${match.user.id}`}>View Profile</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
