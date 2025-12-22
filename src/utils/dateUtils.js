export function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function getInDaysISO(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
