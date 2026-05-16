import { useState } from "react";
import { useAuth } from "./AuthContext";

export default function AuthForm() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        await register({ email, password, displayName: displayName.trim() || undefined });
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="Auth">
      <section className="Card Auth-card">
        <div className="Card-title">{mode === "login" ? "Sign in" : "Create account"}</div>
        <form className="Form" onSubmit={onSubmit}>
          {mode === "register" ? (
            <label className="Field">
              <span className="Field-label">Display name</span>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Optional"
                autoComplete="name"
              />
            </label>
          ) : null}
          <label className="Field">
            <span className="Field-label">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </label>
          <label className="Field">
            <span className="Field-label">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </label>
          {error ? <div className="Alert">{error}</div> : null}
          <div className="Form-actions">
            <button className="Button" type="submit" disabled={submitting}>
              {submitting ? "Please wait…" : mode === "login" ? "Sign in" : "Register"}
            </button>
            <button
              className="Button Button--ghost"
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
              }}
            >
              {mode === "login" ? "Need an account?" : "Already have an account?"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
