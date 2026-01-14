import React from "react";

function BudgetExpenseForm({
  categories,
  amount,
  categoryId,
  note,
  makeRecurring,
  onAmountChange,
  onCategoryChange,
  onNoteChange,
  onMakeRecurringChange,
  onSubmit,
}) {
  return (
    <form className="bb-form bb-form-expense" onSubmit={onSubmit}>
      <div className="bb-form-title">QUICK ADD EXPENSE</div>

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
        <label className="bb-field-label">NOTE</label>
        <input
          type="text"
          className="bb-input"
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="optional description"
        />
      </div>

      <div className="bb-field-row bb-field-row-inline">
        <label className="bb-field-label">
          <input
            type="checkbox"
            className="bb-input-checkbox"
            checked={makeRecurring}
            onChange={(e) => onMakeRecurringChange(e.target.checked)}
          />{" "}
          MAKE THIS RECUR MONTHLY
        </label>
      </div>

      <button type="submit" className="bb-button-primary">
        RECORD EXPENSE
      </button>
    </form>
  );
}

export default BudgetExpenseForm;
