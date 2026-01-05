"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LogoutButton from "@/components/LogoutButton";

interface AdminStats {
  users: {
    total: number;
    active: number;
    banned: number;
    newToday: number;
    newThisWeek: number;
  };
  engagement: {
    totalMatches: number;
    totalMessages: number;
    totalPhotos: number;
    avgMessagesPerUser: string;
  };
  revenue: {
    premiumSubscriptions: number;
    monthlyRevenue: string;
    annualRevenue: string;
  };
}

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
  isBanned: boolean;
  bannedReason: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  profile: {
    age: number | null;
    gender: string | null;
    location: string | null;
  } | null;
  subscription: {
    plan: string;
    status: string;
  } | null;
  _count: {
    photos: number;
    matchesInitiated: number;
    messagesSent: number;
  };
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, [filter, page]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      
      if (res.status === 403) {
        alert("Access denied. Admin privileges required.");
        router.push("/dashboard");
        return;
      }
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/users?page=${page}&filter=${filter}&search=${searchTerm}`
      );
      const data = await res.json();
      
      if (res.status === 403) {
        alert("Access denied. Admin privileges required.");
        router.push("/dashboard");
        return;
      }
      
      if (data.success) {
        setUsers(data.users);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchUsers();
  };

  const handleBanUser = async (userId: string, reason: string) => {
    if (!confirm("Are you sure you want to ban this user?")) return;

    try {
      const res = await fetch("/api/admin/users/ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, reason }),
      });

      const data = await res.json();
      
      if (data.success) {
        alert("User banned successfully");
        fetchUsers();
        fetchStats();
      }
    } catch (error) {
      console.error("Failed to ban user:", error);
      alert("Failed to ban user");
    }
  };

  const handleUnbanUser = async (userId: string) => {
    if (!confirm("Are you sure you want to unban this user?")) return;

    try {
      const res = await fetch("/api/admin/users/ban", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();
      
      if (data.success) {
        alert("User unbanned successfully");
        fetchUsers();
        fetchStats();
      }
    } catch (error) {
      console.error("Failed to unban user:", error);
      alert("Failed to unban user");
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    if (!confirm(`Change user role to ${role}?`)) return;

    try {
      const res = await fetch("/api/admin/users/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });

      const data = await res.json();
      
      if (data.success) {
        alert("Role updated successfully");
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to update role:", error);
      alert("Failed to update role");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-purple-600">Admin Dashboard</h1>
              <Badge className="bg-red-600">ADMIN</Badge>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost">User View</Button>
              </Link>
              <span className="text-gray-700">{session?.user?.email}</span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{stats.users.total}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.users.active} active, {stats.users.banned} banned
                </p>
                <p className="text-xs text-green-600 mt-1">
                  +{stats.users.newToday} today, +{stats.users.newThisWeek} this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.engagement.totalMatches}</div>
                <p className="text-xs text-gray-500 mt-1">Total Matches</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.engagement.totalMessages} messages ({stats.engagement.avgMessagesPerUser} avg/user)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">Premium Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">
                  {stats.revenue.premiumSubscriptions}
                </div>
                <p className="text-xs text-gray-500 mt-1">Active Subscriptions</p>
                <p className="text-xs text-gray-500 mt-1">
                  {((stats.revenue.premiumSubscriptions / stats.users.total) * 100).toFixed(1)}% conversion
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  ${stats.revenue.monthlyRevenue}
                </div>
                <p className="text-xs text-gray-500 mt-1">Monthly (MRR)</p>
                <p className="text-xs text-gray-500 mt-1">
                  ${stats.revenue.annualRevenue} annual
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage all users, roles, and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="banned">Banned Only</SelectItem>
                  <SelectItem value="premium">Premium Only</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}>Search</Button>
            </div>

            {/* User Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stats</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{user.name || "No name"}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.profile && (
                            <div className="text-xs text-gray-400">
                              {user.profile.age}, {user.profile.gender}, {user.profile.location}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Select
                          value={user.role}
                          onValueChange={(role) => handleRoleChange(user.id, role)}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USER">User</SelectItem>
                            <SelectItem value="MODERATOR">Moderator</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-4">
                        {user.isBanned ? (
                          <Badge variant="destructive">Banned</Badge>
                        ) : user.isActive ? (
                          <Badge className="bg-green-600">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {user.subscription?.plan === "PREMIUM" ? (
                          <Badge className="bg-purple-600">Premium</Badge>
                        ) : (
                          <Badge variant="outline">Free</Badge>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-xs text-gray-600">
                          <div>{user._count.photos} photos</div>
                          <div>{user._count.matchesInitiated} matches</div>
                          <div>{user._count.messagesSent} messages</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          {!user.isBanned ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                const reason = prompt("Ban reason:");
                                if (reason) handleBanUser(user.id, reason);
                              }}
                            >
                              Ban
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnbanUser(user.id)}
                            >
                              Unban
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
