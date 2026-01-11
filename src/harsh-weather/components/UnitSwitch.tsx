type Unit = "C" | "F";

export default function UnitSwitch({
  unit,
  onChange,
}: {
  unit: Unit;
  onChange: (u: Unit) => void;
}) {
  return (
    <div className="switch" role="group" aria-label="Temperature unit">
      <button
        className={`switchBtn ${unit === "C" ? "on" : ""}`}
        onClick={() => onChange("C")}
      >
        °C
      </button>
      <button
        className={`switchBtn ${unit === "F" ? "on" : ""}`}
        onClick={() => onChange("F")}
        type="button"
      >
        °F
      </button>
    </div>
  );
}
