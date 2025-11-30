import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { useAuth } from "../hooks/useAuth";
import api from "../../../lib/api";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("/auth", { email, password });
      const { token, user } = response.data;

      login(token, user);
      navigate("/");
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setError(error.response?.data?.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg shadow-xl p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Football Fantasy
          </h1>
          <p className="text-slate-400">Manage your dream team</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-800 text-red-200 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="••••••••"
              minLength={6}
              required
            />
            <p className="mt-1 text-xs text-slate-500">Min. 6 characters</p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
            ) : (
              "Login / Register"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Enter your email to login or create a new account automatically.
        </div>
      </div>
    </div>
  );
}
