import { Router, Request, Response } from "express";
import multer from "multer";
import { requireAdmin, sendAuthError } from "@/lib/permissions";
import { jsonError, jsonOk } from "@/lib/api";
import { cloudinaryResourceType, isCloudinaryConfigured, uploadToCloudinary } from "@/lib/cloudinary";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 80 * 1024 * 1024 },
});

const MAX_BYTES: Record<string, number> = {
  image: 10 * 1024 * 1024,
  audio: 15 * 1024 * 1024,
  video: 80 * 1024 * 1024,
};

const router = Router();

router.post("/", upload.single("file"), async (req: Request, res: Response) => {
  const auth = await requireAdmin(req);
  if ("error" in auth) return sendAuthError(res, auth);

  if (!isCloudinaryConfigured()) {
    return jsonError(res, "Cloudinary is not configured. Set CLOUDINARY_URL in .env", 503);
  }

  try {
    const file = req.file;
    const mediaType = String(req.body.mediaType ?? "auto");

    if (!file) {
      return jsonError(res, "No file provided", 400);
    }

    const limit = MAX_BYTES[mediaType] ?? MAX_BYTES.video;
    if (file.size > limit) {
      return jsonError(
        res,
        `File too large. Max ${Math.round(limit / (1024 * 1024))}MB for ${mediaType}.`,
        400,
      );
    }

    const mimeType = file.mimetype || "application/octet-stream";

    if (mediaType === "image" && !mimeType.startsWith("image/")) {
      return jsonError(res, "Invalid image file", 400);
    }
    if (mediaType === "audio" && !mimeType.startsWith("audio/") && !mimeType.startsWith("video/")) {
      return jsonError(res, "Invalid audio file", 400);
    }
    if (mediaType === "video" && !mimeType.startsWith("video/")) {
      return jsonError(res, "Invalid video file", 400);
    }

    const ext = file.originalname.split(".").pop()?.replace(/[^a-z0-9]/gi, "") ?? "media";
    const filename = `${mediaType}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const result = await uploadToCloudinary(file.buffer, {
      mimeType,
      folder: `ginger-pop/${mediaType}`,
      filename,
    });

    return jsonOk(res, {
      url: result.url,
      publicId: result.publicId,
      resourceType: cloudinaryResourceType(mimeType),
    });
  } catch (err) {
    console.error("Upload error:", err);
    return jsonError(res, err instanceof Error ? err.message : "Upload failed", 500);
  }
});

export default router;
