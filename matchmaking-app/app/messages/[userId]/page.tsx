"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: Date;
  sender: {
    id: string;
    name: string;
    image: string | null;
  };
  receiver: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface PageParams {
  userId: string;
}

export default function ChatPage({ params }: { params: Promise<PageParams> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUserId, setOtherUserId] = useState<string>("");
  const [otherUserName, setOtherUserName] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    params.then((p) => {
      setOtherUserId(p.userId);
    });
  }, [params]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && otherUserId) {
      fetchMessages();
    }
  }, [status, router, otherUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages?userId=${otherUserId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        
        // Get other user's name from first message
        if (data.messages && data.messages.length > 0) {
          const firstMessage = data.messages[0];
          const otherUser =
            firstMessage.senderId === session?.user?.id
              ? firstMessage.receiver
              : firstMessage.sender;
          setOtherUserName(otherUser.name || "User");
          
          // Mark messages as read
          await fetch("/api/messages/unread", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ senderId: otherUserId }),
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || sending) return;

    setSending(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: otherUserId,
          content: newMessage.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages([...messages, data.message]);
        setNewMessage("");
        
        // Set other user name if not already set
        if (!otherUserName && data.message.receiver) {
          setOtherUserName(data.message.receiver.name || "User");
        }
      } else {
        const error = await res.json();
        alert(error.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/messages">← Back</Link>
              </Button>
              <h1 className="text-xl font-semibold">
                {otherUserName || "Chat"}
              </h1>
            </div>
            <div className="flex gap-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Messages Container */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
          <Card className="flex-1 flex flex-col overflow-hidden">
            {/* Messages List */}
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((message) => {
                  const isMe = message.senderId === session?.user?.id;
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          isMe
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                            : "bg-gray-200 text-gray-900"
                        }`}
                      >
                        <p className="break-words">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isMe ? "text-purple-100" : "text-gray-600"
                          }`}
                        >
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Message Input */}
            <div className="border-t p-4">
              <form onSubmit={sendMessage} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={sending}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {sending ? "Sending..." : "Send"}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
