import React, { useState, useEffect, useMemo } from "react";
import TaskColumn from "./components/TaskColumn";
import TimerPanel from "./components/TimerPanel";
import DeleteModal from "./components/DeleteModal";
import { loadInitialTasks, isOverdue } from "./utils/taskUtils";
import { getTodayISO } from "./utils/dateUtils";

const COLUMNS = [
  { id: "today", label: "TODAY" },
  { id: "week", label: "THIS WEEK" },
  { id: "dump", label: "DUMPING GROUND" },
];

function App() {
  const [tasks, setTasks] = useState(loadInitialTasks);
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        "deadline-machine-tasks-v1",
        JSON.stringify(tasks)
      );
    } catch (e) {
      console.warn("Failed to save tasks", e);
    }
  }, [tasks]);

  const addTask = (columnId, title, dueDate) => {
    const trimmed = title.trim();
    if (!trimmed) return;

    const newTask = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title: trimmed,
      description: "",
      column: columnId,
      dueDate: dueDate || null,
      createdAt: new Date().toISOString(),
      urgent: columnId === "today",
      done: false,
    };

    setTasks((prev) => [...prev, newTask]);
  };

  const moveTask = (taskId, newColumn) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, column: newColumn } : t))
    );
  };

  const toggleDone = (taskId) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t))
    );
  };

  const requestDelete = (task) => {
    setPendingDelete(task);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setPendingDelete(null);
  };

  const cancelDelete = () => setPendingDelete(null);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.done).length;
    const overdue = tasks.filter(isOverdue).length;
    return { total, done, overdue };
  }, [tasks]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title-block">
          <div className="app-title">DEADLINE MACHINE</div>
          <div className="app-subtitle">TASK &amp; FOCUS BOARD</div>
        </div>
        <div className="app-header-meta">
          <div className="meta-chip meta-chip-warning">
            OVERDUE: {stats.overdue}
          </div>
          <div className="meta-chip">
            DONE: {stats.done}/{stats.total}
          </div>
          <div className="meta-chip meta-chip-date">{getTodayISO()}</div>
        </div>
      </header>

      <main className="app-main">
        <section className="board">
          {COLUMNS.map((col) => (
            <TaskColumn
              key={col.id}
              column={col}
              tasks={tasks.filter((t) => t.column === col.id)}
              onAddTask={addTask}
              onMoveTask={moveTask}
              onToggleDone={toggleDone}
              onRequestDelete={requestDelete}
            />
          ))}
        </section>

        <aside className="timer-panel-wrapper">
          <TimerPanel />
        </aside>
      </main>

      {pendingDelete && (
        <DeleteModal
          task={pendingDelete}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
}

export default App;
