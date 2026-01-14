import React from "react";

function BudgetRecurringList({
  recurringExpenses,
  categories,
  currency,
  onToggleActive,
  onDelete,
}) {
  if (!recurringExpenses || recurringExpenses.length === 0) {
    return (
      <div className="bb-recurring-empty">
        NO RECURRING EXPENSES DEFINED. AUTOMATION = 0.
      </div>
    );
  }

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <table className="bb-table bb-table-recurring">
      <thead>
        <tr>
          <th>DAY</th>
          <th>CATEGORY</th>
          <th>AMOUNT</th>
          <th>NOTE</th>
          <th>STATUS</th>
          <th>ACTIONS</th>
        </tr>
      </thead>
      <tbody>
        {recurringExpenses.map((r) => (
          <tr key={r.id}>
            <td>{r.dayOfMonth}</td>
            <td>{categoryMap.get(r.categoryId) || "UNKNOWN"}</td>
            <td>{currency.format(r.amount || 0)}</td>
            <td>{r.note || "-"}</td>
            <td>
              <span
                className={
                  "bb-tag " + (r.active ? "bb-tag-under" : "bb-tag-even")
                }
              >
                {r.active ? "ACTIVE" : "PAUSED"}
              </span>
            </td>
            <td className="bb-cell-actions">
              <button
                type="button"
                className="bb-action-button"
                onClick={() => onToggleActive(r.id)}
              >
                {r.active ? "PAUSE" : "RESUME"}
              </button>
              <button
                type="button"
                className="bb-action-button bb-action-button-danger"
                onClick={() => onDelete(r.id)}
              >
                DELETE
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default BudgetRecurringList;
