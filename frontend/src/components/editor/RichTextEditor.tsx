"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { createSpeechRecognition, isSpeechRecognitionSupported } from "@/lib/speech-recognition";

interface RichTextEditorProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  compact?: boolean;
  enableDictate?: boolean;
}

type Command = "bold" | "italic" | "underline" | "strikeThrough" | "insertUnorderedList" | "insertOrderedList" | "removeFormat";

const TOOLBAR: { cmd: Command; label: string; title: string }[] = [
  { cmd: "bold", label: "B", title: "Bold" },
  { cmd: "italic", label: "I", title: "Italic" },
  { cmd: "underline", label: "U", title: "Underline" },
  { cmd: "strikeThrough", label: "S", title: "Strikethrough" },
  { cmd: "insertUnorderedList", label: "•", title: "Bullet list" },
  { cmd: "insertOrderedList", label: "1.", title: "Numbered list" },
];

function exec(cmd: Command) {
  document.execCommand(cmd, false);
}

export function RichTextEditor({
  label,
  value,
  onChange,
  placeholder,
  minHeight = 96,
  compact = false,
  enableDictate = true,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);
  const [dictating, setDictating] = useState(false);
  const [dictateHint, setDictateHint] = useState("");
  const recognitionRef = useRef<ReturnType<typeof createSpeechRecognition>>(null);
  const speechSupported = isSpeechRecognitionSupported();

  const syncFromEditor = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const html = el.innerHTML === "<br>" ? "" : el.innerHTML;
    onChange(html);
  }, [onChange]);

  const normalizeEditorHtml = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const raw = el.innerHTML === "<br>" ? "" : el.innerHTML.trim();
    if (!raw) return;
    if (!/<\/?[a-z]/i.test(raw)) {
      el.innerHTML = `<p>${raw}</p>`;
    }
  }, []);

  useEffect(() => {
    const el = editorRef.current;
    if (!el || focused) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value || "";
    }
  }, [value, focused]);

  const stopDictation = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setDictating(false);
    setDictateHint("");
  }, []);

  const startDictation = () => {
    if (dictating) {
      stopDictation();
      return;
    }

    const recognition = createSpeechRecognition();
    if (!recognition) {
      setDictateHint("Speech recognition is not supported in this browser.");
      return;
    }

    editorRef.current?.focus();
    recognitionRef.current = recognition;
    setDictating(true);
    setDictateHint("Listening… speak clearly.");

    recognition.onresult = (event) => {
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) finalText += result[0].transcript;
      }
      if (finalText.trim()) {
        document.execCommand("insertText", false, `${finalText.trim()} `);
        syncFromEditor();
      }
    };

    recognition.onerror = () => {
      setDictateHint("Could not capture speech. Try again.");
      stopDictation();
    };

    recognition.onend = () => {
      setDictating(false);
      setDictateHint("");
      recognitionRef.current = null;
    };

    recognition.start();
  };

  useEffect(() => () => stopDictation(), [stopDictation]);

  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-base font-medium text-gray-700">{label}</label>
      )}

      <div className="overflow-hidden rounded-md border border-[var(--border)] bg-white focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary-muted)]">
        <div
          className={cn(
            "flex flex-wrap items-center gap-0.5 border-b border-gray-100 bg-gray-50/80 px-1.5 py-1",
            compact && "px-1 py-0.5",
          )}
        >
          {TOOLBAR.map(({ cmd, label: btnLabel, title }) => (
            <button
              key={cmd}
              type="button"
              title={title}
              onMouseDown={(e) => {
                e.preventDefault();
                editorRef.current?.focus();
                exec(cmd);
                syncFromEditor();
              }}
              className={cn(
                "min-w-8 rounded px-2 py-1 text-sm font-semibold text-gray-600 hover:bg-white hover:text-gray-900",
                cmd === "italic" && "italic",
                cmd === "underline" && "underline",
                cmd === "strikeThrough" && "line-through",
              )}
            >
              {btnLabel}
            </button>
          ))}

          {enableDictate && speechSupported && (
            <button
              type="button"
              title="Dictate — speech to text"
              onMouseDown={(e) => {
                e.preventDefault();
                startDictation();
              }}
              className={cn(
                "ml-1 flex items-center gap-1 rounded px-2 py-1 text-xs font-medium",
                dictating
                  ? "bg-red-100 text-red-700"
                  : "text-[var(--primary)] hover:bg-orange-50",
              )}
            >
              <span aria-hidden>🎙</span>
              {dictating ? "Stop" : "Dictate"}
            </button>
          )}
        </div>

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={syncFromEditor}
          onBlur={() => {
            setFocused(false);
            normalizeEditorHtml();
            syncFromEditor();
          }}
          onFocus={() => setFocused(true)}
          data-placeholder={placeholder}
          className={cn(
            "rich-text-editor w-full px-3.5 py-2.5 text-base text-gray-900 outline-none",
            "empty:before:pointer-events-none empty:before:text-gray-400 empty:before:content-[attr(data-placeholder)]",
            "[&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-0.5",
          )}
          style={{ minHeight }}
        />
      </div>

      {dictateHint && <p className="mt-1.5 text-sm text-gray-500">{dictateHint}</p>}
    </div>
  );
}

/** Append plain/HTML text into a rich text field value. */
export function appendRichText(current: string, addition: string) {
  const chunk = addition.trim();
  if (!chunk) return current;
  if (!current) return chunk.startsWith("<") ? chunk : `<p>${chunk}</p>`;
  if (current.endsWith("</p>")) return `${current.slice(0, -4)} ${chunk}</p>`;
  return `${current}<p>${chunk}</p>`;
}
