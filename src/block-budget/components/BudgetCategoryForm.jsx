import React from "react";

function BudgetCategoryForm({
  name,
  budget,
  onNameChange,
  onBudgetChange,
  onSubmit,
  onDumpCsv,
}) {
  return (
    <form className="bb-form bb-form-category" onSubmit={onSubmit}>
      <div className="bb-form-title">ADD CATEGORY</div>

      <div className="bb-field-row">
        <label className="bb-field-label">NAME</label>
        <input
          type="text"
          className="bb-input"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g. TRANSPORT"
        />
      </div>

      <div className="bb-field-row">
        <label className="bb-field-label">MONTHLY BUDGET</label>
        <input
          type="number"
          step="0.01"
          className="bb-input"
          value={budget}
          onChange={(e) => onBudgetChange(e.target.value)}
        />
      </div>

      <button type="submit" className="bb-button-secondary">
        ADD CATEGORY
      </button>

      <button type="button" className="bb-button-dump" onClick={onDumpCsv}>
        DUMP DATA (CSV)
      </button>
    </form>
  );
}

export default BudgetCategoryForm;
