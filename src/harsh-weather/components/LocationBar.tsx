import { useMemo, useState } from "react";
import { searchLocation, type GeoPick } from "../lib/openMeteo";

export default function LocationBar({
  current,
  onPick,
}: {
  current: GeoPick;
  onPick: (p: GeoPick) => void;
}) {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<GeoPick[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const canSearch = useMemo(() => q.trim().length >= 2 && !busy, [q, busy]);

  async function runSearch() {
    const query = q.trim();
    if (query.length < 2) return;
    setBusy(true);
    setErr(null);
    try {
      const found = await searchLocation(query);
      setResults(found);
      if (!found.length) setErr("NO MATCHES");
    } catch (e) {
      setErr(e instanceof Error ? e.message.toUpperCase() : "SEARCH FAILED");
      setResults([]);
    } finally {
      setBusy(false);
    }
  }

  function pick(p: GeoPick) {
    onPick(p);
    setResults([]);
    setQ("");
    setErr(null);
  }

  return (
    <div className="locBar">
      <div className="locControls">
        <input
          className="locInput"
          placeholder="TYPE A CITY. ENTER."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") runSearch();
          }}
          aria-label="Search city"
        />
        <button
          type="button"
          className="locBtn"
          onClick={runSearch}
          disabled={!canSearch}
        >
          {busy ? "SEARCHING…" : "SEARCH"}
        </button>
        <button
          type="button"
          className="locBtn ghost"
          onClick={() => pick(current)}
          title="Re-apply current location"
        >
          LOCK
        </button>
      </div>

      {err && <div className="locError">{err}</div>}

      {!!results.length && (
        <div className="locResults" role="list">
          {results.map((r) => {
            const label = [r.name, r.admin1, r.country]
              .filter(Boolean)
              .join(", ");
            return (
              <button
                key={`${r.latitude},${r.longitude},${label}`}
                type="button"
                className="locResult"
                onClick={() => pick(r)}
                role="listitem"
              >
                <span className="locResultMain">{label.toUpperCase()}</span>
                <span className="locResultSub">
                  LAT {r.latitude.toFixed(3)} / LON {r.longitude.toFixed(3)}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
