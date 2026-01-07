"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
  const router = useRouter();

  // Calculate password strength
  function calculatePasswordStrength(pwd: string): 'weak' | 'medium' | 'strong' {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

    if (strength <= 2) return 'weak';
    if (strength <= 3) return 'medium';
    return 'strong';
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    setPasswordStrength(calculatePasswordStrength(value));
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validate password strength
    if (passwordStrength === 'weak') {
      setError("Password is too weak. Please use a stronger password.");
      setLoading(false);
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      // Registration successful
      setSuccess(data.message || "Registration successful! Please check your email to verify your account.");
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login?registered=true");
      }, 3000);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <form
        onSubmit={handleRegister}
        className="bg-white p-8 shadow-lg rounded-lg w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-semibold text-center">Create Account</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">First Name</label>
            <input
              type="text"
              placeholder="John"
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <input
              type="text"
              placeholder="Doe"
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            placeholder="Create a strong password"
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            required
          />
          
          {/* Password Strength Indicator */}
          {password && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                <div className={`h-1 flex-1 rounded ${
                  password.length > 0 ? 
                    passwordStrength === 'weak' ? 'bg-red-500' : 
                    passwordStrength === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  : 'bg-gray-200'
                }`} />
                <div className={`h-1 flex-1 rounded ${
                  passwordStrength === 'medium' || passwordStrength === 'strong' ? 
                    passwordStrength === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  : 'bg-gray-200'
                }`} />
                <div className={`h-1 flex-1 rounded ${
                  passwordStrength === 'strong' ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              </div>
              <p className={`text-xs ${
                passwordStrength === 'weak' ? 'text-red-600' :
                passwordStrength === 'medium' ? 'text-yellow-600' : 'text-green-600'
              }`}>
                Password strength: {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
              </p>
            </div>
          )}
          
          {/* Password Requirements */}
          <div className="mt-2 text-xs text-gray-600 space-y-1">
            <p className="font-medium">Password must contain:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li className={password.length >= 8 ? 'text-green-600' : ''}>
                At least 8 characters
              </li>
              <li className={/[a-z]/.test(password) && /[A-Z]/.test(password) ? 'text-green-600' : ''}>
                Upper and lowercase letters
              </li>
              <li className={/[0-9]/.test(password) ? 'text-green-600' : ''}>
                At least one number
              </li>
              <li className={/[^a-zA-Z0-9]/.test(password) ? 'text-green-600' : ''}>
                Special character (recommended)
              </li>
            </ul>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm your password"
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}
