type Unit = "C" | "F";

export function toF(c: number) {
  return c * (9 / 5) + 32;
}

export function toDisplayTemp(c: number, unit: Unit) {
  const v = unit === "F" ? toF(c) : c;
  const rounded = Math.round(v);
  // keep the UI brutal: integer temps only
  return String(rounded);
}

export function windLabel(kmh: number) {
  if (kmh >= 60) return "VIOLENT";
  if (kmh >= 40) return "HARD";
  if (kmh >= 20) return "BREEZE";
  return "CALM";
}
