"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UnreadBadge } from "@/components/UnreadBadge";
import { useUnreadCount } from "@/hooks/useUnreadCount";

interface Conversation {
  user: {
    id: string;
    name: string;
    image: string | null;
    photos: Array<{ id: string; url: string }>;
  };
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    createdAt: Date;
  } | null;
  matchedAt: Date;
  unreadCount: number;
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { refreshUnreadCount } = useUnreadCount();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchConversations();
    }
  }, [status, router]);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
        refreshUnreadCount(); // Refresh unread count when viewing conversations
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    } else if (diffInHours < 168) {
      return messageDate.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return messageDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
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
              <Button asChild variant="outline" size="sm">
                <Link href="/discover">Discover</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/matches">Matches</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Messages</CardTitle>
            <CardDescription>
              Chat with your matches
            </CardDescription>
          </CardHeader>
          <CardContent>
            {conversations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No conversations yet</p>
                <p className="text-sm text-gray-400 mb-6">
                  Start matching with people to begin conversations
                </p>
                <Button asChild>
                  <Link href="/discover">Find Matches</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv) => {
                  const photo = conv.user.photos[0]?.url || conv.user.image;
                  const isFromMe = conv.lastMessage?.senderId === session?.user?.id;
                  
                  return (
                    <Link
                      key={conv.user.id}
                      href={`/messages/${conv.user.id}`}
                      className="block"
                    >
                      <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-purple-200">
                        {/* Avatar */}
                        <div className="flex-shrink-0 relative">
                          {photo ? (
                            <img
                              src={photo}
                              alt={conv.user.name}
                              className="w-14 h-14 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xl font-semibold">
                              {conv.user.name?.charAt(0).toUpperCase() || "?"}
                            </div>
                          )}
                          <UnreadBadge count={conv.unreadCount} />
                        </div>

                        {/* Message Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {conv.user.name}
                            </h3>
                            {conv.lastMessage && (
                              <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                {formatTime(conv.lastMessage.createdAt)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {conv.lastMessage ? (
                              <>
                                {isFromMe && "You: "}
                                {conv.lastMessage.content}
                              </>
                            ) : (
                              <span className="text-gray-400 italic">
                                No messages yet - Say hi!
                              </span>
                            )}
                          </p>
                        </div>

                        {/* Arrow indicator */}
                        <div className="flex-shrink-0 text-gray-400">
                          →
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
