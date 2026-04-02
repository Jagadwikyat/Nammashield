"use client";

interface RiskRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLabel?: boolean;
}

export function RiskRing({
  score,
  size = 80,
  strokeWidth = 6,
  className = "",
  showLabel = true,
}: RiskRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (score / 100) * circumference;
  const color = score < 35 ? "#16A34A" : score < 70 ? "#E85D1A" : "#DC2626";
  const label = score < 35 ? "Low Risk" : score < 70 ? "Standard Risk" : "High Risk";

  return (
    <div className={`inline-flex flex-col items-center gap-1 ${className}`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E2D9CF"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      {showLabel && (
        <div className="text-center" style={{ marginTop: -size / 2 - 8 }}>
          <span className="font-medium text-xs" style={{ color }}>
            {label}
          </span>
        </div>
      )}
    </div>
  );
}
