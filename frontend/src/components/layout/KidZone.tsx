import { Fredoka, Nunito } from "next/font/google";
import type { CSSProperties, ReactNode } from "react";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-game",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-kid",
});

export function KidZone({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`kid-zone kid-zone-bg ${fredoka.variable} ${nunito.variable} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
