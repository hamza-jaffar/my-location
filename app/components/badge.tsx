function Badge({ label, color }: { label: string; color: "green" | "yellow" | "red" | "blue" | "neutral" }) {
  const colors = {
    green:   "bg-emerald-50 text-emerald-700 border-emerald-200",
    yellow:  "bg-amber-50 text-amber-700 border-amber-200",
    red:     "bg-red-50 text-red-600 border-red-200",
    blue:    "bg-blue-50 text-blue-700 border-blue-200",
    neutral: "bg-neutral-100 text-neutral-600 border-neutral-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${colors[color]}`}>
      {label}
    </span>
  );
}

export default Badge;