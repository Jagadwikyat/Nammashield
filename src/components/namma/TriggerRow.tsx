"use client";

interface TriggerRowProps {
  icon: string;
  name: string;
  current: string;
  threshold: string;
  status: "normal" | "elevated" | "active";
}

export function TriggerRow({ icon, name, current, threshold, status }: TriggerRowProps) {
  const statusStyles = {
    normal: "bg-[var(--secondary)] text-[var(--muted)]",
    elevated: "bg-[var(--amber-light)] text-[var(--amber)]",
    active: "bg-red-50 text-red-600",
  };
  const statusLabels = {
    normal: "Normal",
    elevated: "Elevated",
    active: "Alert",
  };

  return (
    <div className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-[var(--secondary)] transition-colors">
      <span className="text-lg w-8 text-center">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ fontFamily: "var(--font-body)" }}>{name}</p>
        <p className="text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
          {current} — threshold {threshold}
        </p>
      </div>
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}
      >
        {status !== "normal" && (
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              status === "active"
                ? "bg-red-500 animate-pulse"
                : "bg-[var(--amber)] animate-pulse"
            }`}
          />
        )}
        {statusLabels[status]}
      </span>
    </div>
  );
}
