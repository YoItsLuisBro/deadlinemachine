import React, { useState } from "react";

export default function UserMenu({ profile, onLogout }) {
  const [open, setOpen] = useState(false);

  if (!profile) return null;

  const toggle = () => setOpen((prev) => !prev);

  return (
    <div className="user-menu">
      <button type="button" className="user-menu-trigger" onClick={toggle}>
        {profile.username}
      </button>

      {open && (
        <div className="user-menu-panel">
          <div className="user-menu-row">
            <span className="user-menu-label">USERNAME</span>
            <span className="user-menu-value">{profile.username}</span>
          </div>
          <div className="user-menu-row">
            <span className="user-menu-label">EMAIL</span>
            <span className="user-menu-value">{profile.email}</span>
          </div>
          <button type="button" className="user-menu-logout" onClick={onLogout}>
            LOG OUT
          </button>
        </div>
      )}
    </div>
  );
}
