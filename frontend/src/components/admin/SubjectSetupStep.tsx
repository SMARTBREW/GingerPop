"use client";

import { FieldHint } from "@/components/admin/FieldHint";
import { SubjectWizardChrome, WizardStepFooter } from "@/components/admin/SubjectWizardChrome";

interface SubjectMeta {
  emoji: string;
  color: string;
  accent: string;
  slug: string;
}

interface SubjectSetupStepProps {
  title: string;
  description: string;
  meta: SubjectMeta;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onMetaChange: (meta: SubjectMeta) => void;
  onSave: () => void;
  onNext: () => void;
  saving?: boolean;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function plainPreview(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

const inputClass =
  "w-full rounded-xl border-2 border-[#fed7aa] bg-white px-4 py-3 text-base font-semibold text-[var(--kid-text)] outline-none focus:border-[#ea580c]";

export function SubjectSetupStep({
  title,
  description,
  meta,
  onTitleChange,
  onDescriptionChange,
  onMetaChange,
  onSave,
  onNext,
  saving,
}: SubjectSetupStepProps) {
  return (
    <SubjectWizardChrome
      title="Set up your subject"
      subtitle="Same card kids see on Subjects — fill details, save, then go to chapters."
      footer={
        <WizardStepFooter
          onSave={onSave}
          saving={saving}
          saveLabel="Save subject"
          onNext={onNext}
          nextLabel="Next: Chapters →"
          nextDisabled={!title.trim()}
        />
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <FieldHint
            label="Subject title"
            hint="Big heading on the subject card on /subjects"
            example="Maths"
          >
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Maths"
              className={inputClass}
            />
          </FieldHint>

          <FieldHint
            label="Short description"
            hint="Grey text under the title on the subject card"
            example="Numbers, data, shapes & more"
          >
            <textarea
              value={description.replace(/<[^>]*>/g, "")}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Numbers, data, shapes & more"
              rows={3}
              className={`${inputClass} resize-y`}
            />
          </FieldHint>

          <div className="grid gap-4 sm:grid-cols-2">
            <FieldHint
              label="Emoji"
              hint="Large icon on the subject card"
              example="🔢"
            >
              <input
                type="text"
                value={meta.emoji}
                onChange={(e) => onMetaChange({ ...meta, emoji: e.target.value })}
                placeholder="🔢"
                className={`${inputClass} text-center text-3xl`}
              />
            </FieldHint>

            <FieldHint
              label="URL slug"
              hint="Readable URL name. If it already exists, GingerPop adds a short unique ID when you save."
              example="maths"
            >
              <input
                type="text"
                value={meta.slug}
                onChange={(e) => onMetaChange({ ...meta, slug: slugify(e.target.value) })}
                placeholder="maths"
                className={inputClass}
              />
            </FieldHint>

            <FieldHint label="Card background" hint="Pastel fill behind the subject card">
              <input
                type="color"
                value={meta.color || "#fff7ed"}
                onChange={(e) => onMetaChange({ ...meta, color: e.target.value })}
                className="h-12 w-full cursor-pointer rounded-xl border-2 border-[#fed7aa]"
              />
            </FieldHint>

            <FieldHint label="Accent color" hint="Title & “N chapters →” link color on the card">
              <input
                type="color"
                value={meta.accent || "#ea580c"}
                onChange={(e) => onMetaChange({ ...meta, accent: e.target.value })}
                className="h-12 w-full cursor-pointer rounded-xl border-2 border-[#fed7aa]"
              />
            </FieldHint>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-[var(--kid-muted)]">
            Preview — Pick a subject card
          </p>
          <button
            type="button"
            className="kid-card w-full p-6 text-left"
            style={{ background: meta.color || "#fff7ed" }}
          >
            <span className="text-4xl" aria-hidden>
              {meta.emoji || "📚"}
            </span>
            <h2 className="game-font mt-3 text-2xl font-bold" style={{ color: meta.accent || "#ea580c" }}>
              {title || "Maths"}
            </h2>
            <p className="mt-1 text-sm font-semibold text-[var(--kid-muted)]">
              {plainPreview(description) || "Numbers, data, shapes & more"}
            </p>
            <p className="mt-4 text-sm font-extrabold" style={{ color: meta.accent || "#ea580c" }}>
              0 chapters →
            </p>
          </button>
        </div>
      </div>
    </SubjectWizardChrome>
  );
}
