import React, { useState, useEffect, useMemo } from "react";
import TaskColumn from "./components/TaskColumn";
import TimerPanel from "./components/TimerPanel";
import DeleteModal from "./components/DeleteModal";
import AuthPage from "./components/AuthPage";
import UsernameSetup from "./components/UsernameSetup";
import UserMenu from "./components/UserMenu";
import { isOverdue } from "./utils/taskUtils";
import { getTodayISO } from "./utils/dateUtils";
import { supabase } from "./supabaseClient";
import HarshWeatherApp from "./harsh-weather/HarshWeatherApp";

const COLUMNS = [
  { id: "today", label: "TODAY" },
  { id: "week", label: "THIS WEEK" },
  { id: "dump", label: "DUMPING GROUND" },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);

  const [activePanel, setActivePanel] = useState("board"); // 'board' | 'weather'

  // ---- AUTH STATE ----
  useEffect(() => {
    let subscription;

    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Error getting session", error);
      } finally {
        setAuthChecked(true);
      }

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        if (!session) {
          setTasks([]);
          setProfile(null);
        }
      });

      subscription = data.subscription;
    };

    initAuth();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  // ---- PROFILE (USERNAME + EMAIL) ----
  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    let cancelled = false;

    const loadProfile = async () => {
      setProfileLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("username, email")
          .eq("id", user.id)
          .maybeSingle();

        if (cancelled) return;

        // PGRST116 = "No rows found"
        if (error && error.code !== "PGRST116") {
          console.error("Error loading profile", error);
        }

        setProfile(data || null);
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // ---- LOAD TASKS WHEN USER CHANGES ----
  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }

    let cancelled = false;

    const loadTasks = async () => {
      setTasksLoading(true);
      setTasksError("");
      try {
        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });

        if (cancelled) return;

        if (error) {
          console.error("Error loading tasks", error);
          setTasksError("FAILED TO LOAD TASKS FROM MACHINE.");
          setTasks([]);
          return;
        }

        if (data) {
          const normalized = data.map((row) => ({
            id: row.id,
            title: row.title,
            description: row.description || "",
            column: row.lane,
            dueDate: row.due_date,
            createdAt: row.created_at,
            urgent: row.urgent,
            done: row.done,
          }));
          setTasks(normalized);
        }
      } finally {
        if (!cancelled) setTasksLoading(false);
      }
    };

    loadTasks();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // ---- TASK MUTATIONS ----
  const addTask = async (columnId, title, dueDate) => {
    if (!user) return;
    const trimmed = title.trim();
    if (!trimmed) return;

    setTasksError("");

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: user.id,
        title: trimmed,
        description: "",
        lane: columnId,
        due_date: dueDate || null,
        urgent: columnId === "today",
        done: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating task", error);
      setTasksError("FAILED TO CREATE TASK.");
      return;
    }

    const newTask = {
      id: data.id,
      title: data.title,
      description: data.description || "",
      column: data.lane,
      dueDate: data.due_date,
      createdAt: data.created_at,
      urgent: data.urgent,
      done: data.done,
    };

    setTasks((prev) => [...prev, newTask]);
  };

  const moveTask = async (taskId, newColumn) => {
    if (!user) return;

    setTasksError("");

    const { data, error } = await supabase
      .from("tasks")
      .update({
        lane: newColumn,
        urgent: newColumn === "today",
      })
      .eq("id", taskId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error moving task", error);
      setTasksError("FAILED TO MOVE TASK.");
      return;
    }

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, column: data.lane, urgent: data.urgent } : t
      )
    );
  };

  const toggleDone = async (taskId) => {
    if (!user) return;

    setTasksError("");

    const current = tasks.find((t) => t.id === taskId);
    if (!current) return;

    const { data, error } = await supabase
      .from("tasks")
      .update({ done: !current.done })
      .eq("id", taskId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error toggling done", error);
      setTasksError("FAILED TO UPDATE TASK.");
      return;
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, done: data.done } : t))
    );
  };

  const requestDelete = (task) => {
    setPendingDelete(task);
  };

  const confirmDelete = async () => {
    if (!user || !pendingDelete) return;
    const id = pendingDelete.id;

    setTasksError("");

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting task", error);
      setTasksError("FAILED TO DELETE TASK.");
      return;
    }

    setTasks((prev) => prev.filter((t) => t.id !== id));
    setPendingDelete(null);
  };

  const cancelDelete = () => setPendingDelete(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.done).length;
    const overdue = tasks.filter(isOverdue).length;
    return { total, done, overdue };
  }, [tasks]);

  // ---- RENDER GATES ----

  if (!authChecked) {
    return <div className="app-loading">BOOTING DEADLINE MACHINE...</div>;
  }

  if (!user) {
    return <AuthPage />;
  }

  if (!profile && profileLoading) {
    return <div className="app-loading">SYNCING IDENTITY...</div>;
  }

  if (!profile && !profileLoading) {
    return <UsernameSetup user={user} onComplete={setProfile} />;
  }

  // ---- MAIN APP ----
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
          <div className="app-header-user">
            <UserMenu profile={profile} onLogout={handleLogout} />
          </div>
        </div>
      </header>

      {/* NEW: brutalist panel switch */}
      <div className="panel-switch">
        <button
          type="button"
          className={
            activePanel === "board"
              ? "panel-switch-button panel-switch-button-active"
              : "panel-switch-button"
          }
          onClick={() => setActivePanel("board")}
        >
          TASK BOARD
        </button>
        <button
          type="button"
          className={
            activePanel === "weather"
              ? "panel-switch-button panel-switch-button-active"
              : "panel-switch-button"
          }
          onClick={() => setActivePanel("weather")}
        >
          WEATHER
        </button>
      </div>

      {/* CONDITIONAL MAIN CONTENT */}
      {activePanel === "board" ? (
        <main className="app-main">
          <section className="board">
            {tasksLoading && (
              <div className="board-status-strip">
                SYNCING WITH MACHINE STORAGE...
              </div>
            )}
            {tasksError && (
              <div className="board-error-strip">{tasksError}</div>
            )}

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
      ) : (
        <main className="app-main-weather">       
            <HarshWeatherApp />
        </main>
      )}

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
