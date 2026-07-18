import { v2 as cloudinary } from "cloudinary";

function configureCloudinary() {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL, secure: true });
    return;
  }

  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ?? process.env.CLOUDINARY_CLOUDNAME ?? process.env.Cloudname;
  const apiKey = process.env.CLOUDINARY_API_KEY ?? process.env.CLOUDINARY_APIKEY ?? process.env.APIkey;
  const apiSecret =
    process.env.CLOUDINARY_API_SECRET ?? process.env.CLOUDINARY_APISECRET ?? process.env.APIsecret;

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName.trim(),
      api_key: apiKey.trim(),
      api_secret: apiSecret.trim(),
      secure: true,
    });
  }
}

configureCloudinary();

export function isCloudinaryConfigured() {
  return Boolean(cloudinary.config().cloud_name && cloudinary.config().api_key);
}

export function cloudinaryResourceType(mimeType: string): "image" | "video" | "raw" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "video";
  return "raw";
}

export async function uploadToCloudinary(
  buffer: Buffer,
  options: {
    mimeType: string;
    folder?: string;
    filename?: string;
  },
) {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured. Add CLOUDINARY_URL to .env");
  }

  const resourceType = cloudinaryResourceType(options.mimeType);

  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: options.folder ?? "ginger-pop",
        public_id: options.filename,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Upload failed"));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
}

export type CloudinaryResourceType = "image" | "video" | "raw";

export function parseCloudinaryUrl(
  url: string,
): { publicId: string; resourceType: CloudinaryResourceType } | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("res.cloudinary.com")) return null;

    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length < 4) return null;

    const resourceType = parts[1] as CloudinaryResourceType;
    if (!["image", "video", "raw"].includes(resourceType)) return null;

    const uploadIdx = parts.indexOf("upload");
    if (uploadIdx === -1) return null;

    let startIdx = uploadIdx + 1;
    if (parts[startIdx]?.startsWith("v")) startIdx++;

    const publicIdWithExt = parts.slice(startIdx).join("/");
    if (!publicIdWithExt) return null;

    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, "");
    return { publicId, resourceType };
  } catch {
    return null;
  }
}

export async function deleteCloudinaryByUrl(url: string) {
  if (!url || !isCloudinaryConfigured()) return { deleted: false, reason: "not_configured" as const };

  const parsed = parseCloudinaryUrl(url);
  if (!parsed) return { deleted: false, reason: "not_cloudinary" as const };

  try {
    const result = await cloudinary.uploader.destroy(parsed.publicId, {
      resource_type: parsed.resourceType,
    });
    return { deleted: result.result === "ok", reason: result.result };
  } catch (err) {
    console.error("Cloudinary delete error:", err);
    return { deleted: false, reason: "error" as const };
  }
}

export async function deleteCloudinaryUrls(urls: string[]) {
  const unique = [...new Set(urls.filter(Boolean))];
  await Promise.allSettled(unique.map((url) => deleteCloudinaryByUrl(url)));
}

export function collectCourseMediaUrls(course: {
  lessons?: {
    mediaUrl?: string;
    imageUrl?: string;
    videoUrl?: string;
    audioUrl?: string;
    pages?: { imageUrl?: string; videoUrl?: string; audioUrl?: string }[];
  }[];
  quizQuestions?: { mediaUrl?: string; imageUrl?: string; videoUrl?: string; audioUrl?: string }[];
}): string[] {
  const urls: string[] = [];
  for (const lesson of course.lessons ?? []) {
    if (lesson.mediaUrl) urls.push(lesson.mediaUrl);
    if (lesson.imageUrl) urls.push(lesson.imageUrl);
    if (lesson.videoUrl) urls.push(lesson.videoUrl);
    if (lesson.audioUrl) urls.push(lesson.audioUrl);
    for (const page of lesson.pages ?? []) {
      if (page.imageUrl) urls.push(page.imageUrl);
      if (page.videoUrl) urls.push(page.videoUrl);
      if (page.audioUrl) urls.push(page.audioUrl);
    }
  }
  for (const question of course.quizQuestions ?? []) {
    if (question.mediaUrl) urls.push(question.mediaUrl);
    if (question.imageUrl) urls.push(question.imageUrl);
    if (question.videoUrl) urls.push(question.videoUrl);
    if (question.audioUrl) urls.push(question.audioUrl);
  }
  return urls;
}

export { cloudinary };
