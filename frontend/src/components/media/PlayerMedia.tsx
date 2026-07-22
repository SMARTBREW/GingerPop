"use client";

import { CSSProperties, useState } from "react";
import { optimizeMediaUrl } from "@/lib/media-url";

function MediaPlaceholder({ label }: { label: string }) {
  return (
    <div className="player-visual-placeholder" aria-hidden>
      {label}
    </div>
  );
}

export function PlayerImage({
  src,
  alt = "",
  style,
  className,
}: {
  src?: string | null;
  alt?: string;
  style?: CSSProperties;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const optimized = optimizeMediaUrl(src, "image");

  if (!optimized) return null;
  if (failed) return <MediaPlaceholder label="Image could not load" />;

  return (
    <div className="player-visual-wrap" style={style}>
      {!loaded && <MediaPlaceholder label="Loading image…" />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={optimized}
        alt={alt}
        decoding="async"
        loading="eager"
        fetchPriority="high"
        className={`player-visual-media player-visual-media--image ${className ?? ""}`}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        style={{ display: loaded ? "block" : "none" }}
      />
    </div>
  );
}

export function PlayerVideo({
  src,
  style,
  className,
}: {
  src?: string | null;
  style?: CSSProperties;
  className?: string;
}) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const optimized = optimizeMediaUrl(src, "video");

  if (!optimized) return null;
  if (failed) return <MediaPlaceholder label="Video could not load" />;

  return (
    <div className="player-visual-wrap" style={style}>
      {!ready && <MediaPlaceholder label="Loading video…" />}
      <video
        src={optimized}
        controls
        playsInline
        preload="metadata"
        className={`player-visual-media player-visual-media--video ${className ?? ""}`}
        onLoadedData={() => setReady(true)}
        onError={() => setFailed(true)}
        style={{ display: ready ? "block" : "none" }}
      />
    </div>
  );
}
