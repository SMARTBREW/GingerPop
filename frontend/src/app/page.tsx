import Link from "next/link";
import { BrandName } from "@/components/BrandName";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

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

function StarMascotSvg({ size = 80, noFloat = false }: { size?: number; noFloat?: boolean }) {
  return (
    <div style={{ width: size, height: size, display: "inline-block", animation: noFloat ? undefined : "lnd-float-alt 4s ease-in-out infinite" }}>
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

function RocketMascotSvg({ size = 80, noFloat = false }: { size?: number; noFloat?: boolean }) {
  return (
    <div style={{ width: size, height: size, display: "inline-block", animation: noFloat ? undefined : "lnd-rocket 5s ease-in-out infinite" }}>
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
        display: "flex",
        flexDirection: "column",
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
        .site-header-play-btn {
          transition: transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.15s ease;
        }
        .site-header-play-btn:hover { transform: translateY(-3px); }
        .site-header-play-btn:active { transform: translateY(2px); }
        .lnd-hero {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
          padding: 5.5rem 1.75rem 4rem;
          display: flex;
          align-items: center;
          gap: 4.5rem;
          flex-wrap: wrap;
          justify-content: space-between;
        }
        .lnd-hero-copy {
          flex: 1 1 360px;
          max-width: 500px;
        }
        .lnd-hero-headline-wrap {
          position: relative;
          isolation: isolate;
          margin-bottom: 1.25rem;
        }
        .lnd-hero-blobs {
          position: absolute;
          inset: -1.5rem -0.5rem -0.75rem -0.5rem;
          z-index: 0;
          pointer-events: none;
          overflow: visible;
        }
        .lnd-hero-blob {
          position: absolute;
          border-radius: 50%;
          animation: lnd-blob-pulse 6s ease-in-out infinite;
        }
        .lnd-hero-blob--yellow {
          width: clamp(160px, 52%, 240px);
          aspect-ratio: 1;
          left: -4%;
          top: 28%;
          background: #ffe566;
          opacity: 0.62;
        }
        .lnd-hero-blob--purple {
          width: clamp(140px, 46%, 210px);
          aspect-ratio: 1;
          left: 34%;
          top: 6%;
          background: #a78bfa;
          opacity: 0.52;
          animation-delay: 1s;
          animation-duration: 7s;
        }
        .lnd-hero-headline-content {
          position: relative;
          z-index: 1;
        }
        .lnd-hero-headline-content h1 {
          filter: drop-shadow(0 2px 14px rgba(255, 255, 255, 0.95))
            drop-shadow(0 1px 0 rgba(255, 255, 255, 0.85));
        }
        .lnd-hero-mascot--desktop {
          flex: 0 1 340px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          min-height: 340px;
          margin-left: auto;
          margin-right: auto;
        }
        .lnd-hero-mascot--mobile {
          display: none;
        }
        .lnd-page-blobs {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .lnd-page-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        @media (min-width: 900px) {
          .lnd-hero-blobs {
            display: none;
          }
          .lnd-hero-headline-wrap {
            margin-bottom: 0;
          }
          .lnd-hero-headline-content h1 {
            font-family: "Fredoka", system-ui, sans-serif;
            font-size: clamp(2.5rem, 5.5vw, 4rem);
            font-weight: 700;
            line-height: 1.15;
            letter-spacing: -0.02em;
            margin-bottom: 1.35rem;
            white-space: normal;
            filter: none;
          }
          .lnd-hero-copy p.lnd-hero-lead {
            font-size: 1.125rem;
            line-height: 1.7;
            margin-bottom: 2.25rem;
            max-width: 440px;
          }
        }
        @media (max-width: 899px) {
          .lnd-page-blobs {
            display: none;
          }
          .lnd-hero {
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            gap: 2rem;
            padding: 3rem 1rem 2.5rem;
          }
          .lnd-hero-copy {
            flex: 0 0 auto;
            width: 100%;
            max-width: 100%;
            text-align: center;
          }
          .lnd-hero-copy .lnd-hero-actions {
            justify-content: center;
          }
          .lnd-hero-headline-wrap {
            display: inline-block;
            width: 100%;
            max-width: 520px;
            margin-left: auto;
            margin-right: auto;
          }
          .lnd-hero-headline-content {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .lnd-hero-blob--yellow {
            left: 12%;
            top: 32%;
          }
          .lnd-hero-blob--purple {
            left: 48%;
            top: 8%;
          }
          .lnd-hero-mascot--desktop {
            display: none;
          }
          .lnd-hero-mascot--mobile {
            position: relative;
            z-index: 1;
            margin: 0 auto;
            display: flex;
            flex: 0 0 auto;
            align-items: center;
            justify-content: center;
            width: min(100%, 340px);
            min-height: 240px;
          }
        }
        @media (max-width: 640px) {
          .lnd-hero {
            padding: 3rem 1rem 2.5rem;
            gap: 1.75rem;
          }
          .lnd-hero-mascot--mobile {
            min-height: 220px;
          }
        }
        .lnd-steps-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        @media (min-width: 640px) and (max-width: 899px) {
          .lnd-steps-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }
        }
        @media (min-width: 900px) {
          .lnd-steps-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 2.25rem;
          }
        }
        .lnd-section-steps {
          max-width: 1100px;
          margin: 0 auto;
          padding: 4rem 1.75rem 5rem;
        }
        @media (max-width: 640px) {
          .lnd-section-steps {
            padding: 2.5rem 1rem 3rem;
          }
        }
        .lnd-section-cta {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 1.75rem 6rem;
        }
        @media (max-width: 640px) {
          .lnd-section-cta {
            padding: 0 1rem 3rem;
          }
        }
      `}</style>

      {/* Decorative floating blobs (page background — not hero headline) */}
      <div className="lnd-page-blobs" aria-hidden>
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

      <div className="lnd-page-content">
      {/* ── HEADER ── */}
      <SiteHeader />

      {/* ── HERO ── */}
      <section className="lnd-hero">
        {/* Left: text */}
        <div className="lnd-hero-copy">
          <div className="lnd-hero-headline-wrap">
            <div className="lnd-hero-blobs" aria-hidden>
              <div className="lnd-hero-blob lnd-hero-blob--yellow" />
              <div className="lnd-hero-blob lnd-hero-blob--purple" />
            </div>
            <div className="lnd-hero-headline-content">
              <div className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border-2 border-[#fcd34d] bg-gradient-to-r from-[#fffbeb] to-[#fde68a] px-3 py-2 text-[0.65rem] font-extrabold uppercase tracking-wider text-[#92400e] sm:gap-2 sm:px-4 sm:text-xs md:text-sm"
                style={{ animation: "lnd-badge-glow 2.5s ease-in-out infinite", marginBottom: "1.75rem" }}
              >
                <span style={{ animation: "lnd-sparkle 2s ease-in-out infinite" }}>✨</span>
                <span className="hidden sm:inline">Learning adventures for kids</span>
                <span className="sm:hidden">For kids</span>
              </div>

              <h1 className="game-font mb-0 whitespace-nowrap text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl">
                <span className="block sm:inline">Learn. </span>
                <span className="bg-gradient-to-r from-[#f97316] to-[#fb923c] bg-clip-text text-transparent">Play.</span>
                <br />
                <span className="bg-gradient-to-r from-[#a78bfa] to-[#ec4899] bg-clip-text text-transparent">Level Up! 🚀</span>
              </h1>
            </div>
          </div>

          <p className="lnd-hero-lead mb-8 max-w-md text-sm leading-relaxed text-gray-600 sm:mb-9 sm:text-base md:text-lg min-[900px]:text-[1.125rem] min-[900px]:leading-[1.7] min-[900px]:text-[#4b5563]">
            <strong><BrandName /></strong> turns boring quizzes into{" "}
            <span className="font-bold text-purple-600">epic mini games</span>. Open the link from your email and start your quest — no sign-up needed!
          </p>

          <div className="lnd-hero-actions flex flex-wrap items-center gap-4 sm:gap-5">
            <Link
              href="/subjects"
              className="lnd-btn inline-flex min-h-[52px] items-center gap-2 whitespace-nowrap rounded-full border-[3.5px] border-[#e85d04] bg-gradient-to-b from-[#ff9f43] to-[#ff6b35] px-5 py-3 text-base font-extrabold text-white shadow-[0_8px_0_#c44d00,0_12px_24px_rgba(255,107,53,0.3)] sm:min-h-[56px] sm:px-8 sm:py-4 sm:text-lg md:text-xl"
              style={{ fontFamily: "'Fredoka', system-ui, sans-serif", textShadow: "0 2px 0 rgba(0,0,0,0.15)" }}
            >
              🎯 <span className="hidden sm:inline">Try a Practice Quest</span>
              <span className="sm:hidden">Practice Quest</span>
            </Link>
            <p className="max-w-[160px] whitespace-normal text-xs font-bold leading-snug text-gray-400 sm:max-w-[180px] sm:text-sm">
              Got an email invite? Tap that link first!
            </p>
          </div>
        </div>

        {/* Desktop mascot cluster (original layout) */}
        <div className="lnd-hero-mascot--desktop">
          <div style={{ position: "relative", zIndex: 2 }}>
            <LandingMascotSvg size={200} expression="excited" floatDelay="0s" />
          </div>
          <div style={{ position: "absolute", top: 8, right: 0, zIndex: 1 }}>
            <StarMascotSvg size={64} />
          </div>
          <div style={{ position: "absolute", bottom: 8, left: 0, zIndex: 1 }}>
            <RocketMascotSvg size={58} />
          </div>
          <div
            style={{
              position: "absolute",
              top: 0,
              right: -8,
              background: "white",
              border: "2.5px solid #e5e7eb",
              borderRadius: "1rem",
              borderBottomLeftRadius: "0.25rem",
              padding: "0.65rem 1rem",
              fontSize: "0.875rem",
              fontWeight: 700,
              color: "#374151",
              maxWidth: 150,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              lineHeight: 1.4,
              animation: "lnd-float-alt 4s ease-in-out infinite",
            }}
          >
            {"Hi! I'm your quiz buddy! 🌟"}
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 24,
              right: 0,
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.45rem 0.85rem",
              borderRadius: 999,
              background: "#fffbeb",
              border: "2px solid #fcd34d",
              color: "#92400e",
              fontSize: "0.9rem",
              fontWeight: 800,
              boxShadow: "0 4px 0 #fcd34d",
              animation: "lnd-float 5s ease-in-out 1s infinite",
            }}
          >
            ⭐ 240 pts
          </div>
          <div
            style={{
              position: "absolute",
              top: 80,
              left: 0,
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.45rem 0.85rem",
              borderRadius: 999,
              background: "#fff1f0",
              border: "2px solid #fca5a5",
              color: "#dc2626",
              fontSize: "0.9rem",
              fontWeight: 800,
              boxShadow: "0 4px 0 #fca5a5",
              animation: "lnd-float-alt 4s ease-in-out 0.5s infinite",
            }}
          >
            🔥 7 lives
          </div>
        </div>

        {/* Mobile mascot cluster */}
        <div className="lnd-hero-mascot--mobile">
          <div
            className="relative"
            style={{ animation: "lnd-float 3s ease-in-out infinite" }}
          >
            <LandingMascotSvg size={160} expression="excited" floatDelay="0s" noFloat />
            {/* Star in top-right */}
            <div className="absolute -right-2 -top-3">
              <StarMascotSvg size={48} noFloat />
            </div>
            {/* Rocket in bottom-left */}
            <div className="absolute -bottom-1 -left-4">
              <RocketMascotSvg size={44} noFloat />
            </div>
            {/* Speech bubble */}
            <div className="absolute -right-4 -top-10 max-w-[120px] whitespace-normal rounded-2xl rounded-bl-sm border-[2.5px] border-gray-200 bg-white px-3 py-2 text-[0.7rem] font-bold leading-snug text-gray-600 shadow-lg sm:max-w-[140px] sm:px-4 sm:py-2.5 sm:text-xs md:max-w-[150px] md:text-sm">
              {"Hi! I'm your quiz buddy! 🌟"}
            </div>
            {/* Score pill */}
            <div className="absolute -bottom-2 -right-6 flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-[#fcd34d] bg-[#fffbeb] px-2.5 py-1.5 text-xs font-extrabold text-[#92400e] shadow-[0_4px_0_#fcd34d] sm:px-3 sm:py-2 sm:text-sm">
              ⭐ 240 pts
            </div>
            {/* Lives pill */}
            <div className="absolute -left-8 top-10 flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-[#fca5a5] bg-[#fff1f0] px-2.5 py-1.5 text-xs font-extrabold text-red-600 shadow-[0_4px_0_#fca5a5] sm:top-12 sm:px-3 sm:py-2 sm:text-sm">
              🔥 7 lives
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="lnd-section-steps">
        <div className="mb-10 text-center sm:mb-12">
          <h2 className="game-font mb-3 whitespace-nowrap text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-4xl">
            How your quest works 🗺️
          </h2>
          <p className="m-0 whitespace-normal text-base leading-relaxed text-gray-600 sm:text-lg md:text-xl">
            Three simple steps to become a quiz champion!
          </p>
        </div>

        <div className="lnd-steps-grid">
          {steps.map((step, i) => (
            <article
              key={step.title}
              className="lnd-step-card relative rounded-[2rem] border-[3.5px] px-6 py-8 text-center shadow-[0_8px_0] sm:px-7 sm:py-9"
              style={{
                borderColor: step.border,
                background: step.bg,
                boxShadow: `0 8px 0 ${step.shadow}`,
              }}
            >
              {/* Step number */}
              <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold text-white shadow-[0_3px_0_rgba(0,0,0,0.15)] sm:h-8 sm:w-8 sm:text-sm"
                style={{ background: step.numColor }}
              >
                {i + 1}
              </div>
              {/* Mascot */}
              <div className="mb-3 flex justify-center sm:mb-4">
                <LandingMascotSvg size={64} expression={step.expression} floatDelay={step.floatDelay} />
              </div>
              {/* Emoji icon */}
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border-[2.5px] text-2xl shadow-[0_4px_0] sm:mb-4 sm:h-14 sm:w-14 sm:text-3xl"
                style={{
                  background: "rgba(255,255,255,0.8)",
                  borderColor: step.border,
                  boxShadow: `0 4px 0 ${step.shadow}`,
                }}
              >
                {step.emoji}
              </div>
              <h3 className="game-font mb-2 whitespace-nowrap text-lg font-bold text-gray-900 sm:mb-3 sm:text-xl md:text-2xl">
                {step.title}
              </h3>
              <p className="m-0 whitespace-normal text-sm leading-relaxed text-gray-600 sm:text-base">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="lnd-section-cta">
        <div className="relative overflow-hidden rounded-[2rem] border-[3.5px] border-[#c4b5fd] bg-gradient-to-br from-[#faf5ff] via-[#ede9fe] to-[#fce7f3] px-4 py-10 text-center shadow-[0_10px_0_#a78bfa,0_20px_40px_rgba(167,139,250,0.2)] sm:px-6 sm:py-12 md:px-8 md:py-14">
          <div className="pointer-events-none absolute left-4 top-3 opacity-55 sm:left-6">
            <StarMascotSvg size={40} />
          </div>
          <div className="pointer-events-none absolute bottom-3 right-4 opacity-55 sm:right-6">
            <RocketMascotSvg size={40} />
          </div>

          <div className="mb-4 sm:mb-5">
            <LandingMascotSvg size={80} expression="excited" floatDelay="0s" />
          </div>

          <h2 className="game-font mb-3 whitespace-nowrap text-2xl font-bold tracking-tight text-gray-900 sm:mb-4 sm:text-3xl md:text-4xl">
            Ready to play? 🎯
          </h2>
          <p className="mx-auto mb-8 max-w-md whitespace-normal text-sm leading-relaxed text-gray-600 sm:mb-9 sm:text-base md:text-lg">
            Check your inbox for your quest link, or try a practice round first and meet your quiz buddy!
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-5">
            <Link
              href="/subjects"
              className="lnd-btn inline-flex min-h-[52px] items-center gap-2 whitespace-nowrap rounded-full border-[3.5px] border-[#e85d04] bg-gradient-to-b from-[#ff9f43] to-[#ff6b35] px-6 py-3 text-base font-extrabold text-white shadow-[0_8px_0_#c44d00,0_12px_24px_rgba(255,107,53,0.3)] sm:min-h-[56px] sm:px-8 sm:py-4 sm:text-lg md:text-xl"
              style={{ fontFamily: "'Fredoka', system-ui, sans-serif", textShadow: "0 2px 0 rgba(0,0,0,0.15)" }}
            >
              🎮 <span className="hidden sm:inline">Start Practice Quest</span>
              <span className="sm:hidden">Practice Quest</span>
            </Link>
            <Link
              href="/login"
              className="lnd-btn-secondary inline-flex min-h-[52px] items-center gap-2 whitespace-nowrap rounded-full border-[3.5px] border-[#7c3aed] bg-gradient-to-b from-[#c4b5fd] to-[#a78bfa] px-6 py-3 text-base font-extrabold text-white shadow-[0_8px_0_#6d28d9,0_12px_24px_rgba(124,58,237,0.3)] sm:min-h-[56px] sm:px-8 sm:py-4 sm:text-lg md:text-xl"
              style={{ fontFamily: "'Fredoka', system-ui, sans-serif", textShadow: "0 2px 0 rgba(0,0,0,0.15)" }}
            >
              🔐 Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <SiteFooter />
      </div>
    </div>
  );
}
