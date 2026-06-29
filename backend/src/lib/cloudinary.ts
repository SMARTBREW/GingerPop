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

export { cloudinary };
