import { useMemo } from "react";
import type { WeatherBundle } from "../lib/openMeteo";
import { toDisplayTemp, windLabel } from "../lib/units";
import { weatherWordFromCode } from "../lib/wmo";

type Unit = "C" | "F";
type Status = "idle" | "loading" | "success" | "error";

function tinyBadge(text: string) {
  return <span className="tinyBadge">{text}</span>;
}

export default function TodayPanel({
  unit,
  status,
  data
}: {
  unit: Unit;
  status: Status;
  data: WeatherBundle | null;
}) {
  const today = data?.daily?.[0] ?? null;
  const current = data?.current ?? null;

  const weatherWord = useMemo(() => {
    const code = current?.weather_code ?? today?.weather_code ?? null;
    return code == null ? "UNKNOWN" : weatherWordFromCode(code);
  }, [current?.weather_code, today?.weather_code]);

  const wetDry = useMemo(() => {
    const p = today?.precip_probability_max ?? 0;
    return p >= 50 ? "WET" : "DRY";
  }, [today?.precip_probability_max]);

  const hotCold = useMemo(() => {
    // thresholds in °C
    const tC = current?.temperature_2m ?? (today ? (today.tmax + today.tmin) / 2 : null);
    if (tC == null) return "—";
    if (tC >= 30) return "HOT";
    if (tC <= 0) return "COLD";
    return "MILD";
  }, [current?.temperature_2m, today]);

  if (status === "loading" && !data) {
    return (
      <section className="today">
        <div className="todayTitle">TODAY</div>
        <div className="todayBig">…</div>
        <div className="todayMeta">PULLING SIGNAL</div>
      </section>
    );
  }

  if (!data || !today) {
    return (
      <section className="today">
        <div className="todayTitle">TODAY</div>
        <div className="todayBig">—</div>
        <div className="todayMeta">NO DATA</div>
      </section>
    );
  }

  const temp = current?.temperature_2m ?? (today.tmax + today.tmin) / 2;
  const feels = current?.apparent_temperature ?? temp;

  const wind = current?.wind_speed_10m ?? today.wind_speed_10m_max ?? 0;
  const precip = today.precip_probability_max ?? 0;

  return (
    <section className="today">
      <div className="todayTop">
        <div className="todayTitle">TODAY</div>
        <div className="todayBadges">
          {tinyBadge(weatherWord)}
          {tinyBadge(wetDry)}
          {tinyBadge(hotCold)}
        </div>
      </div>

      <div className="todayBig">
        {toDisplayTemp(temp, unit)}
        <span className="todayUnit">{unit}</span>
      </div>

      <div className="todayMeta">
        <div className="kv">
          <div className="k">FEELS</div>
          <div className="v">{toDisplayTemp(feels, unit)} {unit}</div>
        </div>
        <div className="kv">
          <div className="k">WIND</div>
          <div className="v">{wind.toFixed(0)} km/h ({windLabel(wind)})</div>
        </div>
        <div className="kv">
          <div className="k">RAIN CHANCE</div>
          <div className="v">{precip.toFixed(0)}%</div>
        </div>
        <div className="kv">
          <div className="k">RANGE</div>
          <div className="v">
            {toDisplayTemp(today.tmin, unit)}–{toDisplayTemp(today.tmax, unit)} {unit}
          </div>
        </div>
      </div>
    </section>
  );
}
