"use client";
import { useEffect, useState } from "react";
import { Moon, Sun, User, FileJson, X, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Header() {
  const [theme, setTheme] = useState("light");
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showApiDoc, setShowApiDoc] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check local storage for theme
    if (localStorage.getItem("theme") === "dark") {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    }

    // Fetch user
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${API_URL}/users/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.email) setUser(data);
      })
      .catch(console.error);
    } else {
      router.push("/");
    }
  }, [router]);

  const toggleTheme = () => {
    if (theme === "light") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setTheme("light");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <header className="mb-12 flex items-center justify-between border-b border-brand-border pb-6 relative print:hidden">
      <div className="flex items-baseline gap-4">
        <h1 className="text-3xl font-serif text-brand-text">Sentimental Stuff</h1>
        <span className="text-sm text-brand-muted hidden sm:inline-block border-l border-brand-border pl-4">Insights Workspace</span>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={() => setShowApiDoc(true)} className="p-2 text-brand-muted hover:text-brand-text transition" title="API Documentation">
          <FileJson className="w-5 h-5" />
        </button>
        <button onClick={toggleTheme} className="p-2 text-brand-muted hover:text-brand-text transition" title="Toggle Dark Mode">
          {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        <div className="relative">
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-accent text-white font-bold tracking-wide"
          >
            {user ? user.email.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
          </button>
          
          {showProfile && user && (
            <div className="absolute right-0 mt-2 w-64 bg-brand-surface border border-brand-border shadow-soft z-50 p-4">
              <div className="flex items-center gap-3 border-b border-brand-border pb-3 mb-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-brand-accent text-white font-bold text-lg">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-brand-text truncate">{user.email.split('@')[0]}</p>
                  <p className="text-xs text-brand-muted truncate">{user.email}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-2 w-full text-left text-sm text-brand-negative hover:opacity-70 transition">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {showApiDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-brand-surface border border-brand-border w-full max-w-2xl p-8 relative">
            <button onClick={() => setShowApiDoc(false)} className="absolute top-4 right-4 text-brand-muted hover:text-brand-text">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-serif text-brand-text mb-2">API Documentation</h2>
            <p className="text-sm text-brand-muted mb-6">Integrate Sentimental Stuff directly into your own applications.</p>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-brand-text mb-1">Endpoint</h3>
                <code className="block bg-brand-bg border border-brand-border p-3 text-sm text-brand-accent font-mono">POST /analyze</code>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-brand-text mb-1">Authentication</h3>
                <p className="text-xs text-brand-muted mb-2">Requires a Bearer JWT token obtained from <code className="text-brand-text">POST /auth/jwt/login</code>.</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-brand-text mb-1">Example cURL</h3>
                <pre className="block bg-brand-bg border border-brand-border p-4 text-xs text-brand-text font-mono overflow-x-auto">
{`curl -X POST "${API_URL}/analyze" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \\
  -H "Content-Type: multipart/form-data" \\
  -F "file=@/path/to/your/transcript.txt"`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
