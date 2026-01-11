export default function BrutalModeSwitch({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      className={`brutalBtn ${enabled ? "armed" : ""}`}
      onClick={() => onChange(!enabled)}
      aria-pressed={enabled}
      title="Toggle BRUTAL MODE"
    >
      {enabled ? "BRUTAL MODE: ON" : "BRUTAL MODE: OFF"}
    </button>
  );
}
