import React, { useEffect, useMemo, useState } from "react";
import "./blockBudget.css";
import { supabase } from "../supabaseClient"; // adjust path if needed
import { getMonthExpenses, analyzeBudget } from "./budgetAnalysis";
import BBHeader from "./components/BBHeader";
import BBSummaryRow from "./components/BBSummaryRow";
import BBTable from "./components/BBTable";
import BudgetExpenseForm from "./components/BudgetExpenseForm";
import BudgetCategoryForm from "./components/BudgetCategoryForm";
import BBArchivedList from "./components/BBArchivedList";
import BudgetRecurringForm from "./components/BudgetRecurringForm";
import BudgetRecurringList from "./components/BudgetRecurringList";

// ---- DB -> UI mappers ----

function mapCategoryFromDb(row) {
  return {
    id: row.id,
    name: row.name,
    monthlyBudget: Number(row.monthly_budget ?? 0),
    archived: !!row.archived,
  };
}

function mapExpenseFromDb(row) {
  return {
    id: row.id,
    categoryId: row.category_id,
    amount: Number(row.amount ?? 0),
    note: row.note || "",
    date: row.date, // "YYYY-MM-DD"
  };
}

function mapRecurringFromDb(row) {
  return {
    id: row.id,
    categoryId: row.category_id,
    amount: Number(row.amount ?? 0),
    note: row.note || "",
    dayOfMonth: row.day_of_month,
    active: !!row.active,
  };
}

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

function getCurrentMonth() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export default function BlockBudgetApp() {
  const [userId, setUserId] = useState(null);

  const [state, setState] = useState({
    categories: [],
    expenses: [],
    recurringExpenses: [],
    monthlyIncome: null,
  });

  const [month, setMonth] = useState(getCurrentMonth());

  // quick expense form
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategoryId, setExpenseCategoryId] = useState("");
  const [expenseNote, setExpenseNote] = useState("");
  const [makeRecurring, setMakeRecurring] = useState(false);

  // add category form
  const [categoryName, setCategoryName] = useState("");
  const [categoryBudget, setCategoryBudget] = useState("");

  // recurring form
  const [recAmount, setRecAmount] = useState("");
  const [recCategoryId, setRecCategoryId] = useState("");
  const [recNote, setRecNote] = useState("");
  const [recDay, setRecDay] = useState("1");

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // ---- INITIAL LOAD FROM SUPABASE ----

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        if (!cancelled) {
          setLoadError("UNABLE TO LOAD USER. LOGIN REQUIRED.");
          setLoading(false);
        }
        return;
      }

      const uid = user.id;

      const [catRes, expRes, recRes, profileRes] = await Promise.all([
        supabase
          .from("blockbudget_categories")
          .select("*")
          .eq("user_id", uid)
          .order("created_at", { ascending: true }),
        supabase
          .from("blockbudget_expenses")
          .select("*")
          .eq("user_id", uid)
          .order("date", { ascending: true }),
        supabase
          .from("blockbudget_recurring")
          .select("*")
          .eq("user_id", uid)
          .order("created_at", { ascending: true }),
        supabase
          .from("blockbudget_profiles")
          .select("monthly_income")
          .eq("user_id", uid)
          .maybeSingle(),
      ]);

      const errors = [
        catRes.error,
        expRes.error,
        recRes.error,
        profileRes.error,
      ].filter(Boolean);

      if (cancelled) return;

      if (errors.length) {
        console.error("BlockBudget load error:", errors[0]);
        setLoadError("FAILED TO LOAD BUDGET DATA.");
        setLoading(false);
        return;
      }

      setUserId(uid);
      setState({
        categories: (catRes.data ?? []).map(mapCategoryFromDb),
        expenses: (expRes.data ?? []).map(mapExpenseFromDb),
        recurringExpenses: (recRes.data ?? []).map(mapRecurringFromDb),
        monthlyIncome:
          profileRes.data && profileRes.data.monthly_income != null
            ? Number(profileRes.data.monthly_income)
            : null,
      });
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  // ---- DERIVED DATA ----

  const monthExpenses = useMemo(
    () =>
      getMonthExpenses(state.expenses, month, state.recurringExpenses || []),
    [state.expenses, state.recurringExpenses, month]
  );

  const analysis = useMemo(
    () => analyzeBudget(state.categories, monthExpenses, state.monthlyIncome),
    [state.categories, monthExpenses, state.monthlyIncome]
  );

  const activeCategories = useMemo(
    () => state.categories.filter((c) => !c.archived),
    [state.categories]
  );

  const archivedCategories = useMemo(
    () => state.categories.filter((c) => c.archived),
    [state.categories]
  );

  const hasIncome =
    typeof state.monthlyIncome === "number" && state.monthlyIncome > 0;

  // ---- HANDLERS ----

  // EXPENSES + "MAKE THIS RECUR" TO SUPABASE
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!userId) return;

    const amount = Number(expenseAmount);
    if (!expenseCategoryId) return;
    if (!Number.isFinite(amount) || amount <= 0) return;

    const today = new Date();
    const date = today.toISOString().slice(0, 10);
    const noteTrimmed = expenseNote.trim();

    // Insert expense
    const { data: inserted, error } = await supabase
      .from("blockbudget_expenses")
      .insert({
        user_id: userId,
        category_id: expenseCategoryId,
        amount,
        note: noteTrimmed,
        date,
      })
      .select()
      .single();

    if (error) {
      console.error("Add expense failed:", error);
      return;
    }

    const mappedExpense = mapExpenseFromDb(inserted);
    let newRecurring = null;

    // If "make recurring", insert recurring rule
    if (makeRecurring) {
      const rawDay = today.getDate();
      const dayOfMonth = Math.min(Math.max(rawDay, 1), 28);

      const { data: recRow, error: recError } = await supabase
        .from("blockbudget_recurring")
        .insert({
          user_id: userId,
          category_id: expenseCategoryId,
          amount,
          note: noteTrimmed,
          day_of_month: dayOfMonth,
          active: true,
        })
        .select()
        .single();

      if (recError) {
        console.error("Add recurring failed:", recError);
      } else if (recRow) {
        newRecurring = mapRecurringFromDb(recRow);
      }
    }

    setState((prev) => ({
      ...prev,
      expenses: [...prev.expenses, mappedExpense],
      recurringExpenses: newRecurring
        ? [...prev.recurringExpenses, newRecurring]
        : prev.recurringExpenses,
    }));

    setExpenseAmount("");
    setExpenseNote("");
    setMakeRecurring(false);
  };

  // CATEGORIES
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!userId) return;

    const name = categoryName.trim().toUpperCase();
    const budget = Number(categoryBudget);
    if (!name) return;
    if (!Number.isFinite(budget) || budget < 0) return;

    const { data, error } = await supabase
      .from("blockbudget_categories")
      .insert({
        user_id: userId,
        name,
        monthly_budget: budget,
        archived: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Add category failed:", error);
      return;
    }

    const newCat = mapCategoryFromDb(data);

    setState((prev) => ({
      ...prev,
      categories: [...prev.categories, newCat],
    }));

    setCategoryName("");
    setCategoryBudget("");

    if (!expenseCategoryId) {
      setExpenseCategoryId(newCat.id);
    }
  };

  const handleUpdateCategory = async (id, patch) => {
    if (!userId) return;

    // Optimistic local update
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) =>
        cat.id === id ? { ...cat, ...patch } : cat
      ),
    }));

    const updates = {};
    if (patch.name != null) updates.name = patch.name;
    if (patch.monthlyBudget != null)
      updates.monthly_budget = patch.monthlyBudget;

    if (Object.keys(updates).length === 0) return;

    const { error } = await supabase
      .from("blockbudget_categories")
      .update(updates)
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Update category failed:", error);
      // You could reload from server here if you want strong consistency
    }
  };

  const handleArchiveCategory = async (id) => {
    if (!userId) return;

    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) =>
        cat.id === id ? { ...cat, archived: true } : cat
      ),
    }));

    if (expenseCategoryId === id) {
      setExpenseCategoryId("");
    }

    const { error } = await supabase
      .from("blockbudget_categories")
      .update({ archived: true })
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Archive category failed:", error);
    }
  };

  const handleUnarchiveCategory = async (id) => {
    if (!userId) return;

    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) =>
        cat.id === id ? { ...cat, archived: false } : cat
      ),
    }));

    const { error } = await supabase
      .from("blockbudget_categories")
      .update({ archived: false })
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Unarchive category failed:", error);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!userId) return;

    const confirmDelete = window.confirm(
      "PERMANENTLY DELETE THIS CATEGORY? EXPENSES WILL BE KEPT BUT SHOWN AS UNKNOWN."
    );
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("blockbudget_categories")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Delete category failed:", error);
      return;
    }

    setState((prev) => ({
      ...prev,
      categories: prev.categories.filter((cat) => cat.id !== id),
    }));

    if (expenseCategoryId === id) {
      setExpenseCategoryId("");
    }
  };

  // RECURRING

  const handleAddRecurring = async (e) => {
    e.preventDefault();
    if (!userId) return;

    const amount = Number(recAmount);
    const dayNum = Number(recDay);
    if (!recCategoryId) return;
    if (!Number.isFinite(amount) || amount <= 0) return;
    if (!Number.isFinite(dayNum) || dayNum < 1 || dayNum > 28) return;

    const trimmedNote = recNote.trim();

    const { data, error } = await supabase
      .from("blockbudget_recurring")
      .insert({
        user_id: userId,
        category_id: recCategoryId,
        amount,
        note: trimmedNote,
        day_of_month: dayNum,
        active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Add recurring failed:", error);
      return;
    }

    const newRec = mapRecurringFromDb(data);

    setState((prev) => ({
      ...prev,
      recurringExpenses: [...prev.recurringExpenses, newRec],
    }));

    setRecAmount("");
    setRecNote("");
    setRecDay("1");
  };

  const handleToggleRecurringActive = async (id) => {
    if (!userId) return;

    const rec = state.recurringExpenses.find((r) => r.id === id);
    if (!rec) return;

    const newActive = !rec.active;

    setState((prev) => ({
      ...prev,
      recurringExpenses: prev.recurringExpenses.map((r) =>
        r.id === id ? { ...r, active: newActive } : r
      ),
    }));

    const { error } = await supabase
      .from("blockbudget_recurring")
      .update({ active: newActive })
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Toggle recurring failed:", error);
    }
  };

  const handleDeleteRecurring = async (id) => {
    if (!userId) return;

    const { error } = await supabase
      .from("blockbudget_recurring")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Delete recurring failed:", error);
      return;
    }

    setState((prev) => ({
      ...prev,
      recurringExpenses: prev.recurringExpenses.filter((r) => r.id !== id),
    }));
  };

  // CSV EXPORT (still only raw expenses, not generated recurring)
  const handleDumpCsv = () => {
    const headers = ["date", "category", "amount", "note"];
    const lines = [headers.join(",")];

    for (const e of state.expenses) {
      const cat =
        state.categories.find((c) => c.id === e.categoryId)?.name || "UNKNOWN";
      const cells = [
        e.date,
        cat,
        (e.amount ?? 0).toFixed(2),
        String(e.note || "").replace(/"/g, '""'),
      ];
      lines.push(cells.join(","));
    }

    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "blockbudget.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // MONTHLY INCOME

  const handleMonthlyIncomeChange = async (rawValue) => {
    if (!userId) return;

    const value = rawValue.trim();
    if (value === "") {
      setState((prev) => ({ ...prev, monthlyIncome: null }));
      const { error } = await supabase
        .from("blockbudget_profiles")
        .upsert({ user_id: userId, monthly_income: null });
      if (error) {
        console.error("Update monthly income failed:", error);
      }
      return;
    }

    const num = Number(value);
    if (!Number.isFinite(num) || num < 0) return;

    setState((prev) => ({ ...prev, monthlyIncome: num }));

    const { error } = await supabase
      .from("blockbudget_profiles")
      .upsert({ user_id: userId, monthly_income: num });
    if (error) {
      console.error("Update monthly income failed:", error);
    }
  };

  // ---- LOADING / ERROR STATES ----

  if (loading) {
    return (
      <div className="bb-root">
        <div className="bb-loading-strip">
          LOADING BUDGET DATA FROM MACHINE STORAGE...
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="bb-root">
        <div className="bb-error-strip">{loadError}</div>
      </div>
    );
  }

  // ---- RENDER ----

  return (
    <div className="bb-root">
      <BBHeader month={month} onMonthChange={setMonth} />

      {/* Monthly income / budgeted / unallocated */}
      <section className="bb-income-row">
        <div className="bb-income-col">
          <div className="bb-income-label">MONTHLY INCOME</div>
          <input
            type="number"
            step="0.01"
            className="bb-income-input"
            value={state.monthlyIncome ?? ""}
            onChange={(e) => handleMonthlyIncomeChange(e.target.value)}
            placeholder="e.g. 3200"
          />
        </div>
        <div className="bb-income-col">
          <div className="bb-income-label">BUDGETED</div>
          <div className="bb-income-value">
            {currency.format(analysis.totalBudget)}
          </div>
        </div>
        <div className="bb-income-col">
          <div className="bb-income-label">UNALLOCATED</div>
          <div
            className={
              "bb-income-value " +
              (analysis.unallocated < 0
                ? "bb-summary-neg"
                : analysis.unallocated > 0
                ? "bb-summary-pos"
                : "")
            }
          >
            {currency.format(analysis.unallocated)}
          </div>
        </div>
      </section>

      <BBSummaryRow
        totalActual={analysis.totalActual}
        leftover={analysis.leftover}
        percentUsed={analysis.percentUsed}
        currency={currency}
        hasIncome={hasIncome}
      />

      <section className="bb-table-section">
        <div className="bb-table-title">
          CATEGORIES / BUDGET / ACTUAL / DELTA
        </div>
        <BBTable
          rows={analysis.rows}
          currency={currency}
          onUpdateCategory={handleUpdateCategory}
          onArchiveCategory={handleArchiveCategory}
          onDeleteCategory={handleDeleteCategory}
        />
      </section>

      <BBArchivedList
        categories={archivedCategories}
        currency={currency}
        onUnarchive={handleUnarchiveCategory}
        onDelete={handleDeleteCategory}
      />

      <section className="bb-forms-row">
        <BudgetExpenseForm
          categories={activeCategories}
          amount={expenseAmount}
          categoryId={expenseCategoryId}
          note={expenseNote}
          makeRecurring={makeRecurring}
          onAmountChange={setExpenseAmount}
          onCategoryChange={setExpenseCategoryId}
          onNoteChange={setExpenseNote}
          onMakeRecurringChange={setMakeRecurring}
          onSubmit={handleAddExpense}
        />

        <BudgetCategoryForm
          name={categoryName}
          budget={categoryBudget}
          onNameChange={setCategoryName}
          onBudgetChange={setCategoryBudget}
          onSubmit={handleAddCategory}
          onDumpCsv={handleDumpCsv}
        />
      </section>

      <section className="bb-recurring-panel">
        <div className="bb-recurring-title">RECURRING EXPENSES</div>
        <div className="bb-recurring-layout">
          <div className="bb-recurring-list-wrap">
            <BudgetRecurringList
              recurringExpenses={state.recurringExpenses || []}
              categories={activeCategories}
              currency={currency}
              onToggleActive={handleToggleRecurringActive}
              onDelete={handleDeleteRecurring}
            />
          </div>
          <div className="bb-recurring-form-wrap">
            <BudgetRecurringForm
              categories={activeCategories}
              amount={recAmount}
              categoryId={recCategoryId}
              note={recNote}
              day={recDay}
              onAmountChange={setRecAmount}
              onCategoryChange={setRecCategoryId}
              onNoteChange={setRecNote}
              onDayChange={setRecDay}
              onSubmit={handleAddRecurring}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
