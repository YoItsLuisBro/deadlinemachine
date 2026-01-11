import { useEffect, useMemo, useState } from "react";
import './HarshWeather.css';
import LocationBar from "./components/LocationBar";
import TodayPanel from "./components/TodayPanel";
import ForecastGrid from "./components/ForecastGrid";
import UnitSwitch from "./components/UnitSwitch";
import BrutalModeSwitch from "./components/BrutalModeSwitch";
import WarningStrip from "./components/WarningStrip";
import { useWeather } from "./hooks/useWeather";
import { GeoPick } from "./lib/openMeteo";
import { reverseGeocode } from "./lib/reverseGeocode";


type Unit = "C" | "F";

const DEFAULT_LOCATION: GeoPick = {
  name: "New York",
  country: "US",
  admin1: "New York",
  latitude: 40.7128,
  longitude: -74.0006,
};

function loadBool(key: string, fallback: boolean) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return raw === "true";
  } catch {
    return fallback;
  }
}

function loadUnit(): Unit {
  try {
    const raw = localStorage.getItem("hw_unit");
    return raw === "F" ? "F" : "C";
  } catch {
    return "C";
  }
}

export default function HarshWeatherApp() {
  const [unit, setUnit] = useState<Unit>(loadUnit());
  const [brutalMode, setBrutalMode] = useState<boolean>(
    loadBool("hw_brutal", false)
  );
  const [location, setLocation] = useState<GeoPick>(DEFAULT_LOCATION);

  useEffect(() => {
    try {
      localStorage.setItem("hw_unit", unit);
      localStorage.setItem("hw_brutal", String(brutalMode));
    } catch {
      // ignore
    }
  }, [unit, brutalMode]);

  // Try GPS once (soft attempt); if denied, app still works
  useEffect(() => {
    let cancelled = false;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;

        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        // show something immediately
        setLocation({
          name: "GPS FIX",
          country: "",
          admin1: "",
          latitude: lat,
          longitude: lon,
        });

        // then resolve to a real place name
        (async () => {
          try {
            const place = await reverseGeocode(lat, lon);
            if (cancelled) return;

            setLocation({
              ...place,
              latitude: lat,
              longitude: lon,
            });
          } catch {
            // keep "GPS FIX" if reverse lookup fails
          }
        })();
      },
      () => {
        // denied/unavailable: keep default location
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 }
    );

    return () => {
      cancelled = true;
    };
  }, []);

  const { status, data, error, refreshedAt } = useWeather(
    location.latitude,
    location.longitude
  );

  const headerLocation = useMemo(() => {
    const parts = [location.name, location.admin1, location.country].filter(
      Boolean
    );
    return parts.join(", ").toUpperCase();
  }, [location]);

  return (
    <div className="hw-root">
      <div className="shell">
        <header className="topbar">
          <div className="brand">
            <div className="brandTitle">HARSH WEATHER</div>
            <div className="brandSub">COLD DATA TERMINAL // FORECAST GRID</div>
          </div>

          <div className="controls">
            <UnitSwitch unit={unit} onChange={setUnit} />
            <BrutalModeSwitch enabled={brutalMode} onChange={setBrutalMode} />
          </div>
        </header>

        <section className="panel">
          <div className="panelRow">
            <div className="statusBlock">
              <div className="statusLabel">LOCATION</div>
              <div className="statusValue">{headerLocation || "UNKNOWN"}</div>
            </div>

            <div className="statusBlock">
              <div className="statusLabel">LINK</div>
              <div className="statusValue">
                {status === "loading"
                  ? "PULLING..."
                  : status === "error"
                  ? "BROKEN"
                  : "LIVE"}
              </div>
            </div>

            <div className="statusBlock">
              <div className="statusLabel">REFRESH</div>
              <div className="statusValue">
                {refreshedAt ? new Date(refreshedAt).toLocaleDateString() : "-"}
              </div>
            </div>
          </div>

          <LocationBar current={location} onPick={setLocation} />
        </section>

        <main className="main">
          <WarningStrip
            brutalMode={brutalMode}
            status={status}
            error={error}
            data={data}
          />
          <TodayPanel unit={unit} status={status} data={data} />
          <ForecastGrid unit={unit} status={status} data={data} />
        </main>

        <footer className="footer">
          <span>DATA: OPEN-METEO</span>
          <span className="dot">•</span>
          <span>NO ICONS. ONLY WORDS.</span>
          <span className="dot">•</span>
          <span>NO GRADIENTS. ONLY TRUTH.</span>
          <span className="dot">•</span>
          <span>&copy; CYBER HEAVEN LLC</span>
        </footer>
      </div>
    </div>
  );
}
