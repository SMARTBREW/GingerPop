"use client";

import Image from "next/image";
import { PlayQuestion } from "@/types/quiz";

interface QuestionMediaProps {
  question: PlayQuestion;
}

export function QuestionMedia({ question }: QuestionMediaProps) {
  if (question.type === "text") return null;

  return (
    <div className="mb-6 animate-fade-in">
      {question.type === "image" && question.mediaUrl && (
        <div className="media-frame mx-auto max-w-md p-2">
          <Image
            src={question.mediaUrl}
            alt={question.mediaCaption ?? "Question image"}
            width={440}
            height={300}
            className="mx-auto rounded-lg object-contain"
            unoptimized
          />
          {question.mediaCaption && (
            <p className="mt-2 text-center text-sm text-slate-500">{question.mediaCaption}</p>
          )}
        </div>
      )}

      {question.type === "video" && question.mediaUrl && (
        <div className="media-frame mx-auto max-w-lg bg-black">
          <video
            key={question.id}
            src={question.mediaUrl}
            controls
            playsInline
            className="w-full"
          />
        </div>
      )}

      {question.type === "audio" && question.mediaUrl && (
        <div className="media-frame mx-auto max-w-md p-6">
          <audio key={question.id} src={question.mediaUrl} controls className="w-full" />
        </div>
      )}
    </div>
  );
}
