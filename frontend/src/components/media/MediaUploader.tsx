"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type MediaType = "audio" | "video" | "image";
type Step = "idle" | "recording" | "preview" | "uploading";

interface MediaUploaderProps {
  type: MediaType;
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

function pickMimeType(type: MediaType): string {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates =
    type === "audio"
      ? ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"]
      : ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"];
  return candidates.find((c) => MediaRecorder.isTypeSupported(c)) ?? "";
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MediaUploader({ type, value, onChange, label }: MediaUploaderProps) {
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [liveStream, setLiveStream] = useState<MediaStream | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setLiveStream(null);
  }, []);

  const cleanupPreview = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewBlob(null);
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      cleanupStream();
      if (timerRef.current) clearInterval(timerRef.current);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [cleanupStream, previewUrl]);

  useEffect(() => {
    const el = videoPreviewRef.current;
    if (el && liveStream) {
      el.srcObject = liveStream;
      el.play().catch(() => undefined);
    }
  }, [liveStream, step]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    mediaRecorderRef.current?.stop();
  }, []);

  const startRecording = async () => {
    setError("");
    cleanupPreview();

    try {
      const constraints: MediaStreamConstraints =
        type === "audio"
          ? { audio: true }
          : { audio: true, video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } } };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setLiveStream(stream);

      const mimeType = pickMimeType(type);
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        cleanupStream();
        const blob = new Blob(chunksRef.current, {
          type: mimeType || chunksRef.current[0]?.type || (type === "audio" ? "audio/webm" : "video/webm"),
        });
        const url = URL.createObjectURL(blob);
        setPreviewBlob(blob);
        setPreviewUrl(url);
        setStep("preview");
      };

      mediaRecorderRef.current = recorder;
      recorder.start(250);
      setStep("recording");
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch {
      setError(
        type === "audio"
          ? "Microphone access denied. Allow mic permission or upload a file."
          : "Camera/mic access denied. Allow permissions or upload a file.",
      );
    }
  };

  const discardPreview = () => {
    cleanupPreview();
    setStep("idle");
    setDuration(0);
  };

  const uploadBlob = async (blob: Blob, filename: string) => {
    setStep("uploading");
    setError("");

    const formData = new FormData();
    formData.append("file", blob, filename);
    formData.append("mediaType", type);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Upload failed");
      setStep("preview");
      return;
    }

    onChange(data.url);
    cleanupPreview();
    setStep("idle");
  };

  const uploadPreview = () => {
    if (!previewBlob) return;
    const ext = type === "audio" ? "webm" : "webm";
    uploadBlob(previewBlob, `recording-${Date.now()}.${ext}`);
  };

  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError("");
    cleanupPreview();
    await uploadBlob(file, file.name);
  };

  const removeMedia = () => {
    onChange("");
    discardPreview();
    setError("");
  };

  const typeLabel = type === "audio" ? "voice note" : type === "video" ? "video" : "image";

  return (
    <div className="w-full">
      {label && <p className="mb-2 text-sm font-medium text-gray-700">{label}</p>}

      {/* Existing uploaded media */}
      {value && step === "idle" && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-emerald-700">
              Uploaded
            </span>
            <Button variant="ghost" size="sm" className="!text-red-600" onClick={removeMedia}>
              Remove
            </Button>
          </div>
          {type === "image" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Uploaded" className="max-h-48 rounded-md object-contain" />
          )}
          {type === "audio" && <audio src={value} controls className="w-full" />}
          {type === "video" && (
            <video src={value} controls playsInline className="w-full max-h-64 rounded-md" />
          )}
          <p className="mt-2 truncate text-xs text-gray-400">{value}</p>
        </div>
      )}

      {/* WhatsApp-style recorder panel */}
      {(type === "audio" || type === "video") && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          {step === "idle" && !value && (
            <div className="flex flex-col items-center py-4">
              <button
                type="button"
                onClick={startRecording}
                className={cn(
                  "flex h-16 w-16 items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95",
                  type === "audio" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600",
                )}
                aria-label={`Record ${typeLabel}`}
              >
                {type === "audio" ? (
                  <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2zm-1 4h-2v6h-2v-6H9v6H7v-6H5v8h14v-8h-2z" />
                  </svg>
                ) : (
                  <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 10.5V7a5 5 0 00-10 0v3.5a5 5 0 0010 0zM12 16a3 3 0 01-3-3V7a3 3 0 116 0v6a3 3 0 01-3 3zm-7 0h2v2H5v-2zm12 0h2v2h-2v-2z" />
                  </svg>
                )}
              </button>
              <p className="mt-4 text-sm font-medium text-gray-700">
                Tap to record {typeLabel}
              </p>
              <p className="mt-1 text-xs text-gray-400">Like WhatsApp — record, preview, then upload</p>
            </div>
          )}

          {step === "recording" && (
            <div className="flex flex-col items-center py-2">
              {type === "video" && (
                <video
                  ref={videoPreviewRef}
                  muted
                  playsInline
                  className="mb-4 w-full max-h-52 rounded-lg bg-black object-cover"
                />
              )}
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                </span>
                <span className="text-sm font-medium tabular-nums text-gray-700">
                  Recording {formatDuration(duration)}
                </span>
              </div>
              <Button variant="danger" className="mt-5" onClick={stopRecording}>
                Stop recording
              </Button>
            </div>
          )}

          {step === "preview" && previewUrl && (
            <div className="flex flex-col items-center py-2">
              {type === "audio" && <audio src={previewUrl} controls className="mb-4 w-full" />}
              {type === "video" && (
                <video src={previewUrl} controls playsInline className="mb-4 w-full max-h-52 rounded-lg" />
              )}
              <p className="mb-4 text-sm text-gray-600">Preview your {typeLabel} before uploading</p>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={discardPreview}>
                  Discard
                </Button>
                <Button onClick={uploadPreview}>Upload to Cloudinary</Button>
              </div>
            </div>
          )}

          {step === "uploading" && (
            <div className="flex flex-col items-center py-8">
              <div className="spinner mb-3" />
              <p className="text-sm text-gray-600">Uploading to Cloudinary...</p>
            </div>
          )}

          {step === "idle" && (
            <div className="mt-4 border-t border-gray-100 pt-4 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept={type === "audio" ? "audio/*" : "video/*"}
                className="hidden"
                onChange={handleFilePick}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm font-medium text-[var(--primary)] hover:underline"
              >
                Or upload {type === "audio" ? "an audio" : "a video"} file
              </button>
            </div>
          )}
        </div>
      )}

      {/* Image upload */}
      {type === "image" && (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-5 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFilePick}
          />
          {step === "uploading" ? (
            <div className="py-6">
              <div className="spinner mx-auto mb-3" />
              <p className="text-sm text-gray-600">Uploading image...</p>
            </div>
          ) : (
            <>
              <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                Choose image
              </Button>
              <p className="mt-2 text-xs text-gray-400">PNG, JPG, WebP · max 10MB</p>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
