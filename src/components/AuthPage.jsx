import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [identifier, setIdentifier] = useState(''); // login: email or username
  const [email, setEmail] = useState('');           // signup email
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    // SIGNUP FLOW (email + password only)
    if (mode === 'signup') {
      if (!email || !password) {
        setError('EMAIL AND PASSWORD REQUIRED.');
        return;
      }

      setLoading(true);
      try {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        setInfo(
          'CHECK YOUR INBOX. CONFIRM EMAIL TO ENTER THE MACHINE.'
        );
      } catch (err) {
        setError(
          err?.message ||
            'SIGNUP FAILED. MACHINE REJECTED YOUR CREDENTIALS.'
        );
      } finally {
        setLoading(false);
      }

      return;
    }

    // LOGIN FLOW (email OR username)
    const id = identifier.trim();
    if (!id || !password) {
      setError('USERNAME/EMAIL AND PASSWORD REQUIRED.');
      return;
    }

    setLoading(true);
    try {
      let emailToUse = id;

      // If it doesn't look like an email, treat it as username
      if (!id.includes('@')) {
        const { data, error: rpcError } = await supabase.rpc(
          'get_email_for_username',
          { p_username: id }
        );

        if (rpcError) {
          console.error(rpcError);
          throw new Error('FAILED TO RESOLVE USERNAME.');
        }

        if (!data) {
          throw new Error('UNKNOWN USERNAME.');
        }

        emailToUse = data;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      });

      if (error) throw error;
    } catch (err) {
      setError(
        err?.message ||
          'LOGIN FAILED. MACHINE REJECTED YOUR CREDENTIALS.'
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = (next) => {
    if (next === mode) return;
    setMode(next);
    setError('');
    setInfo('');
    setPassword('');
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
              mode === 'login'
                ? 'auth-toggle-button auth-toggle-button-active'
                : 'auth-toggle-button'
            }
            onClick={() => toggleMode('login')}
          >
            LOG IN
          </button>
          <button
            type="button"
            className={
              mode === 'signup'
                ? 'auth-toggle-button auth-toggle-button-active'
                : 'auth-toggle-button'
            }
            onClick={() => toggleMode('signup')}
          >
            REGISTER
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'login' ? (
            <label className="auth-label">
              <span className="auth-label-text">
                EMAIL OR USERNAME
              </span>
              <input
                type="text"
                className="auth-input"
                placeholder="you@domain.com or username"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </label>
          ) : (
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
          )}

          <label className="auth-label">
            <span className="auth-label-text">PASSWORD</span>
            <input
              type="password"
              className="auth-input"
              placeholder="••••••••"
              autoComplete={
                mode === 'signup'
                  ? 'new-password'
                  : 'current-password'
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <div className="auth-error-strip">{error}</div>}
          {info && !error && (
            <div className="auth-info-strip">{info}</div>
          )}

          <button
            type="submit"
            className="auth-submit-button"
            disabled={loading}
          >
            {loading
              ? 'PROCESSING...'
              : mode === 'login'
              ? 'ENTER MACHINE'
              : 'CREATE ACCOUNT'}
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

