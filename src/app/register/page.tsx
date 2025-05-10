"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RegisterResponse {
  message?: string;
  error?: string;
}

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [githubOwnership, setGithubOwnership] = useState(""); // comma-separated string
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          github_ownership: githubOwnership,
          password,
        }),
      });

      const data: RegisterResponse = await res.json();

      if (res.ok) {
        console.log("Registration successful");
        router.push("/signin");
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      console.error("Register error:", err);
      setError("Failed to connect to the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleRegister} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Register</h1>
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
          type="text"
          placeholder="GitHub ownerships (e.g. emir,emir-devs)"
          className="w-full rounded border px-4 py-2"
          value={githubOwnership}
          onChange={(e) => setGithubOwnership(e.target.value)}
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

        <button
          type="submit"
          className="w-full rounded bg-black py-2 font-semibold text-white disabled:bg-gray-400"
          disabled={isLoading}
        >
          {isLoading ? "Registering..." : "Register"}
        </button>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <a href="/signin" className="text-blue-600 underline">
            Sign in
          </a>
        </p>
      </form>
    </main>
  );
}
