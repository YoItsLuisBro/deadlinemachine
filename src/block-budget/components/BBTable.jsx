import React, { useState } from "react";

export default function BBTable({
  rows,
  currency,
  onUpdateCategory,
  onArchiveCategory,
  onDeleteCategory,
}) {
  const [editing, setEditing] = useState({
    id: null,
    field: null, // "name" | "budget" | null
    value: "",
  });

  const startEdit = (row, field) => {
    const initialValue =
      field === "name"
        ? row.cat.name || ""
        : String(row.cat.monthlyBudget ?? 0);
    setEditing({
      id: row.cat.id,
      field,
      value: initialValue,
    });
  };

  const cancelEdit = () => {
    setEditing({ id: null, field: null, value: "" });
  };

  const commitEdit = (row) => {
    if (!editing.id || editing.id !== row.cat.id || !editing.field) {
      cancelEdit();
      return;
    }

    const raw = editing.value.trim();

    if (editing.field === "name") {
      if (!raw) {
        cancelEdit();
        return;
      }
      onUpdateCategory(row.cat.id, { name: raw.toUpperCase() });
    } else if (editing.field === "budget") {
      if (raw === "") {
        cancelEdit();
        return;
      }
      const num = Number(raw);
      if (!Number.isFinite(num) || num < 0) {
        // bad input: just ignore but stay editing
        return;
      }
      onUpdateCategory(row.cat.id, { monthlyBudget: num });
    }

    cancelEdit();
  };

  const handleKeyDown = (e, row) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitEdit(row);
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    }
  };

  return (
    <table className="bb-table">
      <thead>
        <tr>
          <th>CATEGORY</th>
          <th>BUDGET</th>
          <th>ACTUAL</th>
          <th>DELTA</th>
          <th>STATUS</th>
          <th>ACTIONS</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td colSpan={6} className="bb-empty">
              NO CATEGORIES YET. DEFINE YOUR CONSTRAINTS.
            </td>
          </tr>
        )}

        {rows.map((row) => {
          const isEditingName =
            editing.id === row.cat.id && editing.field === "name";
          const isEditingBudget =
            editing.id === row.cat.id && editing.field === "budget";

          return (
            <tr key={row.cat.id}>
              {/* CATEGORY (editable) */}
              <td
                className="bb-cell-editable"
                onDoubleClick={() => startEdit(row, "name")}
              >
                {isEditingName ? (
                  <input
                    className="bb-input-inline"
                    value={editing.value}
                    onChange={(e) =>
                      setEditing((prev) => ({
                        ...prev,
                        value: e.target.value,
                      }))
                    }
                    onBlur={() => commitEdit(row)}
                    onKeyDown={(e) => handleKeyDown(e, row)}
                    autoFocus
                  />
                ) : (
                  row.cat.name
                )}
              </td>

              {/* BUDGET (editable) */}
              <td
                className="bb-cell-editable"
                onDoubleClick={() => startEdit(row, "budget")}
              >
                {isEditingBudget ? (
                  <input
                    className="bb-input-inline"
                    value={editing.value}
                    onChange={(e) =>
                      setEditing((prev) => ({
                        ...prev,
                        value: e.target.value,
                      }))
                    }
                    onBlur={() => commitEdit(row)}
                    onKeyDown={(e) => handleKeyDown(e, row)}
                    autoFocus
                  />
                ) : (
                  currency.format(row.cat.monthlyBudget || 0)
                )}
              </td>

              {/* ACTUAL */}
              <td>{currency.format(row.actual)}</td>

              {/* DELTA */}
              <td className={row.delta < 0 ? "bb-cell-neg" : "bb-cell-pos"}>
                {currency.format(row.delta)}
              </td>

              {/* STATUS */}
              <td>
                {row.status === "OVER" && (
                  <span className="bb-tag bb-tag-over">OVER</span>
                )}
                {row.status === "UNDER" && (
                  <span className="bb-tag bb-tag-under">UNDER</span>
                )}
                {row.status === "EVEN" && (
                  <span className="bb-tag bb-tag-even">EXACT</span>
                )}
              </td>

              {/* ACTIONS */}
              <td className="bb-cell-actions">
                <button
                  type="button"
                  className="bb-action-button"
                  onClick={() => onArchiveCategory(row.cat.id)}
                >
                  ARCHIVE
                </button>
                <button
                  type="button"
                  className="bb-action-button bb-action-button-danger"
                  onClick={() => onDeleteCategory(row.cat.id)}
                >
                  DELETE
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

