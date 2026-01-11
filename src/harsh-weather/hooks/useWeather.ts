import { useEffect, useRef, useState } from "react";
import { fetchForecast, type WeatherBundle } from "../lib/openMeteo";

type Status = "idle" | "loading" | "success" | "error";

export function useWeather(lat: number, lon: number) {
  const [status, setStatus] = useState<Status>("idle");
  const [data, setData] = useState<WeatherBundle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<number | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let mounted = true;
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setStatus(data ? "loading" : "loading");
    setError(null);

    (async () => {
      try {
        const bundle = await fetchForecast(lat, lon, ac.signal);

        if (!mounted) return;
        setData(bundle);
        setStatus("success");
        setRefreshedAt(Date.now());

        try {
          localStorage.setItem(
            "hw_cache",
            JSON.stringify({ t: Date.now(), bundle })
          );
        } catch {
          // ignore
        }
      } catch (e) {
        if (!mounted) return;
        if (ac.signal.aborted) return;

        const msg = e instanceof Error ? e.message : "Fetch failed";
        setError(msg);
        setStatus("error");

        // Try cache
        try {
          const raw = localStorage.getItem("hw_cache");
          if (raw) {
            const parsed = JSON.parse(raw) as {
              t: number;
              bundle: WeatherBundle;
            };
            setData(parsed.bundle);
          }
        } catch {
          // ignore
        }
      }
    })();

    return () => {
      mounted = false;
      ac.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lon]);

  return { status, data, error, refreshedAt };
}
