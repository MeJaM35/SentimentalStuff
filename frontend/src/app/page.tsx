"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem("theme") === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, is_active: true, is_superuser: false, is_verified: false }),
      });

      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const res = await fetch(`${API_URL}/auth/jwt/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      if (!res.ok) throw new Error("Invalid credentials");

      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md bg-brand-surface p-10 border border-brand-border shadow-soft">
        <h1 className="mb-2 text-4xl font-serif text-brand-text">Sentimental Stuff</h1>
        <p className="mb-10 text-sm text-brand-muted">Enter your credentials to access the workspace.</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-brand-bg border border-brand-border p-3 text-brand-text focus:outline-none focus:border-brand-accent transition-colors" 
              placeholder="agent@company.com" 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-brand-bg border border-brand-border p-3 text-brand-text focus:outline-none focus:border-brand-accent transition-colors" 
              placeholder="••••••••" 
            />
          </div>
          {error && <p className="text-brand-negative text-sm">{error}</p>}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-accent p-4 font-semibold text-white hover:bg-opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
