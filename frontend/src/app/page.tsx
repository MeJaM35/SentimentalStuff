"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, is_active: true, is_superuser: false, is_verified: false }),
      });

      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const res = await fetch("http://localhost:8000/auth/jwt/login", {
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
      <div className="w-full max-w-md bg-white p-10 border border-brand-text/10">
        <h1 className="mb-2 text-4xl font-serif text-brand-text">SentimentalStuff</h1>
        <p className="mb-10 text-sm text-brand-muted">Enter your credentials to access the workspace.</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-brand-bg border border-brand-text/10 p-3 text-brand-text focus:outline-none focus:border-brand-accent transition-colors" 
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
              className="w-full bg-brand-bg border border-brand-text/10 p-3 text-brand-text focus:outline-none focus:border-brand-accent transition-colors" 
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
