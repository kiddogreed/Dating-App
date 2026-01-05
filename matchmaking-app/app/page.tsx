import Link from "next/link";
import { getServerSession } from "next-auth";

export default async function Home() {
  const session = await getServerSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              ❤️ Matchmaking App
            </h1>
            <div className="flex gap-4">
              {session ? (
                <Link
                  href="/dashboard"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-gray-900 px-4 py-2 font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Find Your Perfect Match
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with people who share your interests. Start your journey to
            meaningful relationships today.
          </p>

          {!session && (
            <div className="flex gap-4 justify-center">
              <Link
                href="/register"
                className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors shadow-lg"
              >
                Create Account
              </Link>
              <Link
                href="/login"
                className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-3 rounded-lg text-lg font-semibold transition-colors border-2 border-gray-300"
              >
                Login
              </Link>
            </div>
          )}

          <div className="mt-20 grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-gray-600">
                Your data is protected with industry-standard encryption
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-2">Real-time Chat</h3>
              <p className="text-gray-600">
                Connect instantly with your matches through live messaging
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-semibold mb-2">Smart Matching</h3>
              <p className="text-gray-600">
                Find compatible partners based on shared interests and values
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
