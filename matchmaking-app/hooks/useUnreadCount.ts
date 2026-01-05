"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export function useUnreadCount() {
  const { status } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (status === "authenticated") {
      fetchUnreadCount();
      
      // Poll for updates every 10 seconds
      const interval = setInterval(fetchUnreadCount, 10000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch("/api/messages/unread");
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  return { unreadCount, refreshUnreadCount: fetchUnreadCount };
}
