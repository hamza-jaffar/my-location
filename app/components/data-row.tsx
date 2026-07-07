function DataRow({
  label, value, mono = false, onCopy, copied, badge,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
  onCopy?: () => void;
  copied?: boolean;
  badge?: React.ReactNode;
}) {
  if (value === null || value === undefined) return null;
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-neutral-50 last:border-0 group">
      <span className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase min-w-30 pt-0.5 shrink-0">
        {label}
      </span>
      <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
        {badge}
        <span
          className={`text-sm text-neutral-800 font-medium WRAP-break-words text-right leading-snug ${mono ? "font-mono" : ""}`}
          title={value}
        >
          {value}
        </span>
        {onCopy && (
          <button
            onClick={onCopy}
            aria-label={`Copy ${label}`}
            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-neutral-100"
          >
            {copied ? (
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default DataRow;