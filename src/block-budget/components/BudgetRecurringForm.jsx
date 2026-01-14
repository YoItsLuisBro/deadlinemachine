import React from "react";

function BudgetRecurringForm({
  categories,
  amount,
  categoryId,
  note,
  day,
  onAmountChange,
  onCategoryChange,
  onNoteChange,
  onDayChange,
  onSubmit,
}) {
  return (
    <form className="bb-form bb-form-recurring" onSubmit={onSubmit}>
      <div className="bb-form-title">RECURRING EXPENSE</div>

      <div className="bb-field-row">
        <label className="bb-field-label">AMOUNT</label>
        <input
          type="number"
          step="0.01"
          className="bb-input"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
        />
      </div>

      <div className="bb-field-row">
        <label className="bb-field-label">CATEGORY</label>
        <select
          className="bb-input"
          value={categoryId}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="">-- PICK --</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bb-field-row">
        <label className="bb-field-label">DAY OF MONTH (1–28)</label>
        <input
          type="number"
          min={1}
          max={28}
          className="bb-input"
          value={day}
          onChange={(e) => onDayChange(e.target.value)}
        />
      </div>

      <div className="bb-field-row">
        <label className="bb-field-label">NOTE</label>
        <input
          type="text"
          className="bb-input"
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="e.g. RENT, NETFLIX"
        />
      </div>

      <button type="submit" className="bb-button-secondary">
        ADD RECURRING
      </button>
    </form>
  );
}

export default BudgetRecurringForm;
