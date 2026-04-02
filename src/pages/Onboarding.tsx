"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Upload,
  Phone,
  MapPin,
  CreditCard,
  Check,
  ChevronRight,
  Zap,
} from "lucide-react";
import { useAppStore } from "@/lib/navigationStore";
import { ZONES, CITY_RISK } from "@/lib/mockData";
import { useRouter } from "next/navigation";

/* ─── Animation Config ─── */
const slideVariants = {
  enter: { x: 32, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -32, opacity: 0 },
};
const slideTransition = { duration: 0.35, ease: [0.22, 1, 0.36, 1] as any };

/* ─── Shared Styles ─── */
const cardShadow =
  "0 2px 12px rgba(28, 24, 20, 0.07), 0 0 0 1px rgba(28, 24, 20, 0.04)";

const CITIES = Object.keys(ZONES);

/* ─── Grain Overlay ─── */
function GrainOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.06]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundSize: "128px 128px",
      }}
    />
  );
}

/* ─── Shield SVG Decoration ─── */
function ShieldDecoration() {
  return (
    <svg
      viewBox="0 0 200 240"
      fill="none"
      className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-[320px] h-[380px] opacity-[0.08]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M100 10 L185 55 L185 130 C185 190 100 230 100 230 C100 230 15 190 15 130 L15 55 Z"
        stroke="white"
        strokeWidth="2.5"
      />
      <path
        d="M100 45 L155 75 L155 125 C155 165 100 195 100 195 C100 195 45 165 45 125 L45 75 Z"
        stroke="white"
        strokeWidth="1.5"
      />
      <path
        d="M100 80 L125 95 L125 120 C125 140 100 155 100 155 C100 155 75 140 75 120 L75 95 Z"
        stroke="white"
        strokeWidth="1"
      />
    </svg>
  );
}

/* ─── Left Brand Panel ─── */
function BrandPanel() {
  return (
    <div
      className="hidden lg:flex flex-col justify-between relative overflow-hidden"
      style={{
        width: "45%",
        background: "var(--primary)",
        padding: "3rem 2.5rem",
      }}
    >
      <GrainOverlay />
      <ShieldDecoration />

      {/* Top */}
      <div className="relative z-10 flex items-center gap-2.5">
        <div
          className="flex items-center justify-center rounded-lg"
          style={{
            width: 36,
            height: 36,
            background: "rgba(255,255,255,0.15)",
          }}
        >
          <Shield className="text-white" size={20} />
        </div>
        <span
          className="text-white font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem" }}
        >
          NammaShield
        </span>
      </div>

      {/* Center copy */}
      <div className="relative z-10 max-w-[380px]">
        <h2
          className="text-white leading-[1.1] mb-5"
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: "3.25rem",
          }}
        >
          Your income.{" "}
          <span className="not-italic">Protected.</span>
        </h2>
        <p
          className="leading-relaxed"
          style={{
            color: "rgba(255,255,255,0.75)",
            fontFamily: "var(--font-body)",
            fontSize: "0.9375rem",
            maxWidth: 320,
          }}
        >
          NammaShield pays you when rain, heat, or disruptions cut your
          earnings.
        </p>
      </div>

      {/* Bottom stat pills */}
      <div className="relative z-10 flex gap-3 flex-wrap">
        {[
          { icon: "💰", label: "₹127 avg payout" },
          { icon: "⚡", label: "< 5 min onboarding" },
          { icon: "📋", label: "0 paperwork" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(4px)",
            }}
          >
            <span className="text-sm">{stat.icon}</span>
            <span
              className="text-white"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.8125rem",
                fontWeight: 500,
              }}
            >
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Progress Bar ─── */
function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1.5 mb-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-1 flex-1 rounded-full transition-colors duration-300"
          style={{
            background:
              i < current ? "var(--primary)" : "var(--border)",
          }}
        />
      ))}
    </div>
  );
}

/* ─── Step 1: Phone OTP ─── */
function StepPhone({
  onNext,
}: {
  onNext: (data: { phone: string }) => void;
}) {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(val);
  };

  const handleSendOtp = () => {
    if (phone.length === 10) {
      setSending(true);
      setTimeout(() => {
        setSending(false);
        setOtpSent(true);
      }, 1200);
    }
  };

  const handleOtpChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    if (val && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all filled
    if (val && newOtp.every((c) => c !== "")) {
      setVerifying(true);
      setTimeout(() => {
        setVerifying(false);
        onNext({ phone: `+91${phone}` });
      }, 1000);
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const data = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (data.length === 6) {
      const newOtp = data.split("");
      setOtp(newOtp);
      otpRefs.current[5]?.focus();
      setVerifying(true);
      setTimeout(() => {
        setVerifying(false);
        onNext({ phone: `+91${phone}` });
      }, 1000);
    }
  };

  return (
    <motion.div
      key="step-phone"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={slideTransition}
      className="w-full"
    >
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.75rem",
          color: "var(--foreground)",
          marginBottom: "0.5rem",
        }}
      >
        Enter your WhatsApp number
      </h3>
      <p
        className="text-sm mb-8"
        style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
      >
        We&apos;ll send a one-time verification code
      </p>

      {/* Phone Input */}
      <div className="flex gap-2 mb-6">
        <div
          className="flex items-center gap-1.5 px-4 rounded-lg border shrink-0"
          style={{
            borderColor: "var(--border)",
            background: "var(--secondary)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.875rem",
            color: "var(--foreground)",
            height: 48,
          }}
        >
          <span>🇮🇳</span>
          <span>+91</span>
        </div>
        <input
          type="tel"
          value={phone}
          onChange={handlePhoneChange}
          placeholder="10-digit number"
          className="flex-1 px-4 rounded-lg border text-sm outline-none transition-all duration-150"
          style={{
            borderColor: "var(--border)",
            background: "white",
            fontFamily: "var(--font-mono)",
            fontSize: "1rem",
            color: "var(--foreground)",
            height: 48,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--primary)";
            e.target.style.boxShadow = "0 0 0 3px rgba(232, 93, 26, 0.15)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--border)";
            e.target.style.boxShadow = "none";
          }}
          maxLength={10}
        />
      </div>

      {!otpSent ? (
        <button
          onClick={handleSendOtp}
          disabled={phone.length !== 10 || sending}
          className="w-full py-3 rounded-lg text-white font-medium text-sm transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background:
              phone.length === 10 && !sending
                ? "var(--primary)"
                : "var(--muted)",
            boxShadow:
              phone.length === 10
                ? "0 2px 8px rgba(232,93,26,0.35)"
                : "none",
            fontFamily: "var(--font-body)",
          }}
        >
          {sending ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2a10 10 0 0 1 10 10"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </motion.div>
          ) : (
            "Send OTP"
          )}
        </button>
      ) : (
        <div>
          <p
            className="text-xs mb-3"
            style={{
              color: "var(--muted)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
            }}
          >
            Enter 6-digit code sent to +91{phone}
          </p>
          <div className="flex gap-2.5 mb-4" onPaste={handleOtpPaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  otpRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleOtpChange(i, e)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                className="otp-input"
                maxLength={1}
                autoFocus={i === 0}
              />
            ))}
          </div>
          {verifying && (
            <div className="flex items-center gap-2 justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2a10 10 0 0 1 10 10"
                    stroke="var(--primary)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.div>
              <span
                className="text-xs"
                style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
              >
                Verifying...
              </span>
            </div>
          )}
          <button
            onClick={() => {
              setOtpSent(false);
              setOtp(Array(6).fill(""));
            }}
            className="mt-4 text-xs underline"
            style={{
              color: "var(--muted)",
              fontFamily: "var(--font-body)",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            Change number
          </button>
        </div>
      )}
    </motion.div>
  );
}

/* ─── Step 2: Platform ID Upload ─── */
function StepPlatformId({
  onNext,
}: {
  onNext: (data: { platform: string; partnerId: string }) => void;
}) {
  const [state, setState] = useState<
    "upload" | "scanning" | "verified"
  >("upload");
  const [platform, setPlatform] = useState("");
  const [fileName, setFileName] = useState("");

  const handleUpload = () => {
    setState("scanning");
    setPlatform("Swiggy");
    setFileName("partner_id_swiggy.png");
    setTimeout(() => {
      setState("verified");
    }, 2500);
  };

  return (
    <motion.div
      key="step-platform"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={slideTransition}
      className="w-full"
    >
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.75rem",
          color: "var(--foreground)",
          marginBottom: "0.5rem",
        }}
      >
        Upload your Partner ID
      </h3>
      <p
        className="text-sm mb-8"
        style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
      >
        Screenshot your platform profile or ID card
      </p>

      {state === "upload" && (
        <button
          onClick={handleUpload}
          className="w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 py-12 transition-all duration-200 cursor-pointer group"
          style={{
            borderColor: "var(--border)",
            background: "rgba(255,255,255,0.5)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--primary)";
            e.currentTarget.style.background = "var(--primary-light)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.background = "rgba(255,255,255,0.5)";
          }}
        >
          <div
            className="flex items-center justify-center rounded-xl"
            style={{
              width: 56,
              height: 56,
              background: "var(--primary-light)",
            }}
          >
            <Upload
              size={24}
              style={{ color: "var(--primary)" }}
            />
          </div>
          <div className="text-center">
            <p
              className="font-medium text-sm mb-1"
              style={{
                color: "var(--foreground)",
                fontFamily: "var(--font-body)",
              }}
            >
              Tap to upload screenshot
            </p>
            <p
              className="text-xs"
              style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
            >
              PNG, JPG — Max 5MB
            </p>
          </div>
        </button>
      )}

      {state === "scanning" && (
        <div
          className="rounded-xl overflow-hidden relative"
          style={{ boxShadow: cardShadow }}
        >
          <div
            className="p-6"
            style={{ background: "white" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="rounded-lg flex items-center justify-center"
                style={{
                  width: 40,
                  height: 40,
                  background: "var(--amber-light)",
                }}
              >
                <Zap size={18} style={{ color: "var(--amber)" }} />
              </div>
              <div>
                <p
                  className="font-medium text-sm"
                  style={{
                    color: "var(--foreground)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  Extracting details...
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
                >
                  {fileName}
                </p>
              </div>
            </div>

            {/* Scan line animation */}
            <div
              className="rounded-lg overflow-hidden relative"
              style={{
                height: 80,
                background: "var(--secondary)",
              }}
            >
              <motion.div
                className="absolute left-0 right-0 h-[2px]"
                style={{ background: "var(--primary)" }}
                initial={{ top: 0 }}
                animate={{ top: 78 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              />
              <div className="flex items-center justify-center h-full">
                <span
                  className="text-xs"
                  style={{
                    color: "var(--muted)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  Scanning document...
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {state === "verified" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div
            className="rounded-xl p-6"
            style={{ boxShadow: cardShadow, background: "white" }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="rounded-xl flex items-center justify-center"
                  style={{
                    width: 48,
                    height: 48,
                    background: "var(--accent-light)",
                  }}
                >
                  <Check size={22} style={{ color: "var(--accent)" }} />
                </div>
                <div>
                  <p
                    className="font-semibold text-sm"
                    style={{
                      color: "var(--foreground)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    Partner ID Verified
                  </p>
                  <p
                    className="text-xs"
                    style={{
                      color: "var(--accent)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    ✓ Identity confirmed
                  </p>
                </div>
              </div>
              <span
                className="px-2.5 py-1 rounded-full text-xs font-medium"
                style={{
                  background: "var(--accent-light)",
                  color: "var(--accent)",
                  fontFamily: "var(--font-body)",
                }}
              >
                Verified
              </span>
            </div>

            <div
              className="grid grid-cols-2 gap-3"
              style={{
                padding: "12px 16px",
                background: "var(--secondary)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <div>
                <p
                  className="text-xs mb-0.5"
                  style={{
                    color: "var(--muted)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Platform
                </p>
                <p
                  className="font-medium text-sm"
                  style={{
                    color: "var(--foreground)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {platform}
                </p>
              </div>
              <div>
                <p
                  className="text-xs mb-0.5"
                  style={{
                    color: "var(--muted)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Partner ID
                </p>
                <p
                  className="font-medium text-sm"
                  style={{
                    color: "var(--foreground)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  SWG-48721
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNext({ platform, partnerId: "SWG-48721" })}
            className="w-full mt-6 py-3 rounded-lg text-white font-medium text-sm flex items-center justify-center gap-2 transition-all duration-150"
            style={{
              background: "var(--primary)",
              boxShadow: "0 2px 8px rgba(232,93,26,0.35)",
              fontFamily: "var(--font-body)",
            }}
          >
            Continue <ChevronRight size={16} />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ─── Step 3: UPI Verification ─── */
function StepUPI({
  onNext,
}: {
  onNext: (data: { upi: string }) => void;
}) {
  const [upi, setUpi] = useState("");
  const [state, setState] = useState<"input" | "verifying" | "verified">(
    "input"
  );
  const [isValid, setIsValid] = useState(false);

  const validateUpi = (val: string) => {
    return /^[a-zA-Z0-9._-]+@[a-zA-Z]{2,}$/.test(val);
  };

  const handleUpiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUpi(val);
    setIsValid(validateUpi(val));
  };

  const handleVerify = () => {
    if (!isValid) return;
    setState("verifying");
    setTimeout(() => {
      setState("verified");
    }, 2000);
  };

  return (
    <motion.div
      key="step-upi"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={slideTransition}
      className="w-full"
    >
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.75rem",
          color: "var(--foreground)",
          marginBottom: "0.5rem",
        }}
      >
        Link your UPI ID
      </h3>
      <p
        className="text-sm mb-8"
        style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
      >
        This is where your payouts will be sent
      </p>

      <div className="relative mb-6">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <CreditCard size={18} style={{ color: "var(--muted)" }} />
        </div>
        <input
          type="text"
          value={upi}
          onChange={handleUpiChange}
          placeholder="yourname@upi"
          className="w-full pl-11 pr-4 py-3 rounded-lg border text-sm outline-none transition-all duration-150"
          style={{
            borderColor: isValid ? "var(--accent)" : "var(--border)",
            background: "white",
            fontFamily: "var(--font-mono)",
            fontSize: "0.9375rem",
            color: "var(--foreground)",
            boxShadow: isValid
              ? "0 0 0 3px rgba(22, 163, 74, 0.12)"
              : "none",
          }}
        />
      </div>

      {state === "input" && (
        <button
          onClick={handleVerify}
          disabled={!isValid}
          className="w-full py-3 rounded-lg text-white font-medium text-sm flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: isValid ? "var(--primary)" : "var(--muted)",
            boxShadow: isValid
              ? "0 2px 8px rgba(232,93,26,0.35)"
              : "none",
            fontFamily: "var(--font-body)",
          }}
        >
          Verify UPI
        </button>
      )}

      {state === "verifying" && (
        <div
          className="rounded-xl p-5"
          style={{ boxShadow: cardShadow, background: "white" }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2a10 10 0 0 1 10 10"
                  stroke="var(--primary)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </motion.div>
            <div>
              <p
                className="font-medium text-sm"
                style={{
                  color: "var(--foreground)",
                  fontFamily: "var(--font-body)",
                }}
              >
                Sending ₹1 test credit
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
              >
                Verifying your UPI address...
              </p>
            </div>
          </div>
        </div>
      )}

      {state === "verified" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div
            className="rounded-xl p-5"
            style={{ boxShadow: cardShadow, background: "white" }}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div
                  className="rounded-full flex items-center justify-center"
                  style={{
                    width: 36,
                    height: 36,
                    background: "var(--accent-light)",
                  }}
                >
                  <Check size={18} style={{ color: "var(--accent)" }} />
                </div>
                {/* Pulsing green dot */}
                <motion.div
                  className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full"
                  style={{ background: "var(--accent)" }}
                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p
                    className="font-medium text-sm"
                    style={{
                      color: "var(--foreground)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    UPI Verified
                  </p>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      background: "var(--accent-light)",
                      color: "var(--accent)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    Active
                  </span>
                </div>
                <p
                  className="text-xs mt-0.5"
                  style={{
                    color: "var(--muted)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {upi}
                </p>
                <p
                  className="text-xs mt-1"
                  style={{
                    color: "var(--accent)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6875rem",
                  }}
                >
                  ✓ ₹1 test credit sent & refunded
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNext({ upi })}
            className="w-full mt-6 py-3 rounded-lg text-white font-medium text-sm flex items-center justify-center gap-2 transition-all duration-150"
            style={{
              background: "var(--primary)",
              boxShadow: "0 2px 8px rgba(232,93,26,0.35)",
              fontFamily: "var(--font-body)",
            }}
          >
            Continue <ChevronRight size={16} />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ─── Step 4: City + Zone ─── */
function StepLocation({
  onNext,
}: {
  onNext: (data: { city: string; zone: string; riskScore: number }) => void;
}) {
  const [city, setCity] = useState("");
  const [zone, setZone] = useState("");
  const [showRisk, setShowRisk] = useState(false);

  const cityZones = city ? ZONES[city] || [] : [];
  const baseRisk = city ? CITY_RISK[city] || 0 : 0;
  const riskScore = Math.round(baseRisk * 100);

  const handleCitySelect = (c: string) => {
    setCity(c);
    setZone("");
    setShowRisk(false);
  };

  const handleNext = () => {
    setShowRisk(true);
  };

  return (
    <motion.div
      key="step-location"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={slideTransition}
      className="w-full"
    >
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.75rem",
          color: "var(--foreground)",
          marginBottom: "0.5rem",
        }}
      >
        Select your working area
      </h3>
      <p
        className="text-sm mb-8"
        style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
      >
        We use this to calculate your risk coverage
      </p>

      {/* City Selection */}
      <div className="mb-5">
        <label
          className="block text-xs mb-2 font-medium"
          style={{
            color: "var(--muted)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          City
        </label>
        <div className="grid grid-cols-2 gap-2">
          {CITIES.map((c) => (
            <button
              key={c}
              onClick={() => handleCitySelect(c)}
              className="flex items-center gap-2 px-4 py-3 rounded-lg border text-sm transition-all duration-150"
              style={{
                borderColor: city === c ? "var(--primary)" : "var(--border)",
                background: city === c ? "var(--primary-light)" : "white",
                fontFamily: "var(--font-body)",
                color: city === c ? "var(--primary)" : "var(--foreground)",
                fontWeight: city === c ? 600 : 400,
                boxShadow:
                  city === c
                    ? "0 0 0 3px rgba(232, 93, 26, 0.12)"
                    : "none",
              }}
            >
              <MapPin size={14} />
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Zone Selection */}
      {city && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mb-6"
        >
          <label
            className="block text-xs mb-2 font-medium"
            style={{
              color: "var(--muted)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Zone
          </label>
          <div
            className="rounded-xl border p-1 max-h-48 overflow-y-auto custom-scrollbar"
            style={{
              borderColor: "var(--border)",
              background: "white",
            }}
          >
            {cityZones.map((z) => (
              <button
                key={z}
                onClick={() => {
                  setZone(z);
                  setShowRisk(false);
                }}
                className="w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all duration-150"
                style={{
                  background: zone === z ? "var(--primary-light)" : "transparent",
                  fontFamily: "var(--font-body)",
                  color:
                    zone === z ? "var(--primary)" : "var(--foreground)",
                  fontWeight: zone === z ? 500 : 400,
                }}
              >
                {z}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Risk Score Card */}
      {showRisk && zone && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <div
            className="rounded-xl p-5"
            style={{ boxShadow: cardShadow, background: "white" }}
          >
            <div className="flex items-center justify-between mb-3">
              <p
                className="text-xs font-medium"
                style={{
                  color: "var(--muted)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Your Risk Score
              </p>
              <span
                className="px-2.5 py-1 rounded-full text-xs font-medium"
                style={{
                  background:
                    riskScore > 60
                      ? "var(--amber-light)"
                      : "var(--accent-light)",
                  color:
                    riskScore > 60 ? "var(--amber)" : "var(--accent)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {riskScore > 60 ? "High Coverage" : "Standard Coverage"}
              </span>
            </div>
            <div className="flex items-end gap-2 mb-3">
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "2rem",
                  fontWeight: 500,
                  color: "var(--foreground)",
                  lineHeight: 1,
                }}
              >
                {riskScore}
              </span>
              <span
                className="mb-1"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  color: "var(--muted)",
                }}
              >
                /100
              </span>
            </div>
            {/* Risk bar */}
            <div
              className="w-full h-2 rounded-full overflow-hidden"
              style={{ background: "var(--secondary)" }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background:
                    riskScore > 60
                      ? "linear-gradient(90deg, var(--amber), var(--primary))"
                      : "linear-gradient(90deg, var(--accent), #4ade80)",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${riskScore}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <p
              className="text-xs mt-2"
              style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
            >
              {riskScore > 60
                ? "Your area has higher weather disruption risk — you qualify for enhanced coverage."
                : "Your area has moderate risk — standard coverage applies."}
            </p>
          </div>

          <button
            onClick={() => onNext({ city, zone, riskScore })}
            className="w-full mt-6 py-3 rounded-lg text-white font-medium text-sm flex items-center justify-center gap-2 transition-all duration-150"
            style={{
              background: "var(--primary)",
              boxShadow: "0 2px 8px rgba(232,93,26,0.35)",
              fontFamily: "var(--font-body)",
            }}
          >
            Continue <ChevronRight size={16} />
          </button>
        </motion.div>
      )}

      {!showRisk && city && zone && (
        <button
          onClick={handleNext}
          className="w-full py-3 rounded-lg text-white font-medium text-sm flex items-center justify-center gap-2 transition-all duration-150"
          style={{
            background: "var(--primary)",
            boxShadow: "0 2px 8px rgba(232,93,26,0.35)",
            fontFamily: "var(--font-body)",
          }}
        >
          Check Coverage <ChevronRight size={16} />
        </button>
      )}
    </motion.div>
  );
}

/* ─── Step 5: Activate Policy ─── */
function StepActivate({
  data,
}: {
  data: {
    phone: string;
    platform: string;
    partnerId: string;
    upi: string;
    city: string;
    zone: string;
    riskScore: number;
  };
}) {
  const [gpsGranted, setGpsGranted] = useState(false);
  const [activating, setActivating] = useState(false);
  const router = useRouter();

  const handleActivate = () => {
    setActivating(true);
    setTimeout(() => {
      setActivating(false);
      useAppStore.getState().completeOnboarding();
      router.push("/dashboard");
    }, 2000);
  };

  return (
    <motion.div
      key="step-activate"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={slideTransition}
      className="w-full"
    >
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.75rem",
          color: "var(--foreground)",
          marginBottom: "0.5rem",
        }}
      >
        Review & Activate
      </h3>
      <p
        className="text-sm mb-6"
        style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
      >
        Confirm your details and activate your coverage
      </p>

      {/* Summary Card */}
      <div
        className="rounded-xl p-5 mb-4"
        style={{ boxShadow: cardShadow, background: "white" }}
      >
        <div className="space-y-3.5">
          {[
            {
              label: "Phone",
              value: data.phone,
              icon: <Phone size={14} />,
            },
            {
              label: "Platform",
              value: `${data.platform} · ${data.partnerId}`,
              icon: <CreditCard size={14} />,
            },
            {
              label: "UPI",
              value: data.upi,
              icon: <Shield size={14} />,
            },
            {
              label: "Area",
              value: `${data.city} — ${data.zone}`,
              icon: <MapPin size={14} />,
            },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span style={{ color: "var(--muted)" }}>{item.icon}</span>
                <span
                  className="text-xs"
                  style={{
                    color: "var(--muted)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {item.label}
                </span>
              </div>
              <span
                className="text-sm"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--foreground)",
                  fontWeight: 500,
                }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>

        <div
          className="my-4"
          style={{
            borderTop: "1px solid var(--border)",
          }}
        />

        {/* Coverage Details */}
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-xs"
              style={{
                color: "var(--muted)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Weekly Premium
            </p>
            <p
              className="text-lg font-semibold"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--foreground)",
                fontWeight: 500,
              }}
            >
              ₹100
            </p>
          </div>
          <div className="text-right">
            <p
              className="text-xs"
              style={{
                color: "var(--muted)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Max Coverage
            </p>
            <p
              className="text-lg font-semibold"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--primary)",
                fontWeight: 500,
              }}
            >
              ₹700
            </p>
          </div>
          <div className="text-right">
            <p
              className="text-xs"
              style={{
                color: "var(--muted)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Risk Score
            </p>
            <p
              className="text-lg font-semibold"
              style={{
                fontFamily: "var(--font-mono)",
                color:
                  data.riskScore > 60 ? "var(--amber)" : "var(--accent)",
                fontWeight: 500,
              }}
            >
              {data.riskScore}
            </p>
          </div>
        </div>
      </div>

      {/* Loyalty Streak */}
      <div
        className="rounded-xl p-4 mb-4 flex items-center gap-3"
        style={{
          boxShadow: cardShadow,
          background: "var(--secondary)",
        }}
      >
        <div
          className="flex items-center justify-center rounded-lg shrink-0"
          style={{
            width: 40,
            height: 40,
            background: "var(--amber-light)",
          }}
        >
          <Zap size={18} style={{ color: "var(--amber)" }} />
        </div>
        <div className="flex-1">
          <p
            className="font-medium text-sm"
            style={{
              color: "var(--foreground)",
              fontFamily: "var(--font-body)",
            }}
          >
            Loyalty Streak
          </p>
          <p
            className="text-xs"
            style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
          >
            Pay on time for 4 weeks and unlock 10% premium discount
          </p>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((w) => (
            <div
              key={w}
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
              style={{
                background:
                  w <= 1 ? "var(--amber)" : "var(--border)",
                color: w <= 1 ? "white" : "var(--muted)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.625rem",
              }}
            >
              {w <= 1 ? "W1" : w}
            </div>
          ))}
        </div>
      </div>

      {/* GPS Permission Banner */}
      {!gpsGranted ? (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full rounded-xl p-4 mb-6 flex items-center gap-3 transition-all duration-200"
          style={{
            background: "white",
            border: "1.5px dashed var(--primary)",
            cursor: "pointer",
          }}
          onClick={() => setGpsGranted(true)}
        >
          <div
            className="flex items-center justify-center rounded-lg shrink-0"
            style={{
              width: 40,
              height: 40,
              background: "var(--primary-light)",
            }}
          >
            <MapPin size={18} style={{ color: "var(--primary)" }} />
          </div>
          <div className="flex-1 text-left">
            <p
              className="font-medium text-sm"
              style={{
                color: "var(--foreground)",
                fontFamily: "var(--font-body)",
              }}
            >
              Enable GPS Location
            </p>
            <p
              className="text-xs"
              style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
            >
              Required for automatic weather-triggered payouts
            </p>
          </div>
          <ChevronRight
            size={16}
            style={{ color: "var(--primary)" }}
          />
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full rounded-xl p-4 mb-6 flex items-center gap-3"
          style={{
            background: "var(--accent-light)",
          }}
        >
          <Check size={18} style={{ color: "var(--accent)" }} />
          <p
            className="text-sm font-medium"
            style={{
              color: "var(--accent)",
              fontFamily: "var(--font-body)",
            }}
          >
            GPS location enabled
          </p>
        </motion.div>
      )}

      {/* Activate CTA */}
      <button
        onClick={handleActivate}
        disabled={activating}
        className="w-full py-4 rounded-lg text-white font-semibold text-base flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-70"
        style={{
          background: activating ? "var(--muted)" : "var(--primary)",
          boxShadow: activating
            ? "none"
            : "0 4px 16px rgba(232,93,26,0.4)",
          fontFamily: "var(--font-body)",
          fontSize: "1rem",
        }}
      >
        {activating ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 2a10 10 0 0 1 10 10"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </motion.div>
            Activating...
          </>
        ) : (
          <>
            <Shield size={18} />
            Activate Coverage
          </>
        )}
      </button>

      {/* Fine print */}
      <p
        className="text-center mt-4"
        style={{
          color: "var(--muted)",
          fontFamily: "var(--font-body)",
          fontSize: "0.6875rem",
          lineHeight: 1.5,
        }}
      >
        By activating, you agree to our{" "}
        <span
          style={{ color: "var(--foreground)", textDecoration: "underline" }}
        >
          Terms of Service
        </span>{" "}
        and{" "}
        <span
          style={{ color: "var(--foreground)", textDecoration: "underline" }}
        >
          Privacy Policy
        </span>
        . Coverage begins on next Monday.
      </p>
    </motion.div>
  );
}

/* ─── Main Onboarding Component ─── */
export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<1 | -1>(1);

  const [formData, setFormData] = useState({
    phone: "",
    platform: "",
    partnerId: "",
    upi: "",
    city: "",
    zone: "",
    riskScore: 0,
  });

  const totalSteps = 5;

  const goNext = (partialData: Record<string, unknown>) => {
    setDirection(1);
    setFormData((prev) => ({ ...prev, ...partialData }));
    setStep((s) => Math.min(s + 1, totalSteps));
  };

  const stepHeadings: Record<number, string> = {
    1: "Phone Verification",
    2: "Platform Setup",
    3: "Payment Link",
    4: "Location & Risk",
    5: "Final Review",
  };

  return (
    <div className="flex min-h-screen w-full" style={{ background: "var(--background)" }}>
      {/* Left Brand Panel */}
      <BrandPanel />

      {/* Right Form Panel */}
      <div
        className="flex-1 flex flex-col overflow-hidden"
        style={{ background: "var(--background)" }}
      >
        {/* Mobile Brand Header */}
        <div
          className="lg:hidden flex items-center gap-2.5 px-6 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div
            className="flex items-center justify-center rounded-lg"
            style={{
              width: 32,
              height: 32,
              background: "var(--primary)",
            }}
          >
            <Shield className="text-white" size={16} />
          </div>
          <span
            className="font-semibold tracking-tight"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              color: "var(--foreground)",
            }}
          >
            NammaShield
          </span>
        </div>

        {/* Progress Section */}
        <div className="px-8 pt-8 pb-2" style={{ maxWidth: 480, width: "100%" }}>
          <ProgressBar current={step} total={totalSteps} />
          <div className="flex items-center justify-between">
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                color: "var(--muted)",
              }}
            >
              Step {step} of {totalSteps}
            </p>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                color: "var(--muted)",
              }}
            >
              {stepHeadings[step]}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 flex items-start justify-center overflow-y-auto px-8 py-8">
          <div style={{ maxWidth: 480, width: "100%" }}>
            <AnimatePresence mode="wait" custom={direction}>
              {step === 1 && <StepPhone onNext={goNext} />}
              {step === 2 && <StepPlatformId onNext={goNext} />}
              {step === 3 && <StepUPI onNext={goNext} />}
              {step === 4 && <StepLocation onNext={goNext} />}
              {step === 5 && <StepActivate data={formData} />}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
