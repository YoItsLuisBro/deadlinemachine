export function getMonthExpenses(expenses, month) {
  return expenses.filter(
    (e) => typeof e.date === "string" && e.date.startsWith(month)
  );
}

export function analyzeBudget(categories, monthExpenses, monthlyIncome) {
  const totalActual = monthExpenses.reduce(
    (sum, e) => sum + (e.amount || 0),
    0
  );

  const activeCategories = categories.filter((c) => !c.archived);

  const spendByCategory = new Map();
  for (const e of monthExpenses) {
    const current = spendByCategory.get(e.categoryId) || 0;
    spendByCategory.set(e.categoryId, current + (e.amount || 0));
  }

  const rows = activeCategories.map((cat) => {
    const actual = spendByCategory.get(cat.id) || 0;
    const delta = (cat.monthlyBudget || 0) - actual;

    let status;
    if (delta < 0) status = "OVER";
    else if (delta > 0) status = "UNDER";
    else status = "EVEN";

    return { cat, actual, delta, status };
  });

  const totalBudget = activeCategories.reduce(
    (sum, c) => sum + (c.monthlyBudget || 0),
    0
  );

  const budgetLeftover = totalBudget - totalActual;

  let leftover;
  let percentUsed;

  if (typeof monthlyIncome === "number" && monthlyIncome > 0) {
    leftover = monthlyIncome - totalActual;
    percentUsed = Math.round((totalActual / monthlyIncome) * 100);
  } else {
    leftover = budgetLeftover;
    percentUsed =
      totalBudget > 0 ? Math.round((totalActual / totalBudget) * 100) : 0;
  }

  const unallocated =
    typeof monthlyIncome === "number" ? monthlyIncome - totalBudget : 0;

  return {
    rows,
    totalBudget,
    totalActual,
    leftover,
    percentUsed,
    unallocated,
  };
}
