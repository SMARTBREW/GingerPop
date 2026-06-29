"use client";

import { questions as demoQuestions } from "@/data/questions";
import { QuizPlayer } from "@/components/QuizPlayer";
import { MarketingHeader } from "@/components/layout/MarketingHeader";

const questions = demoQuestions.map((q) => ({
  id: String(q.id),
  type: q.type,
  question: q.question,
  options: q.options,
  points: q.points,
  timeLimit: q.timeLimit,
  mediaUrl: q.mediaUrl,
  mediaCaption: q.mediaCaption,
  correctIndex: q.correctIndex,
}));

export default function PlayPage() {
  return (
    <>
      <MarketingHeader />
      <QuizPlayer
        questions={questions}
        quizTitle="Demo Assessment"
        playAgainHref="/play"
        showHomeLink
      />
    </>
  );
}
