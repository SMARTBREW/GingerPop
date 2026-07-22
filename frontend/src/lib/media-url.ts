type MediaKind = "image" | "video" | "audio";

/** Return media URL for playback. Cloudinary URLs are used as stored — injected transforms break legacy assets. */
export function optimizeMediaUrl(
  url: string | undefined | null,
  _kind?: MediaKind,
): string | undefined {
  const trimmed = url?.trim();
  return trimmed || undefined;
}
