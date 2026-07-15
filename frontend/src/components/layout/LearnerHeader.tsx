import type { CSSProperties } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";

interface LearnerHeaderProps {
  courseTitle: string;
  invitedBy?: { name: string; email?: string } | null;
}

export function LearnerHeader({ courseTitle, invitedBy }: LearnerHeaderProps) {
  const titleStyle: CSSProperties = {
    display: "block",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: "1rem",
    fontWeight: 700,
    color: "#1f2937",
    maxWidth: "min(100%, 18rem)",
  };

  return (
    <SiteHeader
      actions={
        <div style={{ textAlign: "right", minWidth: 0, maxWidth: "min(100%, 22rem)" }}>
          <span style={titleStyle}>{courseTitle}</span>
          {invitedBy && (
            <span
              style={{
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#6b7280",
              }}
            >
              Invited by {invitedBy.name}
            </span>
          )}
        </div>
      }
    />
  );
}
