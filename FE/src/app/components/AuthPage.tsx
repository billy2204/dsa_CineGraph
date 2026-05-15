import { useState } from "react";
import { Eye, EyeOff, Film, Star, Search } from "lucide-react";

interface AuthPageProps {
  onLogin: (user: { name: string; email: string }) => void;
  onPreview: () => void;
}

export function AuthPage({ onLogin, onPreview }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (mode === "register") {
      if (!form.name) { setError("Name is required."); return; }
      if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
      if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin({ name: form.name || form.email.split("@")[0], email: form.email });
    }, 800);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #1a0a14 50%, #0a0a1a 100%)" }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-10" style={{ background: "#FF2D55", filter: "blur(80px)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-8" style={{ background: "#FF2D55", filter: "blur(120px)" }} />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 rounded-full opacity-5" style={{ background: "#7928CA", filter: "blur(60px)", transform: "translate(-50%,-50%)" }} />
        {/* Film strip decoration */}
        <div className="absolute left-0 top-0 h-full w-16 opacity-5" style={{ backgroundImage: "repeating-linear-gradient(to bottom, transparent, transparent 60px, rgba(255,255,255,0.3) 60px, rgba(255,255,255,0.3) 80px)", backgroundSize: "100% 80px" }} />
        <div className="absolute right-0 top-0 h-full w-16 opacity-5" style={{ backgroundImage: "repeating-linear-gradient(to bottom, transparent, transparent 60px, rgba(255,255,255,0.3) 60px, rgba(255,255,255,0.3) 80px)", backgroundSize: "100% 80px" }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #FF2D55, #FF6B35)" }}>
              <Film className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-white" style={{ fontSize: "2rem", fontWeight: "700", letterSpacing: "-0.02em" }}>CineGraph</h1>
          </div>
          <div className="flex items-center justify-center gap-4 text-gray-500">
            <div className="flex items-center gap-1">
              <Search className="w-3 h-3" />
              <span style={{ fontSize: "0.75rem" }}>Smart Search</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              <span style={{ fontSize: "0.75rem" }}>Graph AI</span>
            </div>
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 border"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)",
            borderColor: "rgba(255,255,255,0.08)",
            boxShadow: "0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,45,85,0.1)",
          }}
        >
          {/* Title from Figma design */}
          <div className="text-center mb-6">
            <h2 className="text-white mb-1" style={{ fontSize: "1.75rem", fontWeight: "700" }}>
              {mode === "login" ? "WELCOME BACK" : "JOIN CINEGRAPH"}
            </h2>
            <p className="text-gray-400" style={{ fontSize: "0.9rem" }}>
              {mode === "login" ? "Login to continue exploring movies" : "Create an account to discover movies"}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-lg p-1 mb-6" style={{ background: "rgba(255,255,255,0.05)" }}>
            {(["login", "register"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setMode(tab); setError(""); }}
                className="flex-1 py-2 rounded-md transition-all duration-200"
                style={{
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  color: mode === tab ? "white" : "rgba(255,255,255,0.4)",
                  background: mode === tab ? "linear-gradient(135deg, #FF2D55, #FF6B35)" : "transparent",
                }}
              >
                {tab === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-gray-300 mb-1" style={{ fontSize: "0.875rem" }}>Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    fontSize: "0.9rem",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#FF2D55")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>
            )}

            <div>
              <label className="block text-gray-300 mb-1" style={{ fontSize: "0.875rem" }}>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  fontSize: "0.9rem",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#FF2D55")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-1" style={{ fontSize: "0.875rem" }}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 pr-12 rounded-lg text-white placeholder-gray-500 outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    fontSize: "0.9rem",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#FF2D55")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {mode === "register" && (
              <div>
                <label className="block text-gray-300 mb-1" style={{ fontSize: "0.875rem" }}>Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    fontSize: "0.9rem",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#FF2D55")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>
            )}

            {error && (
              <div className="text-red-400 text-sm py-2 px-3 rounded-lg" style={{ background: "rgba(255,45,85,0.1)", border: "1px solid rgba(255,45,85,0.2)" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-white transition-all duration-200 mt-2"
              style={{
                background: loading ? "rgba(255,45,85,0.5)" : "linear-gradient(135deg, #FF2D55, #FF6B35)",
                fontWeight: "700",
                fontSize: "0.95rem",
                boxShadow: "0 4px 15px rgba(255,45,85,0.3)",
              }}
              onMouseOver={(e) => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>

            <button
              type="button"
              onClick={onPreview}
              className="w-full py-3 rounded-lg text-white transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                fontWeight: "700",
                fontSize: "0.95rem",
              }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = "rgba(255,45,85,0.45)"; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
            >
              Preview Layout
            </button>

            {mode === "login" && (
              <div className="text-center">
                <button type="button" className="text-gray-400 hover:text-gray-200 transition-colors" style={{ fontSize: "0.8rem" }}>
                  Forgot password?
                </button>
              </div>
            )}
          </form>

          <div className="text-center mt-4 text-gray-500" style={{ fontSize: "0.8rem" }}>
            <span>{mode === "login" ? "Don't have an account? " : "Already have an account? "}</span>
            <button
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
              style={{ color: "#FF2D55", fontWeight: "600" }}
            >
              {mode === "login" ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </div>

        {/* Demo hint */}
        <p className="text-center text-gray-600 mt-4" style={{ fontSize: "0.75rem" }}>
          Demo: any email & password to continue
        </p>
      </div>
    </div>
  );
}
