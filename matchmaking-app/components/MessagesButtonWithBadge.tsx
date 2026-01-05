"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUnreadCount } from "@/hooks/useUnreadCount";

export function MessagesButtonWithBadge() {
  const { unreadCount } = useUnreadCount();

  return (
    <Button asChild variant="outline" className="relative">
      <Link href="/messages">
        💬 Messages
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Link>
    </Button>
  );
}
