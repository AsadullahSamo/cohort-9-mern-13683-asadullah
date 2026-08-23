import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Login failed");
      }
    }
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Cover panel */}
      <div
        className="hidden md:flex md:w-1/2 relative flex-col justify-between overflow-hidden px-12 py-10"
        style={{
          backgroundColor: "#1B1F3B",
          backgroundImage:
            "radial-gradient(circle, rgba(169,172,201,0.15) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      >
        <span
          className="text-sm tracking-[0.2em] uppercase"
          style={{ color: "#A9ACC9" }}
        >
          Notes
        </span>

        <div>
          <h1
            className="text-5xl leading-[1.1] text-white"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
          >
            Pick up
            <br />
            right where you{" "}
            <span className="relative inline-block">
              left
              <svg
                className="absolute left-0 -bottom-2 w-full"
                height="8"
                viewBox="0 0 100 8"
                fill="none"
              >
                <path
                  d="M2 5.5C17 1.5 33 1.5 50 4.5C67 7.5 83 2.5 98 4"
                  stroke="#E2A83D"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
            off.
          </h1>
          <p className="mt-5 text-base max-w-xs" style={{ color: "#A9ACC9" }}>
            Your notes, formatted and searchable, waiting exactly as you left them.
          </p>
        </div>

        {/* Note card stack */}
        <div className="relative h-40">
          <div
            className="absolute w-56 rounded-lg p-3 shadow-xl"
            style={{ backgroundColor: "#F7F7FB", transform: "rotate(-7deg)", left: 0, top: 10 }}
          >
            <div className="w-8 h-1.5 rounded-full mb-2" style={{ backgroundColor: "#E2A83D" }} />
            <div className="h-2 rounded-full bg-slate-300 mb-1.5 w-4/5" />
            <div className="h-2 rounded-full bg-slate-200 w-3/5" />
          </div>
          <div
            className="absolute w-56 rounded-lg p-3 shadow-xl"
            style={{ backgroundColor: "#F7F7FB", transform: "rotate(4deg)", left: 60, top: -6 }}
          >
            <div className="w-8 h-1.5 rounded-full mb-2" style={{ backgroundColor: "#6C7CE7" }} />
            <div className="h-2 rounded-full bg-slate-300 mb-1.5 w-full" />
            <div className="h-2 rounded-full bg-slate-200 w-2/3" />
          </div>
          <div
            className="absolute w-56 rounded-lg p-3 shadow-xl"
            style={{ backgroundColor: "#F7F7FB", transform: "rotate(-2deg)", left: 130, top: 22 }}
          >
            <div className="w-8 h-1.5 rounded-full mb-2" style={{ backgroundColor: "#4FBF8F" }} />
            <div className="h-2 rounded-full bg-slate-300 mb-1.5 w-4/5" />
            <div className="h-2 rounded-full bg-slate-200 w-1/2" />
          </div>
        </div>
      </div>

      {/* Page panel */}
      <div
        className="flex-1 flex items-center justify-center px-6 py-10"
        style={{ backgroundColor: "#F7F7FB" }}
      >
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <h2
            className="text-3xl mb-1"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, color: "#1B1F3B" }}
          >
            Welcome back
          </h2>
          <p className="text-sm mb-8" style={{ color: "#6B6F86" }}>
            Log in to your notes.
          </p>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-5">
              {error}
            </p>
          )}

          <div className="space-y-1.5 mb-4">
            <label htmlFor="email" className="text-sm font-medium" style={{ color: "#1B1F3B" }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none"
              style={{ border: "1px solid #E4E4EE" }}
              onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px #E2A83D")}
              onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              required
            />
          </div>

          <div className="space-y-1.5 mb-6">
            <label htmlFor="password" className="text-sm font-medium" style={{ color: "#1B1F3B" }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none"
              style={{ border: "1px solid #E4E4EE" }}
              onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px #E2A83D")}
              onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg py-2.5 text-sm font-medium text-white cursor-pointer transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#1B1F3B" }}
          >
            Log in
          </button>

          <p className="text-sm text-center mt-6" style={{ color: "#6B6F86" }}>
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium hover:underline" style={{ color: "#1B1F3B" }}>
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}