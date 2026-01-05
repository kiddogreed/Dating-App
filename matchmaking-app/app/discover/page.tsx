"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUnreadCount } from "@/hooks/useUnreadCount";

interface Profile {
  id: string;
  userId: string;
  bio: string | null;
  age: number;
  gender: string;
  location: string | null;
  user: {
    id: string;
    name: string;
    photos: Array<{ id: string; url: string }>;
  };
}

interface Filters {
  minAge: string;
  maxAge: string;
  gender: string;
  location: string;
}

export default function DiscoverPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showMatch, setShowMatch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    minAge: "",
    maxAge: "",
    gender: "all",
    location: "",
  });
  const { unreadCount } = useUnreadCount();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchProfiles();
    }
  }, [status, router]);

  const fetchProfiles = async () => {
    try {
      // Build query string from filters
      const params = new URLSearchParams();
      if (filters.minAge) params.append("minAge", filters.minAge);
      if (filters.maxAge) params.append("maxAge", filters.maxAge);
      if (filters.gender && filters.gender !== "all") params.append("gender", filters.gender);
      if (filters.location) params.append("location", filters.location);

      const res = await fetch(`/api/discover?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProfiles(data.profiles || []);
        setCurrentIndex(0); // Reset to first profile
      }
    } catch (error) {
      console.error("Failed to fetch profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    setLoading(true);
    fetchProfiles();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      minAge: "",
      maxAge: "",
      gender: "all",
      location: "",
    });
  };

  const handleAction = async (action: "LIKE" | "PASS") => {
    if (currentIndex >= profiles.length) return;

    const currentProfile = profiles[currentIndex];
    setActionLoading(true);

    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: currentProfile.userId,
          action,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        
        if (data.matched) {
          setShowMatch(true);
          setTimeout(() => {
            setShowMatch(false);
            setCurrentIndex(currentIndex + 1);
          }, 2000);
        } else {
          setCurrentIndex(currentIndex + 1);
        }
      }
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setActionLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const currentProfile = profiles[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/dashboard" className="text-xl font-semibold hover:text-purple-600">
              Matchmaking App
            </Link>
            <div className="flex gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                🔍 Filters
              </Button>
              <Button asChild variant="outline" size="sm" className="relative">
                <Link href="/matches">
                  My Matches
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filter Panel */}
        {showFilters && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filter Profiles</CardTitle>
              <CardDescription>Narrow down your matches</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minAge">Min Age</Label>
                  <Input
                    id="minAge"
                    type="number"
                    placeholder="18"
                    value={filters.minAge}
                    onChange={(e) => setFilters({ ...filters, minAge: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxAge">Max Age</Label>
                  <Input
                    id="maxAge"
                    type="number"
                    placeholder="100"
                    value={filters.maxAge}
                    onChange={(e) => setFilters({ ...filters, maxAge: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={filters.gender}
                  onValueChange={(value) => setFilters({ ...filters, gender: value })}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="e.g., New York"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                />
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button onClick={applyFilters} className="flex-1">
                Apply Filters
              </Button>
              <Button onClick={clearFilters} variant="outline">
                Clear
              </Button>
            </CardFooter>
          </Card>
        )}
        {/* Match Notification */}
        {showMatch && (
          <Card className="mb-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 animate-pulse">
            <CardContent className="py-8">
              <div className="text-center">
                <p className="text-3xl mb-2">🎉</p>
                <p className="text-green-900 font-bold text-xl">It's a Match!</p>
                <p className="text-green-700 text-sm mt-2">
                  You can now message each other
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Card */}
        {currentProfile ? (
          <Card className="overflow-hidden">
            {/* Profile Photo */}
            <div className="relative h-96 bg-gradient-to-br from-purple-100 to-pink-100">
              {currentProfile.user.photos.length > 0 ? (
                <img
                  src={currentProfile.user.photos[0].url}
                  alt={currentProfile.user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-6xl text-purple-300">
                    {currentProfile.user.name?.charAt(0).toUpperCase() || "?"}
                  </span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                <h2 className="text-white text-3xl font-bold">
                  {currentProfile.user.name}, {currentProfile.age}
                </h2>
                {currentProfile.location && (
                  <p className="text-white/90 mt-1">📍 {currentProfile.location}</p>
                )}
              </div>
            </div>

            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Badge variant="outline">{currentProfile.gender}</Badge>
                </div>
                {currentProfile.bio && (
                  <div>
                    <h3 className="font-semibold mb-2">About</h3>
                    <p className="text-gray-700">{currentProfile.bio}</p>
                  </div>
                )}
                {currentProfile.user.photos.length > 1 && (
                  <div>
                    <h3 className="font-semibold mb-2">More Photos</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {currentProfile.user.photos.slice(1).map((photo) => (
                        <img
                          key={photo.id}
                          src={photo.url}
                          alt="Profile"
                          className="w-full h-24 object-cover rounded"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex gap-4 p-6">
              <Button
                variant="outline"
                className="flex-1 h-14 text-lg border-red-300 hover:bg-red-50"
                onClick={() => handleAction("PASS")}
                disabled={actionLoading}
              >
                ✕ Pass
              </Button>
              <Button
                className="flex-1 h-14 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                onClick={() => handleAction("LIKE")}
                disabled={actionLoading}
              >
                ♥ Like
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No More Profiles</CardTitle>
              <CardDescription>
                You've seen all available profiles. Check back later for new people!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/matches">View My Matches</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="text-center mt-6 text-gray-600">
          {currentProfile ? (
            <p>
              {currentIndex + 1} of {profiles.length} profiles
            </p>
          ) : (
            <p>All caught up!</p>
          )}
        </div>
      </main>
    </div>
  );
}
