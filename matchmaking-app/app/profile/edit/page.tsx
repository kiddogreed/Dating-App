"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import PhotoUpload from "@/components/PhotoUpload";

export default function ProfileEditPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [bio, setBio] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState("");

  // Fetch existing profile data
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const res = await fetch("/api/profile");
      
      if (!res.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await res.json();
      
      // Check if profile exists
      if (!data.profile) {
        // No profile exists, redirect to create page
        router.push("/profile/create");
        return;
      }
      
      // Pre-populate form with existing data
      setBio(data.profile.bio || "");
      setAge(data.profile.age?.toString() || "");
      setGender(data.profile.gender || "");
      setLocation(data.profile.location || "");
    } catch (err) {
      setError("Failed to load profile data");
      console.error(err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validation
      if (!age || !gender) {
        setError("Age and gender are required");
        setLoading(false);
        return;
      }

      const ageNum = Number.parseInt(age);
      if (Number.isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
        setError("Age must be between 18 and 100");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio: bio.trim() || null,
          age: ageNum,
          gender,
          location: location.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      // Redirect to profile view
      router.push(`/profile/${session?.user?.id}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  if (status === "loading" || loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
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
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Edit Your Profile</CardTitle>
            <CardDescription>
              Update your profile information to keep it current
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">
                  Bio <span className="text-gray-500 text-sm">(Optional)</span>
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={500}
                  rows={5}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500 text-right">
                  {bio.length}/500 characters
                </p>
              </div>

              {/* Age */}
              <div className="space-y-2">
                <Label htmlFor="age">
                  Age <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter your age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min={18}
                  max={100}
                  required
                />
                <p className="text-xs text-gray-500">Must be 18 or older</p>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender">
                  Gender <span className="text-red-500">*</span>
                </Label>
                <Select value={gender} onValueChange={setGender} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">
                  Location <span className="text-gray-500 text-sm">(Optional)</span>
                </Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="e.g., New York, USA"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  maxLength={100}
                />
              </div>
            </CardContent>

            <CardFooter className="flex justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard")}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="min-w-[120px]">
                {loading ? "Updating..." : "Update Profile"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Photo Upload Section */}
        <div className="mt-6">
          <PhotoUpload />
        </div>

        {/* Tips Section */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900 text-lg">💡 Profile Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Keep your bio authentic and engaging</li>
              <li>• Update your location to connect with people nearby</li>
              <li>• Be honest about your age and other details</li>
              <li>• Review and update your profile regularly</li>
              <li>• Add photos to make your profile stand out</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
