import Link from "next/link";
import { BrandName } from "@/components/BrandName";

/* ── Mascot SVG (same green frog from play page) ── */
function LandingMascotSvg({
  size = 120,
  expression = "standard",
  floatDelay = "0s",
  noFloat = false,
}: {
  size?: number;
  expression?: "standard" | "excited" | "wink";
  floatDelay?: string;
  noFloat?: boolean;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        animation: noFloat ? undefined : `lnd-float 3s ease-in-out ${floatDelay} infinite`,
        display: "inline-block",
      }}
    >
      <svg
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%" }}
      >
        {/* Body */}
        <ellipse cx="40" cy="50" rx="26" ry="22" fill="#4ade80" />
        {/* Head */}
        <circle cx="40" cy="32" r="24" fill="#4ade80" />

        {/* Eyes */}
        {expression === "excited" ? (
          <>
            <path d="M 26 28 Q 32 20 38 28" stroke="#166534" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 42 28 Q 48 20 54 28" stroke="#166534" strokeWidth="3" strokeLinecap="round" fill="none" />
          </>
        ) : expression === "wink" ? (
          <>
            <circle cx="32" cy="28" r="8" fill="white" />
            <circle cx="33" cy="29" r="4" fill="#1a1a2e" />
            <circle cx="34.5" cy="27.5" r="1.5" fill="white" />
            <path d="M 42 28 Q 48 24 54 28" stroke="#166534" strokeWidth="3" strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            <circle cx="32" cy="28" r="8" fill="white" />
            <circle cx="48" cy="28" r="8" fill="white" />
            <circle cx="33" cy="29" r="4" fill="#1a1a2e" />
            <circle cx="49" cy="29" r="4" fill="#1a1a2e" />
            <circle cx="34.5" cy="27.5" r="1.5" fill="white" />
            <circle cx="50.5" cy="27.5" r="1.5" fill="white" />
          </>
        )}

        {/* Mouth */}
        {expression === "excited" ? (
          <path d="M 30 38 Q 40 50 50 38" stroke="#166534" strokeWidth="3.5" strokeLinecap="round" fill="#e11d48" />
        ) : (
          <path d="M 30 38 Q 40 46 50 38" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        )}

        {/* Blush */}
        <circle cx="26" cy="36" r="4" fill="#f9a8d4" opacity="0.6" />
        <circle cx="54" cy="36" r="4" fill="#f9a8d4" opacity="0.6" />
        {/* Arms */}
        <ellipse cx="16" cy="55" rx="7" ry="5" fill="#4ade80" transform="rotate(-20 16 55)" />
        <ellipse cx="64" cy="55" rx="7" ry="5" fill="#4ade80" transform="rotate(20 64 55)" />
        {/* Belly */}
        <ellipse cx="40" cy="52" rx="14" ry="10" fill="#86efac" opacity="0.7" />
      </svg>
    </div>
  );
}

function StarMascotSvg({ size = 80 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, display: "inline-block", animation: "lnd-float-alt 4s ease-in-out infinite" }}>
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
        <polygon points="40,5 49,28 74,28 54,43 61,68 40,53 19,68 26,43 6,28 31,28" fill="#fbbf24" />
        <polygon points="40,10 47,28 68,28 52,41 58,62 40,49 22,62 28,41 12,28 33,28" fill="#fde68a" opacity="0.6" />
        <circle cx="33" cy="31" r="5" fill="white" />
        <circle cx="47" cy="31" r="5" fill="white" />
        <circle cx="34" cy="32" r="2.5" fill="#1a1a2e" />
        <circle cx="48" cy="32" r="2.5" fill="#1a1a2e" />
        <circle cx="35" cy="31" r="1" fill="white" />
        <circle cx="49" cy="31" r="1" fill="white" />
        <path d="M 33 39 Q 40 45 47 39" stroke="#d97706" strokeWidth="2" strokeLinecap="round" fill="none" />
        <circle cx="27" cy="36" r="3" fill="#f9a8d4" opacity="0.6" />
        <circle cx="53" cy="36" r="3" fill="#f9a8d4" opacity="0.6" />
      </svg>
    </div>
  );
}

function RocketMascotSvg({ size = 80 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, display: "inline-block", animation: "lnd-rocket 5s ease-in-out infinite" }}>
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
        <ellipse cx="40" cy="38" rx="14" ry="26" fill="#a78bfa" />
        <circle cx="40" cy="33" r="8" fill="#e0f2fe" />
        <circle cx="40" cy="33" r="5" fill="#38bdf8" />
        <circle cx="38" cy="32" r="1.5" fill="white" />
        <circle cx="42" cy="32" r="1.5" fill="white" />
        <path d="M 37 35 Q 40 38 43 35" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M 26 56 L 34 44 L 34 60 Z" fill="#818cf8" />
        <path d="M 54 56 L 46 44 L 46 60 Z" fill="#818cf8" />
        <path d="M 26 13 Q 40 -2 54 13 Z" fill="#c084fc" />
        <ellipse cx="40" cy="66" rx="8" ry="5" fill="#fbbf24" />
        <ellipse cx="40" cy="70" rx="5" ry="4" fill="#f97316" />
        <ellipse cx="40" cy="73" rx="3" ry="3" fill="#ef4444" />
      </svg>
    </div>
  );
}

const steps = [
  {
    emoji: "📧",
    expression: "wink" as const,
    title: "Get your link",
    description: "Your teacher sends a special quest link to your email. Tap it to start your adventure!",
    bg: "linear-gradient(135deg, #fffbeb, #fef3c7)",
    border: "#fde68a",
    shadow: "#fcd34d",
    numColor: "#fbbf24",
    floatDelay: "0s",
  },
  {
    emoji: "🎮",
    expression: "excited" as const,
    title: "Play the quiz",
    description: "Read fun questions, pick your answers, and level up your knowledge powers!",
    bg: "linear-gradient(135deg, #f5f3ff, #ede9fe)",
    border: "#c4b5fd",
    shadow: "#a78bfa",
    numColor: "#a78bfa",
    floatDelay: "0.5s",
  },
  {
    emoji: "⭐",
    expression: "standard" as const,
    title: "Earn stars",
    description: "Answer correctly to collect stars. Finish the quest and see your amazing score!",
    bg: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
    border: "#6ee7b7",
    shadow: "#34d399",
    numColor: "#34d399",
    floatDelay: "1s",
  },
];

export default function HomePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(145deg, #fef3e8 0%, #f0ffe8 40%, #e8f4ff 75%, #f5e8ff 100%)",
        fontFamily: "'Nunito', system-ui, sans-serif",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      {/* Keyframe animations injected via style tag */}
      {/* eslint-disable-next-line react/no-danger */}
      <style>{`
        @keyframes lnd-float {
          0%, 100% { transform: translateY(0) rotate(-3deg); }
          50% { transform: translateY(-16px) rotate(3deg); }
        }
        @keyframes lnd-float-alt {
          0%, 100% { transform: translateY(0) rotate(5deg); }
          50% { transform: translateY(-12px) rotate(-5deg); }
        }
        @keyframes lnd-rocket {
          0%, 100% { transform: translateY(0) rotate(-8deg); }
          50% { transform: translateY(-20px) rotate(8deg); }
        }
        @keyframes lnd-blob-pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.08); opacity: 0.65; }
        }
        @keyframes lnd-sparkle {
          0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
          50% { opacity: 0.6; transform: scale(1.3) rotate(20deg); }
        }
        @keyframes lnd-badge-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.5); }
          50% { box-shadow: 0 0 0 10px rgba(251, 191, 36, 0); }
        }
        .lnd-step-card {
          transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.25s ease;
        }
        .lnd-step-card:hover {
          transform: translateY(-10px) rotate(-1.5deg) !important;
        }
        .lnd-btn {
          transition: transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.15s ease;
        }
        .lnd-btn:hover { transform: translateY(-5px); }
        .lnd-btn:active { transform: translateY(3px); }
        .lnd-btn-secondary {
          transition: transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.15s ease;
        }
        .lnd-btn-secondary:hover { transform: translateY(-4px); }
        .lnd-btn-secondary:active { transform: translateY(3px); }
      `}</style>

      {/* Decorative floating blobs (background) */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "5%", left: "-5%", width: 220, height: 220, borderRadius: "50%", background: "#ffe566", opacity: 0.45, animation: "lnd-blob-pulse 6s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: "3%", right: "-4%", width: 180, height: 180, borderRadius: "50%", background: "#a78bfa", opacity: 0.4, animation: "lnd-blob-pulse 7s ease-in-out infinite 1s" }} />
        <div style={{ position: "absolute", top: "42%", left: "-3%", width: 140, height: 140, borderRadius: "50%", background: "#7ee081", opacity: 0.35, animation: "lnd-blob-pulse 5s ease-in-out infinite 0.5s" }} />
        <div style={{ position: "absolute", bottom: "20%", right: "-2%", width: 160, height: 160, borderRadius: "50%", background: "#ff6b9d", opacity: 0.3, animation: "lnd-blob-pulse 8s ease-in-out infinite 2s" }} />
        <div style={{ position: "absolute", bottom: "5%", left: "20%", width: 120, height: 120, borderRadius: "50%", background: "#38bdf8", opacity: 0.3, animation: "lnd-blob-pulse 6s ease-in-out infinite 1.5s" }} />
        {/* Floating sparkle emojis */}
        <span style={{ position: "absolute", top: "12%", left: "8%", fontSize: "2rem", animation: "lnd-sparkle 3s ease-in-out infinite", opacity: 0.4 }}>✨</span>
        <span style={{ position: "absolute", top: "20%", right: "10%", fontSize: "1.75rem", animation: "lnd-sparkle 4s ease-in-out infinite 1s", opacity: 0.35 }}>🌟</span>
        <span style={{ position: "absolute", top: "55%", left: "5%", fontSize: "2rem", animation: "lnd-sparkle 5s ease-in-out infinite 0.5s", opacity: 0.3 }}>⚡</span>
        <span style={{ position: "absolute", top: "70%", right: "7%", fontSize: "1.5rem", animation: "lnd-sparkle 3.5s ease-in-out infinite 2s", opacity: 0.35 }}>💫</span>
      </div>

      {/* ── HEADER ── */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(16px)",
        borderBottom: "2px solid rgba(167,139,250,0.2)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0.75rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <LandingMascotSvg size={36} noFloat floatDelay="0s" />
            <span style={{ fontFamily: "'Fredoka', system-ui, sans-serif", fontSize: "1.375rem", fontWeight: 700, color: "#1f2937", letterSpacing: "-0.01em" }}>
              <BrandName />
            </span>
          </div>
          <nav style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Link href="/admin/login" style={{ fontSize: "0.875rem", fontWeight: 700, color: "#6b7280", textDecoration: "none" }}>
              Teachers Sign In
            </Link>
            <Link
              href="/play"
              className="lnd-btn"
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.4rem",
                padding: "0.55rem 1.25rem", borderRadius: 999,
                border: "2.5px solid #e85d04",
                background: "linear-gradient(180deg, #ff9f43 0%, #ff6b35 100%)",
                fontFamily: "'Fredoka', system-ui, sans-serif",
                fontSize: "1rem", fontWeight: 800, color: "white",
                textDecoration: "none", textShadow: "0 1px 0 rgba(0,0,0,0.15)",
                boxShadow: "0 5px 0 #c44d00",
              }}
            >
              🎮 Play Now
            </Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "4rem 1.5rem 2rem", display: "flex", alignItems: "center", gap: "3rem", flexWrap: "wrap", justifyContent: "center" }}>
        {/* Left: text */}
        <div style={{ flex: "1 1 340px", maxWidth: 520 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
            padding: "0.4rem 1rem", borderRadius: 999,
            border: "2px solid #fcd34d",
            background: "linear-gradient(135deg, #fffbeb, #fde68a)",
            fontSize: "0.8rem", fontWeight: 800, letterSpacing: "0.06em",
            textTransform: "uppercase", color: "#92400e", marginBottom: "1.25rem",
            animation: "lnd-badge-glow 2.5s ease-in-out infinite",
          }}>
            <span style={{ animation: "lnd-sparkle 2s ease-in-out infinite" }}>✨</span>
            Learning adventures for kids
          </div>

          <h1 style={{
            fontFamily: "'Fredoka', system-ui, sans-serif",
            fontSize: "clamp(2.75rem, 6vw, 4.5rem)",
            fontWeight: 700, lineHeight: 1.1, color: "#111827",
            letterSpacing: "-0.02em", margin: "0 0 1rem",
          }}>
            Learn.{" "}
            <span style={{ background: "linear-gradient(135deg, #f97316, #fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Play.</span>
            <br />
            <span style={{ background: "linear-gradient(135deg, #a78bfa, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Level Up! 🚀</span>
          </h1>

          <p style={{ fontSize: "1.125rem", lineHeight: 1.6, color: "#4b5563", margin: "0 0 2rem", maxWidth: 440 }}>
            <strong><BrandName /></strong> turns boring quizzes into{" "}
            <span style={{ color: "#7c3aed", fontWeight: 700 }}>epic mini games</span>. Open the link from your email and start your quest — no sign-up needed!
          </p>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
            <Link
              href="/play"
              className="lnd-btn"
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                padding: "1rem 2.25rem", borderRadius: 999,
                border: "3.5px solid #e85d04",
                background: "linear-gradient(180deg, #ff9f43 0%, #ff6b35 100%)",
                fontFamily: "'Fredoka', system-ui, sans-serif",
                fontSize: "1.3rem", fontWeight: 800, color: "white",
                textDecoration: "none", textShadow: "0 2px 0 rgba(0,0,0,0.15)",
                boxShadow: "0 8px 0 #c44d00, 0 12px 24px rgba(255,107,53,0.3)",
              }}
            >
              🎯 Try a Practice Quest
            </Link>
            <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#9ca3af", maxWidth: 180 }}>
              Got an email invite? Tap that link first!
            </p>
          </div>
        </div>

        {/* Right: mascot cluster */}
        <div style={{ flex: "1 1 280px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", minHeight: 280 }}>
          {/* Main mascot */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <LandingMascotSvg size={180} expression="excited" floatDelay="0s" />
          </div>
          {/* Star in top-right */}
          <div style={{ position: "absolute", top: 0, right: 10, zIndex: 1 }}>
            <StarMascotSvg size={72} />
          </div>
          {/* Rocket in bottom-left */}
          <div style={{ position: "absolute", bottom: 0, left: 10, zIndex: 1 }}>
            <RocketMascotSvg size={64} />
          </div>
          {/* Speech bubble */}
          <div style={{
            position: "absolute", top: -20, right: -10,
            background: "white", border: "2.5px solid #e5e7eb",
            borderRadius: "1rem", borderBottomLeftRadius: "0.25rem",
            padding: "0.65rem 1rem", fontSize: "0.875rem", fontWeight: 700,
            color: "#374151", maxWidth: 160,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)", lineHeight: 1.4,
            animation: "lnd-float-alt 4s ease-in-out infinite",
          }}>
            {"Hi! I'm your quiz buddy! 🌟"}
          </div>
          {/* Score pill */}
          <div style={{
            position: "absolute", bottom: 10, right: -15,
            display: "flex", alignItems: "center", gap: "0.35rem",
            padding: "0.45rem 0.85rem", borderRadius: 999,
            background: "#fffbeb", border: "2px solid #fcd34d",
            color: "#92400e", fontSize: "0.9rem", fontWeight: 800,
            boxShadow: "0 4px 0 #fcd34d",
            animation: "lnd-float 5s ease-in-out 1s infinite",
          }}>
            ⭐ 240 pts
          </div>
          {/* Lives pill */}
          <div style={{
            position: "absolute", top: 60, left: -20,
            display: "flex", alignItems: "center", gap: "0.35rem",
            padding: "0.45rem 0.85rem", borderRadius: 999,
            background: "#fff1f0", border: "2px solid #fca5a5",
            color: "#dc2626", fontSize: "0.9rem", fontWeight: 800,
            boxShadow: "0 4px 0 #fca5a5",
            animation: "lnd-float-alt 4s ease-in-out 0.5s infinite",
          }}>
            🔥 7 lives
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 1.5rem 4rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h2 style={{
            fontFamily: "'Fredoka', system-ui, sans-serif",
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 700,
            color: "#111827", margin: "0 0 0.5rem", letterSpacing: "-0.01em",
          }}>
            How your quest works 🗺️
          </h2>
          <p style={{ color: "#6b7280", fontSize: "1.1rem", margin: 0 }}>Three simple steps to become a quiz champion!</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem" }}>
          {steps.map((step, i) => (
            <article
              key={step.title}
              className="lnd-step-card"
              style={{
                borderRadius: "2rem",
                border: `3.5px solid ${step.border}`,
                background: step.bg,
                padding: "2rem 1.5rem",
                textAlign: "center",
                boxShadow: `0 8px 0 ${step.shadow}`,
                position: "relative",
              }}
            >
              {/* Step number */}
              <div style={{
                position: "absolute", top: 14, right: 14,
                width: 28, height: 28, borderRadius: "50%",
                background: step.numColor, color: "white",
                fontSize: "0.875rem", fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 3px 0 rgba(0,0,0,0.15)",
              }}>
                {i + 1}
              </div>
              {/* Mascot */}
              <div style={{ marginBottom: "0.75rem", display: "flex", justifyContent: "center" }}>
                <LandingMascotSvg size={72} expression={step.expression} floatDelay={step.floatDelay} />
              </div>
              {/* Emoji icon */}
              <div style={{
                width: "3.5rem", height: "3.5rem", borderRadius: "1.25rem",
                background: "rgba(255,255,255,0.8)", border: `2.5px solid ${step.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.75rem", margin: "0 auto 0.875rem",
                boxShadow: `0 4px 0 ${step.shadow}`,
              }}>
                {step.emoji}
              </div>
              <h3 style={{ fontFamily: "'Fredoka', system-ui, sans-serif", fontSize: "1.25rem", fontWeight: 700, color: "#111827", margin: "0 0 0.5rem" }}>
                {step.title}
              </h3>
              <p style={{ fontSize: "0.9375rem", color: "#4b5563", margin: 0, lineHeight: 1.5 }}>
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem 5rem" }}>
        <div style={{
          borderRadius: "2rem",
          border: "3.5px solid #c4b5fd",
          background: "linear-gradient(145deg, #faf5ff 0%, #ede9fe 50%, #fce7f3 100%)",
          padding: "3rem 2rem", textAlign: "center",
          boxShadow: "0 10px 0 #a78bfa, 0 20px 40px rgba(167,139,250,0.2)",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -10, left: 20, opacity: 0.6 }}>
            <StarMascotSvg size={60} />
          </div>
          <div style={{ position: "absolute", bottom: -10, right: 20, opacity: 0.6 }}>
            <RocketMascotSvg size={60} />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <LandingMascotSvg size={100} expression="excited" floatDelay="0s" />
          </div>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
            padding: "0.3rem 0.9rem", borderRadius: 999,
            border: "1.5px solid #6ee7b7",
            background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
            fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.06em",
            textTransform: "uppercase", color: "#065f46", marginBottom: "1rem",
          }}>
            🌱 No sign-up required
          </div>

          <h2 style={{
            fontFamily: "'Fredoka', system-ui, sans-serif",
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 700,
            color: "#111827", margin: "0 0 0.75rem", letterSpacing: "-0.01em",
          }}>
            Ready to play? 🎯
          </h2>
          <p style={{ fontSize: "1.0625rem", color: "#4b5563", margin: "0 0 2rem", maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>
            Check your inbox for your quest link, or try a practice round first and meet your quiz buddy!
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/play"
              className="lnd-btn"
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                padding: "1rem 2.25rem", borderRadius: 999,
                border: "3.5px solid #e85d04",
                background: "linear-gradient(180deg, #ff9f43 0%, #ff6b35 100%)",
                fontFamily: "'Fredoka', system-ui, sans-serif",
                fontSize: "1.25rem", fontWeight: 800, color: "white",
                textDecoration: "none", textShadow: "0 2px 0 rgba(0,0,0,0.15)",
                boxShadow: "0 8px 0 #c44d00, 0 12px 24px rgba(255,107,53,0.3)",
              }}
            >
              🎮 Start Practice Quest
            </Link>
            <Link
              href="/admin/login"
              className="lnd-btn-secondary"
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                padding: "1rem 2.25rem", borderRadius: 999,
                border: "3.5px solid #7c3aed",
                background: "linear-gradient(180deg, #c4b5fd 0%, #a78bfa 100%)",
                fontFamily: "'Fredoka', system-ui, sans-serif",
                fontSize: "1.25rem", fontWeight: 800, color: "white",
                textDecoration: "none", textShadow: "0 2px 0 rgba(0,0,0,0.15)",
                boxShadow: "0 8px 0 #6d28d9, 0 12px 24px rgba(124,58,237,0.3)",
              }}
            >
              👩‍🏫 Teachers Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "2px solid rgba(167,139,250,0.2)", background: "rgba(255,255,255,0.5)", padding: "1.25rem 1.5rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'Fredoka', system-ui, sans-serif", fontWeight: 700, color: "#1f2937", fontSize: "1rem" }}>
            <BrandName />
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", fontSize: "0.875rem", color: "#9ca3af" }}>
            <Link href="/admin/login" style={{ fontWeight: 700, color: "#6b7280", textDecoration: "none" }}>
              Teachers Sign In
            </Link>
            <span>Made with 🌱 for tiny scientists</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
