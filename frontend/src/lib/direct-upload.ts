type MediaType = "image" | "video" | "audio";

interface SignResponse {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  publicId: string;
  resourceType: "image" | "video" | "raw";
  uploadParams: Record<string, string | number>;
  error?: string;
}

/** Upload straight to Cloudinary (faster than proxying through our API). */
export async function uploadMediaDirect(
  file: Blob,
  filename: string,
  mediaType: MediaType,
  onProgress?: (percent: number) => void,
): Promise<string> {
  const signRes = await fetch("/api/upload/sign", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mediaType, filename }),
  });
  const sign = (await signRes.json()) as SignResponse;
  if (!signRes.ok) {
    throw new Error(sign.error ?? "Could not start upload");
  }

  const formData = new FormData();
  formData.append("file", file, filename);
  formData.append("api_key", sign.apiKey);
  formData.append("timestamp", String(sign.timestamp));
  formData.append("signature", sign.signature);
  formData.append("folder", sign.folder);
  formData.append("public_id", sign.publicId);
  for (const [key, value] of Object.entries(sign.uploadParams)) {
    if (key === "timestamp" || key === "folder" || key === "public_id") continue;
    formData.append(key, String(value));
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${sign.cloudName}/${sign.resourceType}/upload`,
    );

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !onProgress) return;
      onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText) as { secure_url?: string; error?: { message?: string } };
        if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) {
          resolve(data.secure_url);
          return;
        }
        reject(new Error(data.error?.message ?? "Upload failed"));
      } catch {
        reject(new Error("Upload failed"));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed — check your connection"));
    xhr.send(formData);
  });
}
