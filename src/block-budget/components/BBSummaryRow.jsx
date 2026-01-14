import React from "react";

function BBSummaryRow({
  totalActual,
  leftover,
  percentUsed,
  currency,
  hasIncome,
}) {
  const leftoverClass =
    leftover < 0
      ? "bb-summary-value bb-summary-neg"
      : leftover > 0
      ? "bb-summary-value bb-summary-pos"
      : "bb-summary-value";

  const leftoverLabel = hasIncome ? "LEFTOVER (INCOME)" : "LEFTOVER (BUDGET)";

  return (
    <section className="bb-summary-row">
      <div className="bb-summary-slab">
        <div className="bb-summary-label">TOTAL SPENT</div>
        <div className="bb-summary-value">{currency.format(totalActual)}</div>
      </div>

      <div className="bb-summary-slab">
        <div className="bb-summary-label">{leftoverLabel}</div>
        <div className={leftoverClass}>{currency.format(leftover)}</div>
      </div>

      <div className="bb-summary-slab">
        <div className="bb-summary-label">% USED</div>
        <div className="bb-summary-value">{percentUsed}%</div>
      </div>
    </section>
  );
}

export default BBSummaryRow;
