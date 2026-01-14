import React from "react";

function BBArchivedList({ categories, currency, onUnarchive, onDelete }) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="bb-archived-section">
      <div className="bb-archived-title">ARCHIVED CATEGORIES</div>

      <table className="bb-table bb-table-archived">
        <thead>
          <tr>
            <th>CATEGORY</th>
            <th>BUDGET</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id}>
              <td>{cat.name}</td>
              <td>{currency.format(cat.monthlyBudget || 0)}</td>
              <td className="bb-cell-actions">
                <button
                  type="button"
                  className="bb-action-button"
                  onClick={() => onUnarchive(cat.id)}
                >
                  UNARCHIVE
                </button>
                <button
                  type="button"
                  className="bb-action-button bb-action-button-danger"
                  onClick={() => onDelete(cat.id)}
                >
                  DELETE
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="bb-archived-note">
        {categories.length} ARCHIVED CATEGORIES. THESE DO NOT COUNT TOWARD
        BUDGET TOTALS.
      </div>
    </section>
  );
}

export default BBArchivedList;
