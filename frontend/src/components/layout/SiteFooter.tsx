import Link from "next/link";
import { BrandName } from "@/components/BrandName";

export function SiteFooter({
  showAuthLinks = true,
}: {
  showAuthLinks?: boolean;
}) {
  return (
    <footer
      style={{
        marginTop: "auto",
        borderTop: "2px solid rgba(167,139,250,0.2)",
        background: "rgba(255,255,255,0.5)",
        padding: "1.25rem 1.5rem",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-game), Fredoka, system-ui, sans-serif",
            fontWeight: 700,
            color: "#1f2937",
            fontSize: "1rem",
          }}
        >
          <BrandName />
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.25rem",
            fontSize: "0.875rem",
            color: "#9ca3af",
            flexWrap: "wrap",
          }}
        >
          {showAuthLinks && (
            <Link href="/login" style={{ fontWeight: 700, color: "#6b7280", textDecoration: "none" }}>
              Sign in
            </Link>
          )}
          <span>Made with 🌱 for tiny scientists</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
