"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { storeToken } from "@/utils/auth";

/**
 * Backend authentication response structure
 */
interface AuthResponse {
  message: string;
  user_id: string;
  token: string;
  expires: number;
  error?: string;
}

export default function SignInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  /**
   * Handle form submission and authentication
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Send login request to backend
      const res = await fetch(`http://localhost:8003/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      // Handle network or parsing errors
      console.error("Login error:", err);
      setError("Failed to connect to the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Login</h1>
        {error && <p className="text-red-500">{error}</p>}
        <input
            type="text"
            placeholder="Username"
            className="w-full rounded border px-4 py-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
        />
        <input
            type="password"
            placeholder="Password"
            className="w-full rounded border px-4 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
        />
        <div className="space-y-2">
          <button
              type="submit"
              className="w-full rounded bg-black py-2 font-semibold text-white disabled:bg-gray-400"
              disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Login"}
          </button>

          <button
              type="button"
              onClick={() => router.push("/register")}
              className="w-full rounded border border-black py-2 font-semibold text-black hover:bg-gray-100"
          >
            Register
          </button>
        </div>

      </form>
    </main>
  );
}