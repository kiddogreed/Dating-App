import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-semibold">Matchmaking App</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">
                {session.user?.name || session.user?.email}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">
            Welcome, {session.user?.name || "User"}!
          </h2>
          <p className="text-gray-600 mb-6">
            You're successfully logged in to your dashboard.
          </p>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">
                ✅ Phase 2: Authentication - Complete!
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• User registration</li>
                <li>• Login with credentials</li>
                <li>• Session management</li>
                <li>• Protected routes</li>
                <li>• Logout functionality</li>
              </ul>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                📋 Next: Phase 3 - Profiles
              </h3>
              <p className="text-sm text-gray-600">
                Build profile creation, editing, and viewing functionality.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
