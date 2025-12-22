import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!email || !password) {
      setError("EMAIL AND PASSWORD REQUIRED.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        }); // email+password signup :contentReference[oaicite:4]{index=4}

        if (error) throw error;

        // Depending on your Supabase settings, user might need to confirm via email.
        setInfo("CHECK YOUR INBOX. THIS MACHINE DEMANDS CONFIRMATION.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        }); // password sign-in :contentReference[oaicite:5]{index=5}

        if (error) throw error;
        // Session is handled globally; App will rerender into the board.
      }
    } catch (err) {
      setError(
        err?.message || "AUTH FAILURE. MACHINE REJECTED YOUR CREDENTIALS."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = (next) => {
    if (next === mode) return;
    setMode(next);
    setError("");
    setInfo("");
  };

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-title-block">
          <div className="auth-kicker">ACCESS CONTROL</div>
          <div className="auth-title">DEADLINE MACHINE</div>
          <div className="auth-subtitle">
            TASK &amp; FOCUS BOARD // USER GATE
          </div>
        </div>

        <div className="auth-toggle-row">
          <button
            type="button"
            className={
              mode === "login"
                ? "auth-toggle-button auth-toggle-button-active"
                : "auth-toggle-button"
            }
            onClick={() => toggleMode("login")}
          >
            LOG IN
          </button>
          <button
            type="button"
            className={
              mode === "signup"
                ? "auth-toggle-button auth-toggle-button-active"
                : "auth-toggle-button"
            }
            onClick={() => toggleMode("signup")}
          >
            REGISTER
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">
            <span className="auth-label-text">EMAIL</span>
            <input
              type="email"
              className="auth-input"
              placeholder="you@domain.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="auth-label">
            <span className="auth-label-text">PASSWORD</span>
            <input
              type="password"
              className="auth-input"
              placeholder="••••••••"
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <div className="auth-error-strip">{error}</div>}
          {info && !error && <div className="auth-info-strip">{info}</div>}

          <button
            type="submit"
            className="auth-submit-button"
            disabled={loading}
          >
            {loading
              ? "PROCESSING..."
              : mode === "login"
              ? "ENTER MACHINE"
              : "CREATE ACCOUNT"}
          </button>
        </form>

        <div className="auth-footer">
          <div className="auth-footer-line">
            WARNING: THIS MACHINE REMEMBERS DEADLINES, NOT EXCUSES.
          </div>
        </div>
      </div>
    </div>
  );
}
