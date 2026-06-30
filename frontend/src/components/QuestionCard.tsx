"use client";

import { PlayQuestion } from "@/types/quiz";
import { QuestionMedia } from "./QuestionMedia";
import { RichTextContent } from "@/components/editor/RichTextContent";
import { richTextHasContent } from "@/lib/sanitize-html";

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

interface QuestionCardProps {
  question: PlayQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedOption: number | null;
  isAnswered: boolean;
  correctIndex: number | null;
  onSelect: (index: number) => void;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedOption,
  isAnswered,
  correctIndex,
  onSelect,
}: QuestionCardProps) {
  return (
    <div className="animate-fade-in w-full">
      <div className="mb-6 flex items-center justify-between">
        <span className="badge badge-gray">
          Question {questionNumber} of {totalQuestions}
        </span>
        <span className="text-base font-semibold text-[var(--primary)]">{question.points} pts</span>
      </div>

      <QuestionMedia question={question} />

      <div className="mb-5">
        <RichTextContent
          html={question.question}
          className="text-xl font-semibold leading-relaxed text-slate-900 sm:text-2xl md:text-3xl"
          as="div"
        />
      </div>

      {richTextHasContent(question.examples) && (
        <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50/80 px-4 py-4 sm:px-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-900">
            Examples
          </p>
          <RichTextContent
            html={question.examples!}
            className="text-base leading-relaxed text-slate-800 sm:text-lg"
            as="div"
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {question.options.map((option, idx) => {
          let stateClass = "";
          if (isAnswered && correctIndex !== null) {
            if (idx === correctIndex) stateClass = "correct";
            else if (idx === selectedOption) stateClass = "wrong";
          } else if (selectedOption === idx) {
            stateClass = "selected";
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={isAnswered}
              onClick={() => onSelect(idx)}
              className={`option-btn flex items-center gap-3 rounded-lg px-4 py-4 text-left ${stateClass}`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-base font-semibold text-slate-600">
                {OPTION_LABELS[idx]}
              </span>
              <span className="flex-1 text-base text-slate-700">
                <RichTextContent html={option} as="span" />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
