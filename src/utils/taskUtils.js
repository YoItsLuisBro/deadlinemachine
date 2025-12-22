import { getTodayISO } from './dateUtils';

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