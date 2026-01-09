"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function EmailVerificationBanner() {
  const { data: session, status } = useSession();
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Check if banner was dismissed in this session
  useEffect(() => {
    const wasDismissed = sessionStorage.getItem("verificationBannerDismissed");
    if (wasDismissed === "true") {
      setDismissed(true);
    }
  }, []);

  const handleResend = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Verification email sent! Check your inbox.");
      } else {
        setMessage(`❌ ${data.error || "Failed to send email"}`);
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      setMessage("❌ Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("verificationBannerDismissed", "true");
  };

  // Don't show if:
  // - Still loading
  // - Not authenticated
  // - Already verified
  // - User dismissed it
  if (
    status === "loading" ||
    status === "unauthenticated" ||
    session?.user?.emailVerified ||
    dismissed
  ) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2 flex-1">
            <span className="text-yellow-600 text-lg flex-shrink-0">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-900">
                Email Verification Required
              </p>
              <p className="text-xs text-yellow-800 mt-1">
                Please verify your email address to access all features. Check your inbox for the verification link.
              </p>
              {message && (
                <p className="text-xs mt-2 font-medium">
                  {message}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={handleResend}
              disabled={loading}
              className="bg-white hover:bg-yellow-50 border-yellow-300"
            >
              {loading ? "Sending..." : "Resend Email"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="text-yellow-700 hover:bg-yellow-100"
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
