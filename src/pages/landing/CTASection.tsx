import { motion } from "framer-motion";
import { useAppStore } from "@/lib/navigationStore";
import { useRouter } from "next/navigation";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, delay, ease: "easeOut" as any },
});

const onboardingSteps = [
  "Phone OTP",
  "Partner ID",
  "UPI Link",
  "Your Zone",
  "Activate",
];

export default function CTASection() {
  const { isOnboarded } = useAppStore();
  const router = useRouter();

  return (
    <section className="py-16 md:py-32 px-6">
      <div className="max-w-3xl mx-auto text-center">
        {/* Heading */}
        <motion.h2
          className="text-4xl sm:text-6xl mb-6"
          style={{
            fontFamily: "var(--font-display)",
            lineHeight: 1.0,
            color: "var(--foreground)",
          }}
          {...fadeUp(0)}
        >
          Rain season is coming.
          <br />
          <span
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              color: "var(--primary)",
            }}
          >
            Are you covered?
          </span>
        </motion.h2>

        {/* Subtext */}
        <motion.p
          className="text-lg mb-10 max-w-lg mx-auto"
          style={{ fontFamily: "var(--font-body)", color: "var(--muted)" }}
          {...fadeUp(0.1)}
        >
          Join 2,800+ delivery partners who get paid even when the platform goes quiet.
        </motion.p>

        {/* Onboarding Teaser Steps */}
        <motion.div className="flex flex-wrap items-center justify-center gap-2 mb-6" {...fadeUp(0.2)}>
          {onboardingSteps.map((step, i) => (
            <span key={step} className="flex items-center gap-2">
              <span
                className="px-3 py-1 rounded-full text-xs"
                style={{
                  fontFamily: "var(--font-mono)",
                  backgroundColor: "var(--primary-light)",
                  color: "var(--primary)",
                }}
              >
                {String.fromCharCode(0x2460 + i)} {step}
              </span>
              {i < onboardingSteps.length - 1 && (
                <span style={{ color: "var(--muted)", fontFamily: "var(--font-body)", fontSize: "0.875rem" }}>
                  &rarr;
                </span>
              )}
            </span>
          ))}
        </motion.div>

        {/* Takes less than 5 minutes */}
        <motion.p
          className="text-sm mb-10"
          style={{ fontFamily: "var(--font-body)", color: "var(--muted)" }}
          {...fadeUp(0.25)}
        >
          Takes less than 5 minutes. No documents.
        </motion.p>

        {/* CTA Button */}
        <motion.div {...fadeUp(0.35)}>
          <button
            onClick={() => router.push(isOnboarded ? "/dashboard" : "/onboarding")}
            className="relative overflow-hidden rounded-full px-8 py-4 sm:px-14 sm:py-5 text-base sm:text-lg font-semibold text-white transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            style={{
              fontFamily: "var(--font-body)",
              backgroundColor: "var(--primary)",
              boxShadow: "0 4px 24px rgba(232, 93, 26, 0.35)",
            }}
          >
            {/* Shimmer sweep overlay */}
            <span
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 45%, rgba(255,255,255,0.25) 50%, transparent 55%)",
                transform: "translateX(-100%)",
                animation: "ns-shimmer 3s ease-in-out infinite",
              }}
            />
            <span className="relative z-10">{isOnboarded ? "Go to Dashboard" : "Get Protected — Free First Week"}</span>
          </button>
        </motion.div>

        {/* Shimmer keyframes */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @keyframes ns-shimmer {
            0% { transform: translateX(-100%); }
            20% { transform: translateX(200%); }
            100% { transform: translateX(200%); }
          }
        `,
          }}
        />
      </div>
    </section>
  );
}
