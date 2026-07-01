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
  gamified?: boolean;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedOption,
  isAnswered,
  correctIndex,
  onSelect,
  gamified = false,
}: QuestionCardProps) {
  return (
    <div className="animate-fade-in w-full">
      <div className="mb-6 flex items-center justify-between">
        <span className={gamified ? "game-quest-badge" : "badge badge-gray"}>
          {gamified ? `🎯 Challenge ${questionNumber} of ${totalQuestions}` : `Question ${questionNumber} of ${totalQuestions}`}
        </span>
        <span
          className={
            gamified
              ? "game-font text-lg font-bold text-[var(--kid-purple)]"
              : "text-base font-semibold text-[var(--primary)]"
          }
        >
          {gamified ? `⭐ ${question.points}` : `${question.points} pts`}
        </span>
      </div>

      <QuestionMedia question={question} />

      <div className="question-panel mb-6">
        <RichTextContent
          html={question.question}
          className="question-prose"
          as="div"
        />
      </div>

      {richTextHasContent(question.examples) && (
        <div className="examples-panel mb-8">
          <div className="examples-panel-header">
            <span className="examples-panel-dot" aria-hidden />
            <p className="examples-panel-label">{gamified ? "💡 Hints" : "Examples"}</p>
          </div>
          <div className="examples-panel-body">
            <RichTextContent html={question.examples!} className="examples-prose" as="div" />
          </div>
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
              <span className="option-letter flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base font-semibold">
                {OPTION_LABELS[idx]}
              </span>
              <span className="option-answer flex-1 text-base">
                <RichTextContent html={option} className="option-prose" as="span" />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
