import React from "react";

export default function BBHeader({ month, onMonthChange }) {
  return (
    <header className="bb-header">
      <div className="bb-brand-block">
        <div className="bb-brand">BLOCKBUDGET</div>
        <div className="bb-sub">SIMPLE BUDGET &amp; EXPENSE TERMINAL</div>
      </div>

      <div className="bb-month-block">
        <div className="bb-month-label">MONTH</div>
        <input
          type="month"
          className="bb-month-input"
          value={month}
          onChange={(e) => onMonthChange(e.target.value)}
        />
      </div>
    </header>
  );
}
