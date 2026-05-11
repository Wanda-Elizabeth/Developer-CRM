import { useState } from "react";
import { saveTokens } from "./auth";

type Props = {
  onAuthSuccess: () => void;
  initialMode?: "login" | "register";
};

export default function AuthPage({
  onAuthSuccess,
  initialMode = "login",
}: Props) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE =
    import.meta.env.VITE_API_URL || "http://127.0.0.1:8011/api";

  const getErrorMessage = async (res: Response, fallback: string) => {
    try {
      const data = await res.json();

      if (typeof data?.detail === "string") {
        return data.detail;
      }

      return JSON.stringify(data);
    } catch {
      return fallback;
    }
  };

  const handleRegister = async () => {
    try {
      setError("");
      setLoading(true);

      const res = await fetch(`${API_BASE}/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (!res.ok) {
        const message = await getErrorMessage(res, "Registration failed");
        throw new Error(message);
      }

      setMode("login");
      setError("Account created. You can now log in.");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";

      setError(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setError("");
      setLoading(true);

      const res = await fetch(`${API_BASE}/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const message = await getErrorMessage(
          res,
          "Invalid username or password"
        );
        throw new Error(message);
      }

      const data = await res.json();

      saveTokens(data.access, data.refresh);
      onAuthSuccess();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Invalid username or password";

      setError(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6">
        <h1 className="mb-2 text-2xl font-bold">
          {mode === "login" ? "Login" : "Create account"}
        </h1>

        <p className="mb-6 text-sm text-zinc-400">
          {mode === "login"
            ? "Access your developer dashboard"
            : "Join DevForge and submit your solutions"}
        </p>

        <div className="space-y-4">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            disabled={loading}
            className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm outline-none disabled:opacity-60"
          />

          {mode === "register" && (
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              disabled={loading}
              className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm outline-none disabled:opacity-60"
            />
          )}

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            disabled={loading}
            className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm outline-none disabled:opacity-60"
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="button"
            onClick={mode === "login" ? handleLogin : handleRegister}
            disabled={loading}
            className="relative z-10 w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-black cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? mode === "login"
                ? "Logging in..."
                : "Registering..."
              : mode === "login"
                ? "Login"
                : "Register"}
          </button>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={() => {
            setError("");
            setMode(mode === "login" ? "register" : "login");
          }}
          className="mt-4 text-sm text-zinc-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {mode === "login"
            ? "Need an account? Register"
            : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
}