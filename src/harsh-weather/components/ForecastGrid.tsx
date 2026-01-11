import type { WeatherBundle } from "../lib/openMeteo";
import { toDisplayTemp } from "../lib/units";
import { weatherWordFromCode } from "../lib/wmo";

type Unit = "C" | "F";
type Status = "idle" | "loading" | "success" | "error";

function fmtDay(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return new Intl.DateTimeFormat(undefined, { weekday: "short" })
    .format(d)
    .toUpperCase();
}
function fmtMD(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return new Intl.DateTimeFormat(undefined, {
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export default function ForecastGrid({
  unit,
  status,
  data,
}: {
  unit: Unit;
  status: Status;
  data: WeatherBundle | null;
}) {
  const days = data?.daily ?? [];

  return (
    <section className="gridWrap">
      <div className="gridTitle">TODAY + 5 DAYS</div>

      <div className={`grid ${status === "loading" && !data ? "dim" : ""}`}>
        {Array.from({ length: 6 }).map((_, i) => {
          const d = days[i];
          const empty = !d;

          const word = d ? weatherWordFromCode(d.weather_code) : "—";
          const wet = d
            ? d.precip_probability_max >= 50
              ? "WET"
              : "DRY"
            : "—";

          return (
            <div className="col" key={i}>
              <div className="colHead">
                <div className="colDay">{d ? fmtDay(d.date) : "—"}</div>
                <div className="colDate">{d ? fmtMD(d.date) : "—"}</div>
              </div>

              <div className="colWord">{word}</div>

              <div className="colRow">
                <span className="chip">{wet}</span>
                <span className="chip">
                  {d ? `${d.precip_probability_max.toFixed(0)}%` : "—"}
                </span>
              </div>

              <div className="colTemps">
                <div className="tMax">
                  <div className="tLab">MAX</div>
                  <div className="tVal">
                    {empty ? "—" : `${toDisplayTemp(d.tmax, unit)}${unit}`}
                  </div>
                </div>
                <div className="tMin">
                  <div className="tLab">MIN</div>
                  <div className="tVal">
                    {empty ? "—" : `${toDisplayTemp(d.tmin, unit)}${unit}`}
                  </div>
                </div>
              </div>

              <div className="colMeta">
                <div className="metaRow">
                  <span className="metaK">WIND</span>
                  <span className="metaV">
                    {empty ? "—" : `${d.wind_speed_10m_max.toFixed(0)} km/h`}
                  </span>
                </div>
                <div className="metaRow">
                  <span className="metaK">UV</span>
                  <span className="metaV">
                    {empty ? "—" : `${d.uv_index_max.toFixed(1)}`}
                  </span>
                </div>
                <div className="metaRow">
                  <span className="metaK">MM</span>
                  <span className="metaV">
                    {empty ? "—" : `${d.precip_sum.toFixed(1)}`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
