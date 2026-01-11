import type { WeatherBundle } from "../lib/openMeteo";
import { weatherWordFromCode } from "../lib/wmo";

type Status = "idle" | "loading" | "success" | "error";

function uniq(arr: string[]) {
  return Array.from(new Set(arr));
}

export default function WarningStrip({
  brutalMode,
  status,
  error,
  data,
}: {
  brutalMode: boolean;
  status: Status;
  error: string | null;
  data: WeatherBundle | null;
}) {
  if (!brutalMode) return null;

  if (status === "error") {
    return (
      <div className="warnStrip">
        <div className="warnBig">SIGNAL LOST</div>
        <div className="warnSmall">
          {(error ?? "UKNOWN FAILURE").toUpperCase()}
        </div>
      </div>
    );
  }

  const today = data?.daily?.[0];
  const current = data?.current;

  if (!today) return null;

  const warnings: string[] = [];

  if ((today.uv_index_max ?? 0) >= 8) warnings.push("UV IS HOSTILE");
  if ((today.wind_speed_10m_max ?? 0) >= 45)
    warnings.push("WIND WILL ARGUE WITH YOUR FACE");
  if ((today.precip_probability_max ?? 0) >= 70)
    warnings.push("WATER INCOMING");
  if ((today.precip_sum ?? 0) >= 12) warnings.push("SOAK EVENT");
  if (today.tmax >= 32) warnings.push("HEAT WARNING");
  if (today.tmin <= -2) warnings.push("FREEZE WARNING");

  const word = weatherWordFromCode(current?.weather_code ?? today.weather_code);
  if (word === "STORM") warnings.push("SKY IS ANGRY");

  const out = uniq(warnings);
  if (!out.length) {
    return (
      <div className="warnStrip">
        <div className="warnBig">NO DRAMA DETECTED</div>
        <div className="warnSmall">BRUTAL MODE STILL WATCHING</div>
      </div>
    );
  }

  return (
    <div className="warnStrip">
      <div className="warnBig">WARNING</div>
      <div className="warnSmall">{out.join(" // ")}</div>
    </div>
  );
}
