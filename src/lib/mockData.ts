export const WORKER = {
  name: "Arjun Kumar",
  initials: "AK",
  city: "Chennai",
  zone: "Zone 4 — T. Nagar",
  platform: "Swiggy",
  upi: "arjun@okicici",
  tier: "Standard",
  premium: 100,
  maxCoverage: 700,
  riskScore: 67,
  streak: 3,
  coverageWindow: { start: "Apr 7, 2026", end: "Apr 13, 2026" },
  coverageUsed: 0,
};

export const PAYOUTS = [
  {
    week: "Mar 17–23",
    trigger: "Heavy Rain",
    hours: 5,
    coveredHours: 3,
    hourlyRate: 60.7,
    protectionRate: 70,
    payout: 127.5,
    status: "Completed" as const,
    ref: "NS-20260320-0041",
  },
  {
    week: "Mar 24–30",
    trigger: "Extreme Heat",
    hours: 4,
    coveredHours: 2,
    hourlyRate: 60.7,
    protectionRate: 70,
    payout: 101.2,
    status: "Completed" as const,
    ref: "NS-20260328-0089",
  },
  {
    week: "Mar 31–Apr 6",
    trigger: null,
    hours: 0,
    coveredHours: 0,
    hourlyRate: 60.7,
    protectionRate: 70,
    payout: 0,
    status: "Clean" as const,
    ref: null,
  },
  {
    week: "Apr 7–13",
    trigger: "AQI Alert",
    hours: 3,
    coveredHours: 1,
    hourlyRate: 60.7,
    protectionRate: 70,
    payout: 76.0,
    status: "Processing" as const,
    ref: "NS-20260410-0112",
  },
];

export const TRIGGERS = [
  { name: "Heavy Rain", icon: "🌧️", current: "3.2mm/hr", threshold: ">15mm/hr", status: "normal" as const },
  { name: "Extreme Heat", icon: "🌡️", current: "38°C", threshold: ">42°C", status: "normal" as const },
  { name: "AQI", icon: "💨", current: "182", threshold: ">300", status: "elevated" as const },
  { name: "Civil Shutdown", icon: "🚫", current: "No alerts", threshold: "Govt. notification", status: "normal" as const },
];

export const ADMIN_KPI = {
  enrolled: 2847,
  enrolledDelta: 12,
  premiums: 284700,
  payouts: 87450,
  lossRatio: 30.7,
};

export const WEEKLY_DATA = [
  { week: "W1 Feb", premiums: 180000, payouts: 42000 },
  { week: "W2 Feb", premiums: 195000, payouts: 67000 },
  { week: "W3 Feb", premiums: 210000, payouts: 35000 },
  { week: "W4 Feb", premiums: 225000, payouts: 89000 },
  { week: "W1 Mar", premiums: 240000, payouts: 54000 },
  { week: "W2 Mar", premiums: 258000, payouts: 72000 },
  { week: "W3 Mar", premiums: 270000, payouts: 95000 },
  { week: "W4 Mar", premiums: 284700, payouts: 87450 },
];

export const TRIGGER_FREQUENCY = [
  { name: "Heavy Rain", value: 42, fill: "#E85D1A" },
  { name: "Extreme Heat", value: 28, fill: "#D97706" },
  { name: "AQI", value: 18, fill: "#9C8C7A" },
  { name: "Civil Shutdown", value: 12, fill: "#1C1814" },
];

export const FRAUD_QUEUE = [
  { id: "WRK-2841", name: "Rajesh M.", fraudScore: 0.82, reason: "GPS anomaly during payout window", zone: "Zone 7" },
  { id: "WRK-1892", name: "Priya S.", fraudScore: 0.65, reason: "Multiple claims overlapping zones", zone: "Zone 3" },
  { id: "WRK-0934", name: "Vikram D.", fraudScore: 0.24, reason: "New enrollment spike claim", zone: "Zone 1" },
  { id: "WRK-2105", name: "Meena K.", fraudScore: 0.45, reason: "Unusual payout frequency", zone: "Zone 9" },
];

export const LIVE_TRIGGERS = [
  { trigger: "Heavy Rain", city: "Chennai", zone: "Zone 4", workers: 127, status: "active" as const, time: "2m ago" },
  { trigger: "Extreme Heat", city: "Delhi", zone: "Zone 12", workers: 89, status: "active" as const, time: "15m ago" },
  { trigger: "AQI Alert", city: "Bengaluru", zone: "Zone 6", workers: 54, status: "monitoring" as const, time: "1h ago" },
  { trigger: "Heavy Rain", city: "Mumbai", zone: "Zone 8", workers: 203, status: "active" as const, time: "5m ago" },
];

export const PLANS = [
  {
    name: "Basic",
    premium: 50,
    maxCoverage: 350,
    riskRange: "0–30",
    streakDiscount: false,
    recommended: "Light users, part-time",
    color: "#9C8C7A",
  },
  {
    name: "Standard",
    premium: 100,
    maxCoverage: 700,
    riskRange: "0–70",
    streakDiscount: true,
    recommended: "Full-time delivery partners",
    color: "#E85D1A",
    active: true,
  },
  {
    name: "Pro",
    premium: 175,
    maxCoverage: 1200,
    riskRange: "0–100",
    streakDiscount: true,
    recommended: "High-volume partners",
    color: "#16A34A",
  },
  {
    name: "Surge",
    premium: 250,
    maxCoverage: 2000,
    riskRange: "0–100",
    streakDiscount: true,
    recommended: "Full-time, high-risk zones",
    color: "#1C1814",
  },
];

export const ZONES: Record<string, string[]> = {
  Chennai: ["Zone 1 — Adyar", "Zone 2 — Anna Nagar", "Zone 3 — Teynampet", "Zone 4 — T. Nagar", "Zone 5 — Velachery"],
  Mumbai: ["Zone 6 — Andheri", "Zone 7 — Bandra", "Zone 8 — Juhu", "Zone 9 — Powai"],
  Delhi: ["Zone 10 — Connaught Place", "Zone 11 — Dwarka", "Zone 12 — Nehru Place", "Zone 13 — Rohini"],
  Bengaluru: ["Zone 14 — Koramangala", "Zone 15 — Indiranagar", "Zone 16 — Whitefield", "Zone 17 — HSR Layout"],
};

export const CITY_RISK: Record<string, number> = {
  Chennai: 0.72,
  Mumbai: 0.65,
  Delhi: 0.58,
  Bengaluru: 0.42,
};
