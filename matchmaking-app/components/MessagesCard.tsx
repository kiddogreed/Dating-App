"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUnreadCount } from "@/hooks/useUnreadCount";

export function MessagesCard() {
  const { unreadCount } = useUnreadCount();

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <Link href="/messages">
        <CardHeader>
          <CardTitle className="text-purple-900 flex items-center gap-2">
            <span>💬</span> Messages
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-auto">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Chat with your matches</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full">
            {unreadCount > 0 ? `${unreadCount} Unread` : "View Conversations"}
          </Button>
        </CardContent>
      </Link>
    </Card>
  );
}
