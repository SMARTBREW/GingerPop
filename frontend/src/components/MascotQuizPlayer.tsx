"use client";

import React, { useCallback, useRef, useState } from "react";

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface QuizOption {
  emoji: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  subtitle?: string;
  options: QuizOption[];
  correctIndex: number;
  explanation: string; // shown when correct
  wrongExplanation?: string; // shown when wrong
  hint?: string;
}

interface Lesson {
  id: string;
  title: string;
  badgeText?: string;
  mascotSpeech: string;
  diagram?: DiagramStep[];
  facts: string[];
  ctaText: string;
  quizQuestions: QuizQuestion[];
}

interface DiagramStep {
  emoji: string;
  label: string;
}

/* ─── Constants ──────────────────────────────────────────────────────────── */

const PLANT_POWER_LESSON: Lesson = {
  id: "plant-power",
  title: "Why do plants need sunlight?",
  badgeText: "TODAY'S LESSON",
  mascotSpeech:
    "Psst! Plants can't order pizza. So they cook their own food using sunlight. Wildly efficient, honestly.",
  diagram: [
    { emoji: "☀️", label: "Sun" },
    { emoji: "🍃", label: "Leaf" },
    { emoji: "🍎", label: "Food" },
  ],
  facts: [
    "Plants are tiny chefs — sunlight is their stove.",
    "Sunlight + water + air = plant food (yum, science).",
    "No sun = sad wilted plant. Big sad.",
  ],
  ctaText: "Ready to prove you're a plant genius? Quiz time! 🌱",
  quizQuestions: [
    {
      id: "q1",
      question: "Why do plants need sunlight?",
      subtitle: "Let's see what you learned!",
      options: [
        { emoji: "😴", text: "To take naps" },
        { emoji: "🌿", text: "To make food" },
        { emoji: "💜", text: "To turn purple" },
      ],
      correctIndex: 1,
      explanation: "Yesss! Plants use sunlight to cook up their food. 🌞🌱",
      wrongExplanation: "Not quite! Plants use sunlight to make food, not naps. 😅",
      hint: "Think about what chefs need to cook food...",
    },
    {
      id: "q2",
      question: "Which part of the plant catches the sunlight?",
      subtitle: "Let's see what you learned!",
      options: [
        { emoji: "🪨", text: "The roots" },
        { emoji: "🌿", text: "The leaves" },
        { emoji: "🪸", text: "The dirt" },
      ],
      correctIndex: 1,
      explanation: "That's right! Leaves are like solar panels for plants! ☀️🌿",
      wrongExplanation: "Oops! Roots live underground — no sunlight down there.",
      hint: "Look at the plant diagram from the lesson...",
    },
    {
      id: "q3",
      question: "What do plants make using sunlight?",
      subtitle: "Let's see what you learned!",
      options: [
        { emoji: "🍕", text: "Pizza" },
        { emoji: "🌊", text: "Water" },
        { emoji: "🍬", text: "Food (sugar!)" },
      ],
      correctIndex: 2,
      explanation: "Exactly! Plants make sugar using sunlight — they're sweet! 🍬",
      wrongExplanation: "Not quite! Plants make their own food (sugar) using sunlight. 🌱",
      hint: "It's something sweet and delicious...",
    },
  ],
};

const PLANT_LEVELS = ["SEED", "SPROUT", "LEAF", "LEGEND"];
const PLANT_LEVEL_EMOJIS = ["🌱", "🪴", "🌿", "🌳"];

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function MascotSvg({
  size = 64,
  animate = false,
  expression = "standard",
  style,
}: {
  size?: number;
  animate?: boolean;
  expression?: "standard" | "correct" | "incorrect" | "hint";
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        animation: animate ? "mascot-float 3s ease-in-out infinite" : undefined,
        ...style,
      }}
    >
      <svg
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%" }}
      >
        {/* Body */}
        <ellipse cx="40" cy="50" rx="26" ry="22" fill="#4ade80" />
        {/* Head */}
        <circle cx="40" cy="32" r="24" fill="#4ade80" />

        {/* Eyes based on expression */}
        {expression === "incorrect" ? (
          <>
            {/* Dizzy/Sad Eyes */}
            <path d="M 28 24 L 36 32 M 36 24 L 28 32" stroke="#166534" strokeWidth="3" strokeLinecap="round" />
            <path d="M 44 24 L 52 32 M 52 24 L 44 32" stroke="#166534" strokeWidth="3" strokeLinecap="round" />
          </>
        ) : expression === "correct" ? (
          <>
            {/* Joyful Star/Winking/Sparkling Eyes */}
            <path d="M 26 28 Q 32 20 38 28" stroke="#166534" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 42 28 Q 48 20 54 28" stroke="#166534" strokeWidth="3" strokeLinecap="round" fill="none" />
          </>
        ) : expression === "hint" ? (
          <>
            {/* Thinking / Curious Eyes */}
            <circle cx="32" cy="28" r="8" fill="white" />
            <circle cx="48" cy="28" r="8" fill="white" />
            {/* One eye looking up/sideways */}
            <circle cx="34" cy="25" r="4.5" fill="#1a1a2e" />
            <circle cx="46" cy="25" r="4.5" fill="#1a1a2e" />
            <circle cx="35" cy="24" r="1.5" fill="white" />
            <circle cx="47" cy="24" r="1.5" fill="white" />
          </>
        ) : (
          <>
            {/* Standard Eyes */}
            <circle cx="32" cy="28" r="8" fill="white" />
            <circle cx="48" cy="28" r="8" fill="white" />
            <circle cx="33" cy="29" r="4" fill="#1a1a2e" />
            <circle cx="49" cy="29" r="4" fill="#1a1a2e" />
            <circle cx="34.5" cy="27.5" r="1.5" fill="white" />
            <circle cx="50.5" cy="27.5" r="1.5" fill="white" />
          </>
        )}

        {/* Mouth based on expression */}
        {expression === "incorrect" ? (
          <path
            d="M 32 44 Q 40 38 48 44"
            stroke="#166534"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        ) : expression === "correct" ? (
          <path
            d="M 30 38 Q 40 50 50 38"
            stroke="#166534"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="#e11d48"
          />
        ) : expression === "hint" ? (
          <path
            d="M 34 40 Q 40 40 46 38"
            stroke="#166534"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        ) : (
          <path
            d="M 30 38 Q 40 46 50 38"
            stroke="#166534"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Blush */}
        <circle cx="26" cy="36" r="4" fill="#f9a8d4" opacity="0.6" />
        <circle cx="54" cy="36" r="4" fill="#f9a8d4" opacity="0.6" />
        {/* Arms */}
        <ellipse cx="16" cy="55" rx="7" ry="5" fill="#4ade80" transform="rotate(-20 16 55)" />
        <ellipse cx="64" cy="55" rx="7" ry="5" fill="#4ade80" transform="rotate(20 64 55)" />
        {/* Belly */}
        <ellipse cx="40" cy="52" rx="14" ry="10" fill="#86efac" opacity="0.7" />
      </svg>
    </div>
  );
}

function DiagramVisual({ steps }: { steps: DiagramStep[] }) {
  const elements: React.ReactNode[] = [];
  steps.forEach((step, i) => {
    elements.push(
      <div key={step.label} className="mascot-diagram-item">
        <div className="mascot-diagram-circle">
          <span className="mascot-diagram-emoji">{step.emoji}</span>
        </div>
        <span className="mascot-diagram-label">{step.label}</span>
      </div>
    );
    if (i < steps.length - 1) {
      elements.push(
        <div key={`arrow-${i}`} className="mascot-diagram-arrow" aria-hidden>
          – – –
        </div>
      );
    }
  });
  return <div className="mascot-diagram">{elements}</div>;
}

function LessonPage({
  lesson,
  onStartQuiz,
}: {
  lesson: Lesson;
  onStartQuiz: () => void;
}) {
  return (
    <div className="mascot-card mascot-animate-in">
      {/* Badge */}
      {lesson.badgeText && (
        <div className="mascot-badge-row">
          <span className="mascot-badge">🌿 {lesson.badgeText}</span>
        </div>
      )}

      {/* Title */}
      <h1 className="mascot-lesson-title">{lesson.title}</h1>

      {/* Mascot + speech bubble */}
      <div className="mascot-speech-row">
        <MascotSvg size={72} animate />
        <div className="mascot-speech-bubble">{lesson.mascotSpeech}</div>
      </div>

      {/* Diagram */}
      {lesson.diagram && (
        <div className="mascot-diagram-wrap">
          <DiagramVisual steps={lesson.diagram} />
        </div>
      )}

      {/* Facts */}
      <ul className="mascot-facts">
        {lesson.facts.map((fact, i) => (
          <li key={i} className="mascot-fact-item">
            <span className="mascot-fact-num">{i + 1}</span>
            <span>{fact}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button type="button" className="mascot-cta" onClick={onStartQuiz}>
        <span>↓</span>
        <span>{lesson.ctaText}</span>
        <span>↓</span>
      </button>
    </div>
  );
}

function QuizCard({
  lesson,
  questionIndex,
  onComplete,
  onScoreChange,
}: {
  lesson: Lesson;
  questionIndex: number;
  onComplete: () => void;
  onScoreChange: (delta: number) => void;
}) {
  const questions = lesson.quizQuestions;
  const question = questions[questionIndex];
  const total = questions.length;

  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintText, setHintText] = useState<string | null>(null);
  const advancedRef = useRef(false);

  const isCorrect = selected !== null && selected === question.correctIndex;

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === question.correctIndex) {
      onScoreChange(10);
    } else {
      onScoreChange(-1);
    }
  };

  const handleNext = () => {
    if (advancedRef.current) return;
    advancedRef.current = true;
    onComplete();
  };

  const handleShowHint = () => {
    if (question.hint) {
      setHintText(question.hint);
    }
    setShowHint(true);
  };

  return (
    <div className={`mascot-card mascot-animate-in ${answered && !isCorrect ? "quiz-card-shake" : ""}`}>
      {/* Header row */}
      <div className="mascot-quiz-header">
        <span className="mascot-badge mascot-badge-timer">⏱ QUESTION {questionIndex + 1} OF {total}</span>
        <div className="mascot-progress-dots">
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              className={`mascot-progress-dot ${
                i < questionIndex ? "done" : i === questionIndex ? "active" : ""
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <h2 className="mascot-question-title">{question.question}</h2>
      {question.subtitle && (
        <p className="mascot-question-sub">{question.subtitle}</p>
      )}

      {/* Options */}
      <div className="mascot-options">
        {question.options.map((opt, idx) => {
          let stateClass = "";
          if (answered) {
            if (idx === question.correctIndex) stateClass = "correct";
            else if (idx === selected) stateClass = "wrong";
          }
          return (
            <button
              key={idx}
              type="button"
              disabled={answered}
              onClick={() => handleSelect(idx)}
              className={`mascot-option ${stateClass}`}
            >
              <span className="mascot-option-emoji">{opt.emoji}</span>
              <span className="mascot-option-text">{opt.text}</span>
              {answered && idx === question.correctIndex && (
                <span className="mascot-option-check">✓</span>
              )}
              {answered && idx === selected && idx !== question.correctIndex && (
                <span className="mascot-option-x">✕</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback banner */}
      {answered && (
        <div
          className={`mascot-feedback ${isCorrect ? "correct" : "wrong"} mascot-animate-up`}
        >
          <MascotSvg size={56} expression={isCorrect ? "correct" : "incorrect"} />
          <div className="mascot-feedback-text">
            <p className="mascot-feedback-title">
              {isCorrect ? "Yay! 🎉" : "Oops! 🤭"}
            </p>
            <p className="mascot-feedback-sub">
            {isCorrect ? question.explanation : (question.wrongExplanation ?? question.explanation)}
          </p>
          </div>
          <button type="button" className="mascot-next-btn" onClick={handleNext}>
            Next →
          </button>
        </div>
      )}

      {/* Hint section */}
      <div className="mascot-hint-section">
        <MascotSvg size={44} expression="hint" />
        <div className="mascot-hint-content">
          <p className="mascot-hint-title">💡 Need a hint?</p>
          <p className="mascot-hint-sub">
            {showHint && hintText ? hintText : "Stuck? I'll whisper a clue. Won't tell your parents."}
          </p>
        </div>
        {!showHint && (
          <button type="button" className="mascot-show-clue" onClick={handleShowHint}>
            Show clue
          </button>
        )}
      </div>
    </div>
  );
}

function JourneyCard({
  correctCount,
  totalQuestions,
}: {
  correctCount: number;
  totalQuestions: number;
}) {
  const levelIdx = Math.min(correctCount, PLANT_LEVELS.length - 1);
  const levelName = PLANT_LEVELS[levelIdx];
  const progressPct = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

  return (
    <div className="mascot-journey-card mascot-animate-in">
      <div className="mascot-journey-header">
        <span className="mascot-journey-badge">🌱 YOUR PLANT JOURNEY</span>
        <span className="mascot-journey-progress">
          {correctCount}/{totalQuestions}
        </span>
      </div>

      <div className="mascot-journey-level-badge">LEVEL {levelIdx + 1}: TINY {levelName}</div>
      <h2 className="mascot-journey-title">
        {levelName} MODE ACTIVATED!
      </h2>
      <p className="mascot-journey-sub">
        {correctCount === 1
          ? "One right answer and BOOM — you popped out of the dirt. Photosynthesis is jealous."
          : correctCount >= totalQuestions
          ? "Perfect score! You're a full-grown legend. 🌳"
          : "Keep going — you're growing! Answer more to level up."}
      </p>

      {/* Plant progress track */}
      <div className="mascot-plant-track">
        <div
          className="mascot-plant-fill"
          style={{ width: `${progressPct}%` }}
        />
        {/* Mascot marker */}
        <div
          className="mascot-plant-marker"
          style={{ left: `calc(${Math.max(progressPct - 2, 0)}% - 0px)` }}
        >
          <MascotSvg size={38} />
        </div>
      </div>

      {/* Level labels */}
      <div className="mascot-plant-labels">
        {PLANT_LEVELS.map((lvl, i) => (
          <div key={lvl} className="mascot-plant-label-item">
            <span className="mascot-plant-label-emoji">{PLANT_LEVEL_EMOJIS[i]}</span>
            <span className={`mascot-plant-label-text ${i <= levelIdx ? "active" : ""}`}>
              {lvl}
            </span>
          </div>
        ))}
      </div>

      <p className="mascot-journey-cta">
        Answer more questions to grow. Yes, that's literally how plants work.
      </p>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */

type Phase = "quiz" | "journey";

export function MascotQuizPlayer() {
  const lesson = PLANT_POWER_LESSON;
  const [phase, setPhase] = useState<Phase>("quiz");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [lives, setLives] = useState(7);
  const [score, setScore] = useState(240);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const lessonNumber = 3;
  const totalLessons = 8;

  const progressPct = (questionIndex / lesson.quizQuestions.length) * 100;

  const handleScoreChange = (delta: number) => {
    if (delta > 0) {
      setScore((s) => s + delta);
      setCorrectCount((c) => c + 1);
    } else {
      setLives((l) => Math.max(0, l - 1));
    }
  };

  const handleQuestionComplete = useCallback(() => {
    const next = questionIndex + 1;
    if (next >= lesson.quizQuestions.length) {
      setQuizDone(true);
      setPhase("journey");
    } else {
      setQuestionIndex(next);
    }
  }, [questionIndex, lesson.quizQuestions.length]);

  return (
    <div className="mascot-shell">
      {/* ── TOP HEADER ── */}
      <header className="mascot-header">
        <div className="mascot-header-inner" style={{ maxWidth: "800px" }}>
          {/* Left: lesson info */}
          <div className="mascot-header-lesson">
            <div className="mascot-header-lesson-badge">
              LESSON {lessonNumber} OF {totalLessons}
            </div>
            <div className="mascot-header-lesson-title">Plant Power</div>
          </div>

          {/* Center: progress bar */}
          <div className="mascot-header-bar-wrap">
            <div className="mascot-header-bar">
              <div
                className="mascot-header-bar-fill"
                style={{
                  width: `${35 + progressPct * 0.5}%`,
                }}
              />
            </div>
          </div>

          {/* Right: stats */}
          <div className="mascot-header-stats">
            <div className="mascot-stat-pill mascot-stat-red">
              <span>🔥</span>
              <span>{lives}</span>
            </div>
            <div className="mascot-stat-pill mascot-stat-yellow">
              <span>⭐</span>
              <span>{score}</span>
            </div>
            <button type="button" className="mascot-audio-btn" aria-label="Toggle audio">
              🔊
            </button>
          </div>
        </div>
      </header>

      {/* ── CONTENT ── */}
      <main className="mascot-main" style={{ maxWidth: "800px", gap: "2rem" }}>
        {/* 1. Lesson Section (First) */}
        <div className="mascot-section-seamless">
          <LessonPage lesson={lesson} onStartQuiz={() => {}} />
        </div>

        {/* 2. Questions Section (Second) */}
        <div className="mascot-section-seamless" style={{ borderTop: "2px dashed #e5e7eb", paddingTop: "2rem" }}>
          {!quizDone ? (
            <QuizCard
              key={questionIndex}
              lesson={lesson}
              questionIndex={questionIndex}
              onComplete={handleQuestionComplete}
              onScoreChange={handleScoreChange}
            />
          ) : (
            <div className="mascot-completed-message mascot-animate-in" style={{ textAlign: "center", padding: "2rem bg-white", borderRadius: "1.5rem" }}>
              <h2 className="mascot-question-title">🎉 Amazing Job!</h2>
              <p className="mascot-question-sub" style={{ marginTop: "0.5rem" }}>You have completed all questions in this quest!</p>
            </div>
          )}
        </div>

        {/* 3. Progression Section (Always visible at the bottom) */}
        <div className="mascot-section-seamless" style={{ borderTop: "2px dashed #e5e7eb", paddingTop: "2rem" }}>
          <JourneyCard
            correctCount={correctCount}
            totalQuestions={lesson.quizQuestions.length}
          />
        </div>

        <p className="mascot-footer-brand">Made with 🌱 for tiny scientists.</p>
      </main>
    </div>
  );
}
