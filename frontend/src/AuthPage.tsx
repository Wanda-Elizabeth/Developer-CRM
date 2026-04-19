import { useState } from "react";
import { saveTokens } from "./auth";



type Props = {
  onAuthSuccess: () => void;
};


function AuthPage({ onAuthSuccess }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001/api";

  const handleRegister = async () => {
    try {
      setError("");

      const res = await fetch(`${API_BASE}/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (!res.ok) {
       const data = await res.json();
        throw new Error(data?.detail || JSON.stringify(data));
      }

      setMode("login");
    } catch (err: any) {
     setError(err.message || "Something went wrong");
      console.error(err);
    }
  };

  const handleLogin = async () => {
    try {
      setError("");

const res = await fetch(`${API_BASE}/token/`, {
            method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        throw new Error("Login failed");
      }

      const data = await res.json();
      saveTokens(data.access, data.refresh);
      onAuthSuccess();
    } catch (err) {
      setError("Invalid username or password");
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6">
        <h1 className="mb-2 text-2xl font-bold">
          {mode === "login" ? "Login" : "Create account"}
        </h1>

        <p className="mb-6 text-sm text-zinc-400">
          {mode === "login"
            ? "Access your developer dashboard"
            : "Join DevBuild and submit your solutions"}
        </p>

        <div className="space-y-4">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm outline-none"
          />

          {mode === "register" && (
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm outline-none"
            />
          )}

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm outline-none"
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            onClick={mode === "login" ? handleLogin : handleRegister}
            className="w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-black"
          >
            {mode === "login" ? "Login" : "Register"}
          </button>
        </div>

        <button
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="mt-4 text-sm text-zinc-400 hover:text-white"
        >
          {mode === "login"
            ? "Need an account? Register"
            : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
}

export default AuthPage;
