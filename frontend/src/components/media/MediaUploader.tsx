"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

import { createSpeechRecognition, isSpeechRecognitionSupported, type SpeechRecognitionEvent } from "@/lib/speech-recognition";
import { compressImageFile, formatFileSize } from "@/lib/compress-media";
import { uploadMediaDirect } from "@/lib/direct-upload";

type MediaType = "audio" | "video" | "image";
type Step = "idle" | "recording" | "preview" | "uploading" | "compressing";

interface MediaUploaderProps {
  type: MediaType;
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  /** Called with live/final transcript while recording audio */
  onTranscript?: (text: string) => void;
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

export function MediaUploader({ type, value, onChange, label, onTranscript }: MediaUploaderProps) {
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [liveStream, setLiveStream] = useState<MediaStream | null>(null);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<ReturnType<typeof createSpeechRecognition>>(null);
  const speechSupported = isSpeechRecognitionSupported();

  const stopTranscription = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
  }, []);

  const startTranscription = useCallback(() => {
    if (type !== "audio" || !onTranscript || !speechSupported) return;
    const recognition = createSpeechRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    setTranscript("");
    setInterimTranscript("");

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let finals = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) finals += result[0].transcript;
        else interim += result[0].transcript;
      }
      if (finals.trim()) {
        setTranscript((prev) => `${prev}${finals}`.trimStart());
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = () => stopTranscription();
    recognition.start();
  }, [onTranscript, speechSupported, stopTranscription, type]);

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
      stopTranscription();
      if (timerRef.current) clearInterval(timerRef.current);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [cleanupStream, stopTranscription, previewUrl]);

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
    stopTranscription();
    mediaRecorderRef.current?.stop();
  }, [stopTranscription]);

  const startRecording = async () => {
    setError("");
    cleanupPreview();

    try {
      const constraints: MediaStreamConstraints =
        type === "audio"
          ? { audio: true }
          : { audio: true, video: { facingMode: "user", width: { ideal: 854, max: 854 }, height: { ideal: 480, max: 480 }, frameRate: { ideal: 24, max: 30 } } };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setLiveStream(stream);

      const mimeType = pickMimeType(type);
      const recorderOptions: MediaRecorderOptions = { mimeType: mimeType || undefined };
      if (mimeType) {
        recorderOptions.audioBitsPerSecond = 96_000;
        if (type === "video") recorderOptions.videoBitsPerSecond = 750_000;
      }
      const recorder = mimeType
        ? new MediaRecorder(stream, recorderOptions)
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
        if (type === "audio") {
          setTimeout(() => flushTranscriptOnStop(), 300);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start(250);
      setStep("recording");
      setDuration(0);
      if (type === "audio") startTranscription();
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
    stopTranscription();
    setTranscript("");
    setInterimTranscript("");
    setStep("idle");
    setDuration(0);
  };

  const insertTranscript = () => {
    const text = `${transcript} ${interimTranscript}`.trim();
    if (text && onTranscript) {
      onTranscript(text);
      setInterimTranscript("");
    }
  };

  const flushTranscriptOnStop = useCallback(() => {
    const text = `${transcript} ${interimTranscript}`.trim();
    if (text && onTranscript) onTranscript(text);
  }, [interimTranscript, onTranscript, transcript]);

  const uploadBlob = async (blob: Blob, filename: string) => {
    setStep("uploading");
    setError("");
    setUploadProgress(0);

    try {
      const url = await uploadMediaDirect(blob, filename, type, setUploadProgress);
      onChange(url);
      cleanupPreview();
      setStep("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setStep("preview");
    } finally {
      setUploadProgress(0);
    }
  };

  const buildUploadFilename = (name: string, ext: string) => {
    const base = name.replace(/\.[^/.]+$/, "") || name;
    return `${base}.${ext}`;
  };

  const prepareAndUpload = async (file: Blob, filename: string) => {
    if (type === "image" && file instanceof File) {
      setStep("compressing");
      try {
        const compressed = await compressImageFile(file);
        const ext = compressed.type === "image/jpeg" ? "jpg" : filename.split(".").pop() || "jpg";
        await uploadBlob(compressed, buildUploadFilename(filename, ext));
      } catch {
        await uploadBlob(file, filename);
      }
      return;
    }

    if (type === "video" && file.size > 25 * 1024 * 1024) {
      setError(`Large video (${formatFileSize(file.size)}). Try a shorter clip or lower resolution for faster upload.`);
      setStep("preview");
      return;
    }

    if (type === "audio" && file.size > 8 * 1024 * 1024) {
      setError(`Large audio file (${formatFileSize(file.size)}). Try a shorter recording.`);
      setStep("preview");
      return;
    }

    await uploadBlob(file, filename);
  };

  const uploadPreview = () => {
    if (!previewBlob) return;
    const ext = type === "audio" ? "webm" : "webm";
    void prepareAndUpload(previewBlob, `recording-${Date.now()}.${ext}`);
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError("");
    cleanupPreview();

    if (type === "image") {
      void prepareAndUpload(file, file.name);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewBlob(file);
    setPreviewUrl(url);
    setStep("preview");
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
          {type === "audio" && onTranscript && transcript && (
            <div className="mt-3 rounded-md border border-orange-100 bg-orange-50/50 p-3">
              <p className="text-xs font-medium text-orange-800">Audio transcript</p>
              <p className="mt-1 text-sm text-gray-700">{transcript}</p>
              <Button variant="secondary" size="sm" className="mt-2" onClick={insertTranscript}>
                Insert transcript into text
              </Button>
            </div>
          )}
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
              {type === "audio" && onTranscript && (transcript || interimTranscript) && (
                <div className="mt-4 w-full rounded-md border border-orange-100 bg-orange-50/60 p-3 text-left">
                  <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">
                    Live transcript
                  </p>
                  <p className="mt-1 text-sm text-gray-800">
                    {transcript}
                    {interimTranscript && (
                      <span className="text-gray-500"> {interimTranscript}</span>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          {step === "preview" && previewUrl && (
            <div className="flex flex-col items-center py-2">
              {type === "audio" && <audio src={previewUrl} controls className="mb-4 w-full" />}
              {type === "video" && (
                <video src={previewUrl} controls playsInline className="mb-4 w-full max-h-52 rounded-lg" />
              )}
              {type === "audio" && onTranscript && (transcript || interimTranscript) && (
                <div className="mb-4 w-full rounded-md border border-orange-100 bg-orange-50/60 p-3 text-left">
                  <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">
                    Audio transcript
                  </p>
                  <p className="mt-1 text-sm text-gray-800">
                    {transcript}
                    {interimTranscript && (
                      <span className="text-gray-500"> {interimTranscript}</span>
                    )}
                  </p>
                  <Button variant="secondary" size="sm" className="mt-2" onClick={insertTranscript}>
                    Insert transcript into text
                  </Button>
                </div>
              )}
              <p className="mb-4 text-sm text-gray-600">Review your {typeLabel} — upload or discard</p>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={discardPreview}>
                  Discard
                </Button>
                <Button onClick={uploadPreview}>Upload</Button>
              </div>
            </div>
          )}

          {step === "uploading" && (
            <div className="flex flex-col items-center py-8 w-full">
              <div className="spinner mb-3" />
              <p className="text-sm text-gray-600">
                Uploading{uploadProgress > 0 ? `… ${uploadProgress}%` : "…"}
              </p>
              {uploadProgress > 0 && (
                <div className="mt-3 h-2 w-full max-w-xs overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-[var(--primary)] transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {step === "compressing" && (
            <div className="flex flex-col items-center py-8">
              <div className="spinner mb-3" />
              <p className="text-sm text-gray-600">Optimizing image…</p>
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
          {step === "uploading" || step === "compressing" ? (
            <div className="py-6 w-full">
              <div className="spinner mx-auto mb-3" />
              <p className="text-sm text-gray-600 text-center">
                {step === "compressing"
                  ? "Optimizing image…"
                  : `Uploading${uploadProgress > 0 ? `… ${uploadProgress}%` : "…"}`}
              </p>
              {step === "uploading" && uploadProgress > 0 && (
                <div className="mx-auto mt-3 h-2 w-full max-w-xs overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-[var(--primary)] transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
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
