import { getTodayISO, getInDaysISO } from "./dateUtils";

const STORAGE_KEY = "deadline-machine-tasks-v1";

export function loadInitialTasks() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn("Failed to parse saved tasks", e);
  }

  const today = getTodayISO();
  const inThree = getInDaysISO(3);

  return [
    {
      id: "seed-1",
      title: "Ship something ugly but working",
      description: "No polish. Just output.",
      column: "today",
      dueDate: today,
      createdAt: new Date().toISOString(),
      urgent: true,
      done: false,
    },
    {
      id: "seed-2",
      title: "Plan this week's real deadlines",
      description: "No fantasy tasks.",
      column: "week",
      dueDate: inThree,
      createdAt: new Date().toISOString(),
      urgent: false,
      done: false,
    },
    {
      id: "seed-3",
      title: "Random ideas you will probably ignore",
      description: "",
      column: "dump",
      dueDate: null,
      createdAt: new Date().toISOString(),
      urgent: false,
      done: false,
    },
  ];
}

export function isOverdue(task) {
  if (!task.dueDate || task.done) return false;
  const today = getTodayISO();
  return task.dueDate < today;
}

export function isDueToday(task) {
  if (!task.dueDate || task.done) return false;
  const today = getTodayISO();
  return task.dueDate === today;
}
