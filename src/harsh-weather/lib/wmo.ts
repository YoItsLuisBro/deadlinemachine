// Open-Meteo uses WMO weather codes. We collapse them into terminal-words.
export function weatherWordFromCode(code: number): string {
  if (code === 0) return "SUN";
  if ([1, 2].includes(code)) return "CLEAR";
  if (code === 3) return "CLOUD";
  if ([45, 48].includes(code)) return "FOG";

  if ([51, 53, 55, 56, 57].includes(code)) return "DRIZZLE";
  if ([61, 63, 65, 66, 67].includes(code)) return "RAIN";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "SNOW";
  if ([80, 81, 82].includes(code)) return "SHOWERS";
  if ([95, 96, 99].includes(code)) return "STORM";

  return "UNKNOWN";
}
