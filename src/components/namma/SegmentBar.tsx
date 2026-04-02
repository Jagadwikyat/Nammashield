"use client";

interface SegmentBarProps {
  segments: number;
  filled: number;
  className?: string;
}

export function SegmentBar({ segments = 20, filled = 0, className = "" }: SegmentBarProps) {
  return (
    <div className={`flex gap-[2px] ${className}`}>
      {Array.from({ length: segments }).map((_, i) => (
        <div
          key={i}
          className="h-[3px] flex-1 rounded-full transition-all duration-500"
          style={{
            backgroundColor: i < filled ? "var(--primary)" : "var(--border)",
          }}
        />
      ))}
    </div>
  );
}
