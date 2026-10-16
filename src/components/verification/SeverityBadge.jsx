const SEVERITY_STYLES = {
  High: "bg-red-600 text-white",
  Medium: "bg-amber-400 text-amber-950",
  Low: "bg-zinc-200 text-zinc-800",
};

export default function SeverityBadge({ severity }) {
  if (!severity) return null;
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${
        SEVERITY_STYLES[severity] || SEVERITY_STYLES.Low
      }`}
    >
      {severity}
    </span>
  );
}
