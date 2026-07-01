"use client";

import { questions as demoQuestions } from "@/data/questions";
import { QuizPlayer } from "@/components/QuizPlayer";
import { KidMarketingHeader } from "@/components/layout/KidMarketingHeader";
import { KidZone } from "@/components/layout/KidZone";

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
    <KidZone>
      <KidMarketingHeader />
      <QuizPlayer
        questions={questions}
        quizTitle="Practice Quest"
        playAgainHref="/play"
        showHomeLink
        gamified
      />
    </KidZone>
  );
}
