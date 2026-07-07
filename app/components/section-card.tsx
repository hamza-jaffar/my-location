export function SectionCard({
  icon, title, children, accent = "neutral",
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  accent?: "blue" | "violet" | "emerald" | "amber" | "neutral";
}) {
  const styles = {
    blue:    { wrap: "border-blue-100",    grad: "from-blue-500/10",    icon: "text-blue-600" },
    violet:  { wrap: "border-violet-100",  grad: "from-violet-500/10",  icon: "text-violet-600" },
    emerald: { wrap: "border-emerald-100", grad: "from-emerald-500/10", icon: "text-emerald-600" },
    amber:   { wrap: "border-amber-100",   grad: "from-amber-500/10",   icon: "text-amber-600" },
    neutral: { wrap: "border-neutral-100", grad: "from-neutral-100",    icon: "text-neutral-500" },
  }[accent];
  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${styles.wrap}`}>
      <div className={`bg-linear-to-b ${styles.grad} to-transparent px-5 py-4 border-b ${styles.wrap} flex items-center gap-3`}>
        <span className={styles.icon}>{icon}</span>
        <h3 className="text-sm font-semibold text-neutral-800 tracking-wide">{title}</h3>
      </div>
      <div className="px-5 py-1">{children}</div>
    </div>
  );
}