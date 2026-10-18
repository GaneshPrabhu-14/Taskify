import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const { user, authenticate } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await authenticate(isRegister ? "register" : "login", form);
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not connect to Taskify. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-story">
        <Link className="brand auth-brand" to="/">
          <span className="brand-mark">t</span><span>taskify</span>
        </Link>
        <div className="story-copy">
          <span className="eyebrow">A LITTLE MORE CLARITY</span>
          <h1>Make room for what <em>matters.</em></h1>
          <p>A thoughtful space for your plans, your priorities, and everything you want to make happen.</p>
          <div className="story-note">
            <span className="note-sparkle">✳</span>
            <span>One step at a time is still progress.</span>
          </div>
        </div>
        <span className="story-footer">A calmer kind of productivity.</span>
      </section>
      <section className="auth-panel">
        <div className="auth-box">
          <span className="eyebrow">{isRegister ? "YOUR NEXT CHAPTER" : "WELCOME BACK"}</span>
          <h2>{isRegister ? "Create your account" : "Good to see you."}</h2>
          <p className="auth-subtitle">
            {isRegister ? "Start small. Make meaningful progress." : "Pick up right where you left off."}
          </p>
          <form className="auth-form" onSubmit={submit}>
            {isRegister && (
              <label>
                Your name
                <input
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={60}
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="How should we call you?"
                />
              </label>
            )}
            <label>
              Email address
              <input
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                placeholder="you@example.com"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                autoComplete={isRegister ? "new-password" : "current-password"}
                required
                minLength={isRegister ? 8 : undefined}
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                placeholder={isRegister ? "At least 8 characters" : "Your password"}
              />
            </label>
            {error && <p className="form-error">{error}</p>}
            <button className="button button-primary auth-submit" disabled={submitting}>
              {submitting ? "One moment..." : isRegister ? "Create my account" : "Sign in"}
              <span aria-hidden="true">→</span>
            </button>
          </form>
          <p className="auth-switch">
            {isRegister ? "Already have an account?" : "New to Taskify?"}{" "}
            <Link to={isRegister ? "/login" : "/register"}>
              {isRegister ? "Sign in" : "Create an account"}
            </Link>
          </p>
        </div>
        <span className="auth-legal">Thoughtful plans. Steady progress.</span>
      </section>
    </main>
  );
}
