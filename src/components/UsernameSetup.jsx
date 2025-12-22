import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function UsernameSetup({ user, onComplete }) {
  const [username, setUsername] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    const trimmed = username.trim();
    if (!trimmed) {
      setError("USERNAME REQUIRED.");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setError("USE LETTERS, NUMBERS, UNDERSCORE ONLY.");
      return;
    }

    setChecking(true);
    try {
      // Check if username is free
      const { data: isFree, error: rpcErr } = await supabase.rpc(
        "is_username_available",
        { p_username: trimmed }
      );

      if (rpcErr) {
        console.error(rpcErr);
        setError("FAILED TO VALIDATE USERNAME.");
        return;
      }

      if (!isFree) {
        setError("USERNAME ALREADY TAKEN.");
        return;
      }

      // Create profile row
      const { data, error: insertErr } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          username: trimmed,
          email: user.email,
        })
        .select("username, email")
        .single();

      if (insertErr) {
        console.error(insertErr);
        setError("FAILED TO SAVE USERNAME.");
        return;
      }

      setInfo("USERNAME LOCKED IN.");
      onComplete(data);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-title-block">
          <div className="auth-kicker">IDENTITY REQUIRED</div>
          <div className="auth-title">CHOOSE USERNAME</div>
          <div className="auth-subtitle">
            THIS LABEL WILL BE DISPLAYED TO THE MACHINE.
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">
            <span className="auth-label-text">USERNAME</span>
            <input
              className="auth-input"
              type="text"
              placeholder="e.g. DEADLINE_DRUID"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>

          {error && <div className="auth-error-strip">{error}</div>}
          {info && !error && <div className="auth-info-strip">{info}</div>}

          <button
            type="submit"
            className="auth-submit-button"
            disabled={checking}
          >
            {checking ? "CHECKING..." : "LOCK IN USERNAME"}
          </button>
        </form>

        <div className="auth-footer">
          <div className="auth-footer-line">
            NOTE: YOU CAN USE THIS USERNAME TO SIGN IN LATER.
          </div>
        </div>
      </div>
    </div>
  );
}


