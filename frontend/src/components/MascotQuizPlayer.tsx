"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { optimizeMediaUrl } from "@/lib/media-url";
import { PlayerImage, PlayerVideo } from "@/components/media/PlayerMedia";
import { BrandName } from "@/components/BrandName";

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface QuizOption {
  emoji: string;
  text: string;
  /** Original admin-slot index (0–3) after empty options are filtered */
  originalIndex?: number;
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
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  audioText?: string;
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
  imageUrl?: string;
  videoUrl?: string;
  pages?: {
    title: string;
    content?: string;
    imageUrl?: string;
    videoUrl?: string;
    audioUrl?: string;
    audioText?: string;
  }[];
  /** Mongo ObjectId when loaded from invite / API */
  mongoId?: string;
}

export type InvitePlayLesson = Lesson & { mongoId: string };

interface DiagramStep {
  emoji: string;
  label: string;
}

/* ─── Constants ──────────────────────────────────────────────────────────── */

const ALL_MATH_LESSONS: Lesson[] = [
  {
    id: "comparing-numbers",
    title: "Comparing Numbers",
    badgeText: "1. COMPARING NUMBERS",
    imageUrl: "/img/image.png",
    mascotSpeech: "Hey there! Let's learn how to compare numbers. Compare karne ka matlab hai check karna kaun bada hai, kaun chhota, ya dono equal hain! 🐊",
    facts: [
      "1. What is Compare? : Do ya zyada numbers ko dekhkar decide karna ki kaunsa bada (>), chhota (<) ya barabar (=) hai.",
      "2. Important Symbols : '>' (Greater Than / bada hai) e.g. 8 > 5, '<' (Less Than / chhota hai) e.g. 3 < 7, '=' (Equal to / barabar hai) e.g. 6 = 6.",
      "3. Kaise Compare karte hain? : Step 1: Digits count karo (more digits = bigger! e.g. 254 > 99). Step 2: Left-most digit compare karo (e.g. 457 < 489).",
      "4. Comparing Decimals : Pehle whole part compare karo, fir decimal point ke baad tenths place check karo (e.g. 3.4 > 3.09).",
      "5. Real-life Examples : Mere paas 5 apples hain, dost ke paas 8 (5 < 8) aur 50 Rs vs 20 Rs items (50 > 20).",
      "💡 Think Box: \n- Tumhare aur friend ke marks mein kaun bada hai?\n- Equal numbers ke liye kaunsa symbol use hota hai?",
    ],
    ctaText: "Next",
    quizQuestions: [
      {
        id: "math-q1",
        question: "Fill in the blank: 64 ___ 89",
        subtitle: "Practice Question a",
        imageUrl: "/img/image copy.png",
        options: [
          { emoji: "🐊", text: "< (Less Than)" },
          { emoji: "🐊", text: "> (Greater Than)" },
          { emoji: "😐", text: "= (Equal To)" },
        ],
        correctIndex: 0,
        explanation: "Correct! 64 is less than 89, so 64 < 89. 🎉",
        wrongExplanation: "Oops! 64 is smaller than 89, so we use <.",
        hint: "89 is bigger than 64!",
      },
      {
        id: "math-q2",
        question: "Fill in the blank: 123 ___ 98",
        subtitle: "Practice Question b",
        options: [
          { emoji: "🐊", text: "< (Less Than)" },
          { emoji: "🐊", text: "> (Greater Than)" },
          { emoji: "😐", text: "= (Equal To)" },
        ],
        correctIndex: 1,
        explanation: "Perfect! 123 has 3 digits and 98 has 2 digits, so 123 > 98. 🌟",
        wrongExplanation: "A 3-digit number is always greater than a 2-digit number.",
        hint: "Count the digits first!",
      },
      {
        id: "math-q3",
        question: "Fill in the blank: 5.2 ___ 5.09",
        subtitle: "Practice Question c",
        options: [
          { emoji: "🐊", text: "< (Less Than)" },
          { emoji: "🐊", text: "> (Greater Than)" },
          { emoji: "😐", text: "= (Equal To)" },
        ],
        correctIndex: 1,
        explanation: "Correct! Pehle whole number compare kiya (5=5), fir tenths position par 2 is greater than 0, so 5.2 > 5.09. 🍬",
        wrongExplanation: "Check the tenths place: 2 is larger than 0.",
        hint: "Think of 5.2 as 5.20 vs 5.09!",
      },
      {
        id: "math-q4",
        question: "Fill in the blank: 300 ___ 300",
        subtitle: "Practice Question d",
        options: [
          { emoji: "🐊", text: "< (Less Than)" },
          { emoji: "🐊", text: "> (Greater Than)" },
          { emoji: "😐", text: "= (Equal To)" },
        ],
        correctIndex: 2,
        explanation: "Superb! Both numbers are exactly the same, so 300 = 300. 🌟",
        wrongExplanation: "Dono numbers barabar hain, so we use =.",
        hint: "Are they identical?",
      }
    ],
  },
  {
    id: "organising-data",
    title: "Organising Data",
    badgeText: "2. ORGANISING DATA",
    mascotSpeech: "Data ko table ya graph mein simple tareeke se arrange karna hi Organising Data kehta hai. Let's see some survey examples! 📊",
    facts: [
      "What is Data? : Kisi topic par gathered information (jaise favourite colours, fruits, recess choices, birthdays, etc.).",
      "What is Organising? : Data ko saaf, simple aur arranged tareeke se table, list ya graph mein likhna, taaki easily samajh aaye.",
      "Survey Example : Favourite colour survey has Red (3), Blue (4), Green (2), Yellow (1). Blue is the most popular colour!",
      "Organising Benefits : Data samajhna easy ho jaata hai, compare karna asaan hota hai aur graphs/tally marks banana possible ho jata hai.",
      "💡 Think Box: \n- Kya raw data samajhna easy hota hai?\n- Table banane se kya fayda hota hai?",
    ],
    ctaText: "Next",
    quizQuestions: [
      {
        id: "data-q1",
        question: "Activity 1: Favourite Pet Survey. If Dog got 4 votes, Cat got 3 votes, Fish got 2 votes, Rabbit got 2 votes, and Bird got 1 vote. Sabse popular pet kaunsa nikla?",
        subtitle: "Count the survey votes for each pet!",
        options: [
          { emoji: "🐶", text: "Dog" },
          { emoji: "🐱", text: "Cat" },
          { emoji: "🐰", text: "Rabbit" },
        ],
        correctIndex: 0,
        explanation: "Sahi jawab! Dog has the highest votes (4), making it the most popular pet! 🐶",
        wrongExplanation: "Dog had 4 votes, which is the highest number in the poll.",
        hint: "Which pet has the highest number of votes?",
      },
      {
        id: "data-q2",
        question: "Activity 2: Daily Temperature. Arrange these temperatures in ascending order (small to big): 32°C, 31°C, 35°C, 33°C, 34°C, 30°C, 31°C.",
        subtitle: "Find the smallest first!",
        options: [
          { emoji: "📈", text: "30°C, 31°C, 31°C, 32°C, 33°C, 34°C, 35°C" },
          { emoji: "📈", text: "35°C, 34°C, 33°C, 32°C, 31°C, 31°C, 30°C" },
          { emoji: "📈", text: "30°C, 31°C, 32°C, 33°C, 34°C, 35°C" },
        ],
        correctIndex: 0,
        explanation: "Correct! Ascending order starts from the smallest (30°C) and goes to the largest (35°C), keeping both 31°C values. 📈",
        wrongExplanation: "Oops! Ascending starts from small and goes to big, including duplicate values.",
        hint: "Start with 30, then both 31s, then 32...",
      },
      {
        id: "data-q3",
        question: "Activity 3: Books Read Class Data. Teacher shared raw data of books read in April: 3, 5, 2, 4, 6, 3, 0, 5, 4, 2, 3, 6, 1, 4, 5, 2, 3, 4, 2, 1, 5, 0, 3, 4, 2, 6, 1, 4, 3, 2. Kitne students ne 4 ya usse zyada books padhi?",
        subtitle: "Count all values that are 4, 5, or 6!",
        options: [
          { emoji: "📚", text: "10 students" },
          { emoji: "📚", text: "13 students" },
          { emoji: "📚", text: "15 students" },
        ],
        correctIndex: 1,
        explanation: "Perfect! Exactly 13 values in the raw list are 4, 5, or 6! 📚",
        wrongExplanation: "Count them carefully: there are 6 fours, 4 fives, and 3 sixes. 6 + 4 + 3 = 13.",
        hint: "Filter and sum the occurrences of 4, 5, and 6 in the list.",
      },
      {
        id: "data-q4",
        question: "Activity 4: Snack Choices. Poll results: Chips (7), Sandwich (5), Fruit (6), Chocolate (2). Chips se 2 kam frequency wala snack kaunsa hai?",
        subtitle: "Chips has a frequency of 7. Find the snack with frequency 7 - 2 = 5!",
        options: [
          { emoji: "🥪", text: "Sandwich" },
          { emoji: "🍎", text: "Fruit" },
          { emoji: "🍫", text: "Chocolate" },
        ],
        correctIndex: 0,
        explanation: "Kya baat hai! Chips is 7, and 7 - 2 = 5, which matches Sandwich. 🥪",
        wrongExplanation: "Chips has 7, so 7 - 2 = 5. Sandwich is the snack chosen by 5 students.",
        hint: "Calculate 7 - 2, then look at the snack frequencies.",
      }
    ],
  },
  {
    id: "geometry",
    title: "Geometry",
    badgeText: "3. GEOMETRY",
    imageUrl: "/img/image copy 6.png",
    mascotSpeech: "Let's explore the fundamental building blocks of geometry: Point, Line, Line Segment, and Ray! 📐",
    facts: [
      "1. Point (A dot / exact position) : A point shows an exact position. It has no length, no width. (e.g. pencil dot, location pin, sky star).",
      "2. Line (Goes on forever both sides) : Line dono taraf infinity tak chalti rehti hai. Symbol: ↔ AB. (e.g. endless straight road, railway track).",
      "3. Line Segment (Has 2 fixed ends) : Line ka wo hissa jiska start aur end fixed ho. Symbol: AB̅. (e.g. matchstick, ruler edge).",
      "4. Ray (Kiran) : Ray ek side se start hoti hai aur doosri side infinity tak jaati hai. Symbol: → AB. (e.g. sunlight beam, torch light).",
      "💡 Think Box: \n- Road seedhi hoti hai ya curved? Kyun?\n- Parallel lines real life mein kahan dikhti hain?",
    ],
    ctaText: "Next",
    quizQuestions: [
      {
        id: "geom-q1",
        question: "Which of these shows an exact position and has NO length and NO width?",
        subtitle: "Think about a Google Maps location pin!",
        options: [
          { emoji: "📍", text: "Point" },
          { emoji: "📏", text: "Line Segment" },
          { emoji: "↔️", text: "Line" },
        ],
        correctIndex: 0,
        explanation: "Correct! A Point (dot) has no dimensions, only a location. 📍",
        wrongExplanation: "Oops! A point represents position only. Line segments and lines have length.",
        hint: "A star in the sky looks like a point dot!",
      },
      {
        id: "geom-q2",
        question: "What geometric figure goes on forever in BOTH directions without any end?",
        subtitle: "Think of an endless straight road!",
        options: [
          { emoji: "📏", text: "Line Segment" },
          { emoji: "↔️", text: "Line" },
          { emoji: "➡️", text: "Ray" },
        ],
        correctIndex: 1,
        explanation: "Sahi! A Line (↔) goes on endlessly on both sides without ending. ↔️",
        wrongExplanation: "Incorrect. Line segments have ends; lines do not.",
        hint: "Its symbol is ↔ AB.",
      },
      {
        id: "geom-q3",
        question: "What shape has a fixed start and end point (like the edge of a ruler or a matchstick)?",
        subtitle: "It has two fixed endpoints!",
        options: [
          { emoji: "📏", text: "Line Segment" },
          { emoji: "↔️", text: "Line" },
          { emoji: "➡️", text: "Ray" },
        ],
        correctIndex: 0,
        explanation: "Perfect! A Line Segment (AB̅) has 2 fixed endpoints and a measurable length. 📏",
        wrongExplanation: "Incorrect. A Line Segment has fixed ends, unlike a Line or Ray.",
        hint: "The edge of a ruler is a segment.",
      },
      {
        id: "geom-q4",
        question: "What starts at one endpoint and goes on forever in the other direction?",
        subtitle: "Think of sunlight or torch light beams!",
        options: [
          { emoji: "📍", text: "Point" },
          { emoji: "↔️", text: "Line" },
          { emoji: "➡️", text: "Ray" },
        ],
        correctIndex: 2,
        explanation: "Excellent! A Ray (→) has a start point and goes infinitely in the other direction. ➡️",
        wrongExplanation: "Oops! Ray starts at one point and is endless on the other.",
        hint: "It looks like an arrow pointing to one side.",
      }
    ],
  },
];;

const PLANT_POWER_LESSON = ALL_MATH_LESSONS[0];

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

function CrocodileSvg({ size = 110 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size * 0.8, flexShrink: 0 }}>
      <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
        {/* Tail */}
        <path d="M10 70 Q 20 50 40 60 Q 30 80 10 70" fill="#22c55e" />
        <path d="M15 62 L 22 55 L 28 64" fill="#15803d" />
        <path d="M25 64 L 32 57 L 38 66" fill="#15803d" />

        {/* Back scales */}
        <path d="M45 40 L 50 32 L 55 42" fill="#15803d" />
        <path d="M60 42 L 65 34 L 70 44" fill="#15803d" />
        <path d="M75 46 L 80 38 L 85 48" fill="#15803d" />

        {/* Body */}
        <ellipse cx="60" cy="65" rx="30" ry="22" fill="#22c55e" />
        <ellipse cx="60" cy="68" rx="20" ry="14" fill="#86efac" /> {/* Belly */}

        {/* Head / Snout */}
        <path d="M75 45 C 75 35, 115 35, 115 50 C 115 60, 95 62, 75 58 Z" fill="#22c55e" />
        
        {/* Snout details & smile */}
        <path d="M 85 53 Q 100 55 108 48" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        
        {/* Sharp teeth (cute!) */}
        <path d="M 92 53 L 95 57 L 98 54 L 101 57 L 104 53" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" />
        
        {/* Eyes (Googly cartoon eyes) */}
        <circle cx="80" cy="35" r="9" fill="white" stroke="#15803d" strokeWidth="2" />
        <circle cx="82" cy="35" r="4" fill="#111827" />
        <circle cx="83.5" cy="33.5" r="1.5" fill="white" />

        <circle cx="94" cy="36" r="9" fill="white" stroke="#15803d" strokeWidth="2" />
        <circle cx="95" cy="36" r="4" fill="#111827" />
        <circle cx="96.5" cy="34.5" r="1.5" fill="white" />

        {/* Nostril */}
        <circle cx="110" cy="44" r="1.5" fill="#15803d" />

        {/* Legs (Waddling posture) */}
        {/* Back Leg */}
        <rect x="42" y="80" width="10" height="12" rx="4" fill="#15803d" />
        {/* Front Leg */}
        <rect x="68" y="82" width="10" height="12" rx="4" fill="#15803d" />
      </svg>
    </div>
  );
}

function InteractiveMascot({
  mode,
  onClick,
}: {
  mode: "lesson" | "quiz";
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      className="mascot-pacing-container"
      style={{
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      {/* Speech bubble */}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "relative",
          background: "#ffffff",
          border: "3.5px solid #22c55e",
          borderRadius: "1.25rem",
          padding: "0.6rem 1.1rem",
          fontSize: "0.95rem",
          fontWeight: 900,
          color: "#166534",
          boxShadow: hovered ? "0 6px 0 #22c55e" : "0 4px 0 #22c55e",
          transition: "box-shadow 0.15s, transform 0.15s",
          transform: hovered ? "scale(1.04) translateY(-2px)" : "scale(1)",
          whiteSpace: "nowrap",
        }}
      >
        {mode === "lesson" ? (
          <span>open quiz! 🎯</span>
        ) : (
          <span>open lesson! 📖</span>
        )}
        {/* Triangle pointer pointing right */}
        <div style={{
          position: "absolute",
          right: "-14px",
          top: "50%",
          transform: "translateY(-50%)",
          width: 0,
          height: 0,
          borderTop: "8px solid transparent",
          borderBottom: "8px solid transparent",
          borderLeft: "14px solid #22c55e",
        }} />
      </div>

      {/* Large waddling cartoon animal — only this flips, not the text */}
      <div className="mascot-crocodile-waddle-flip" style={{
        filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.1))",
      }}>
        <CrocodileSvg size={110} />
      </div>
    </div>
  );
}

function InteractiveFactCard({ fact, index }: { fact: string; index: number }) {
  const [revealed, setRevealed] = useState(false);

  let front = `Fact #${index + 1} 💡`;
  let back = fact;

  if (fact.includes(":")) {
    const parts = fact.split(":");
    front = parts[0].trim();
    back = parts[1].trim();
  } else if (fact.includes("?")) {
    const idx = fact.indexOf("?");
    front = fact.substring(0, idx + 1).trim();
    back = fact.substring(idx + 1).trim();
  }

  const bgColors = ["#eff6ff", "#fdf2f8", "#fffbeb", "#f0fdf4"];
  const textColors = ["#1e40af", "#9d174d", "#92400e", "#166534"];
  const borderColors = ["#bfdbfe", "#fbcfe8", "#fde68a", "#bbf7d0"];

  const themeIdx = index % 4;

  return (
    <div
      onClick={() => setRevealed(!revealed)}
      style={{
        cursor: "pointer",
        perspective: "1000px",
        height: "65px",
        display: "flex",
        userSelect: "none",
        position: "relative",
      }}
    >
      <div style={{
        flex: 1,
        position: "relative",
        transformStyle: "preserve-3d",
        transition: "transform 0.5s cubic-bezier(0.19, 1, 0.22, 1)",
        transform: revealed ? "rotateY(180deg)" : "none",
      }}>
        {/* FRONT */}
        <div style={{
          position: "absolute",
          inset: 0,
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          background: bgColors[themeIdx],
          color: textColors[themeIdx],
          border: `2.5px solid ${borderColors[themeIdx]}`,
          borderRadius: "0.85rem",
          padding: "0.6rem 0.85rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontWeight: 800,
          fontSize: "0.8rem",
          boxShadow: `0 3.5px 0 ${borderColors[themeIdx]}`,
          boxSizing: "border-box",
        }}>
          <span style={{ fontSize: "1.1rem" }}>❓</span>
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {front}
          </span>
        </div>

        {/* BACK */}
        <div style={{
          position: "absolute",
          inset: 0,
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
          background: "#ffffff",
          color: "#374151",
          border: "2.5px solid #e5e7eb",
          borderRadius: "0.85rem",
          padding: "0.5rem 0.75rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.78rem",
          lineHeight: 1.35,
          boxShadow: "0 3.5px 0 #e5e7eb",
          boxSizing: "border-box",
          overflowY: "auto",
        }}>
          <span style={{ fontSize: "1.1rem" }}>✅</span>
          <span style={{ flex: 1 }}>{back}</span>
        </div>
      </div>
    </div>
  );
}

interface LessonTopic {
  title: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  /** Spoken aloud when no audioUrl is set */
  audioText?: string;
  body: React.ReactNode;
}

function TopicAudioBar({
  audioUrl,
  audioText,
  resetKey,
  allowSpeechFallback = false,
}: {
  audioUrl?: string;
  audioText?: string;
  resetKey: string;
  /** When false, only uploaded audioUrl is shown (learn/invite pages). */
  allowSpeechFallback?: boolean;
}) {
  const speechText = allowSpeechFallback ? audioText?.trim() : undefined;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [durationLabel, setDurationLabel] = useState("0:00");
  const [currentLabel, setCurrentLabel] = useState("0:00");

  const formatTime = (secs: number) => {
    if (!Number.isFinite(secs) || secs < 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const clearSpeechTimer = useCallback(() => {
    if (speechTimerRef.current) {
      clearInterval(speechTimerRef.current);
      speechTimerRef.current = null;
    }
  }, []);

  const stopSpeech = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    clearSpeechTimer();
  }, [clearSpeechTimer]);

  const stopAll = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    stopSpeech();
    setPlaying(false);
    setProgress(0);
    setCurrentLabel("0:00");
  }, [stopSpeech]);

  useEffect(() => {
    stopAll();
    return () => stopAll();
  }, [resetKey, stopAll]);

  useEffect(() => {
    if (!audioUrl) return;
    const optimized = optimizeMediaUrl(audioUrl, "audio");
    if (!optimized) return;
    const el = new Audio(optimized);
    el.preload = "auto";
    audioRef.current = el;

    const onTime = () => {
      if (!el.duration) return;
      setProgress((el.currentTime / el.duration) * 100);
      setCurrentLabel(formatTime(el.currentTime));
    };
    const onMeta = () => setDurationLabel(formatTime(el.duration));
    const onEnded = () => {
      setPlaying(false);
      setProgress(0);
      setCurrentLabel("0:00");
    };

    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("ended", onEnded);

    return () => {
      el.pause();
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("ended", onEnded);
      audioRef.current = null;
    };
  }, [audioUrl]);

  const startSpeech = useCallback(() => {
    if (!speechText || typeof window === "undefined" || !window.speechSynthesis) return;

    stopSpeech();
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = "en-IN";
    utterance.rate = 0.95;

    const wordCount = speechText.split(/\s+/).filter(Boolean).length;
    const estimatedMs = Math.max(wordCount * 450, 2000);
    const start = Date.now();

    utterance.onend = () => {
      clearSpeechTimer();
      setPlaying(false);
      setProgress(100);
      setCurrentLabel(formatTime(estimatedMs / 1000));
    };
    utterance.onerror = () => {
      clearSpeechTimer();
      setPlaying(false);
    };

    setDurationLabel(formatTime(estimatedMs / 1000));
    setPlaying(true);
    setProgress(0);
    setCurrentLabel("0:00");

    speechTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / estimatedMs) * 100);
      setProgress(pct);
      setCurrentLabel(formatTime(elapsed / 1000));
    }, 100);

    window.speechSynthesis.speak(utterance);
  }, [speechText, stopSpeech, clearSpeechTimer]);

  const toggle = () => {
    if (audioUrl && audioRef.current) {
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
      } else {
        void audioRef.current.play();
        setPlaying(true);
      }
      return;
    }

    if (!speechText) return;
    if (playing) {
      stopSpeech();
      setPlaying(false);
      return;
    }
    startSpeech();
  };

  if (!audioUrl && !speechText) {
    return null;
  }

  return (
    <div
      className="topic-audio-bar"
      role="group"
      aria-label="Listen to this topic"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.85rem",
        width: "100%",
        maxWidth: "100%",
        padding: "0.85rem 1rem",
        borderRadius: "1.25rem",
        border: "2.5px solid #86efac",
        background: "linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%)",
        boxShadow: "0 4px 0 #4ade80",
        boxSizing: "border-box",
        minHeight: 64,
      }}
    >
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause audio" : "Play audio"}
        style={{
          width: 48,
          height: 48,
          flexShrink: 0,
          borderRadius: "50%",
          border: "none",
          background: "linear-gradient(180deg, #4ade80, #22c55e)",
          color: "white",
          fontSize: "1.15rem",
          fontWeight: 800,
          cursor: "pointer",
          boxShadow: "0 4px 0 #15803d",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {playing ? "❚❚" : "▶"}
      </button>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        <div
          style={{
            height: 12,
            borderRadius: 999,
            background: "rgba(22, 163, 74, 0.18)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              borderRadius: 999,
              background: "linear-gradient(90deg, #22c55e, #16a34a)",
              transition: "width 0.15s linear",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "#166534",
          }}
        >
          <span>{currentLabel}</span>
          <span>{playing ? "Playing…" : "Tap play to listen"}</span>
          <span>{durationLabel}</span>
        </div>
      </div>
    </div>
  );
}

function getLessonTopics(lesson: Lesson): LessonTopic[] {
  if (lesson.pages && lesson.pages.length > 0) {
    return lesson.pages.map((page) => ({
      title: page.title,
      imageUrl: page.imageUrl || lesson.imageUrl,
      videoUrl: page.videoUrl,
      audioUrl: page.audioUrl,
      audioText: page.audioText,
      body: (
        <div
          style={{ margin: 0, lineHeight: 1.55, color: "#4b5563", fontSize: "0.95rem", fontWeight: 600 }}
          dangerouslySetInnerHTML={{
            __html: page.content?.includes("<")
              ? page.content
              : `<p style="margin:0">${(page.content || "").replace(/\n/g, "<br/>")}</p>`,
          }}
        />
      ),
    }));
  }

  if (lesson.id === "comparing-numbers") {
    return [
      {
        title: "1. What is Compare in Maths?",
        imageUrl: lesson.imageUrl,
        audioText:
          "What is Compare in Maths? Compare karne ka matlab hota hai do ya zyada numbers ko dekhkar decide karna ki kaunsa bada hai, kaunsa chhota hai, ya dono barabar hain.",
        body: (
          <p style={{ margin: 0, lineHeight: 1.55, color: "#4b5563", fontSize: "0.95rem" }}>
            Compare karne ka matlab hota hai do ya zyada numbers ko dekhkar decide karna ki kaunsa bada hai, kaunsa chhota hai, ya dono barabar hain.
          </p>
        ),
      },
      {
        title: "2. Important Symbols",
        imageUrl: lesson.imageUrl,
        audioText:
          "Important Symbols. Greater Than means bada hai, for example 8 greater than 5. Less Than means chhota hai, for example 3 less than 7. Equal to means barabar hai, for example 6 equals 6.",
        body: (
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <span style={{ padding: "0.4rem 0.7rem", background: "#f3f4f6", borderRadius: "0.5rem", fontWeight: 700 }}>&gt; (Greater Than / bada hai) [8 &gt; 5]</span>
            <span style={{ padding: "0.4rem 0.7rem", background: "#f3f4f6", borderRadius: "0.5rem", fontWeight: 700 }}>&lt; (Less Than / chhota hai) [3 &lt; 7]</span>
            <span style={{ padding: "0.4rem 0.7rem", background: "#f3f4f6", borderRadius: "0.5rem", fontWeight: 700 }}>= (Equal to / barabar hai) [6 = 6]</span>
          </div>
        ),
      },
      {
        title: "3. Kaise Compare karte hain?",
        imageUrl: lesson.imageUrl,
        audioText:
          "Kaise Compare karte hain? Step 1: Digits count karo. Jis number mein zyada digits hain wo bada hota hai, jaise 254 greater than 99. Step 2: Digits same hain to left se compare karo. Hundreds, tens, then ones place check karo, jaise 457 less than 489.",
        body: (
          <ul style={{ margin: 0, paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.4rem", lineHeight: 1.5, fontSize: "0.92rem" }}>
            <li><strong>Step 1: Digits count karo</strong> — Jis number mein zyada digits hain wo bada hota hai. <span style={{ color: "#059669", fontWeight: 600 }}>(254 &gt; 99)</span></li>
            <li><strong>Step 2: Digits same hain to left se compare karo</strong> — Hundreds, tens, then ones place check karo. <span style={{ color: "#059669", fontWeight: 600 }}>(457 &lt; 489)</span></li>
          </ul>
        ),
      },
      {
        title: "4. Comparing Decimals",
        imageUrl: lesson.imageUrl,
        audioText:
          "Comparing Decimals. Pehle whole part compare karo. Whole part same ho, to decimal point ke baad tenths place compare karo. For example, 3.4 is greater than 3.09.",
        body: (
          <p style={{ margin: 0, lineHeight: 1.55, color: "#4b5563", fontSize: "0.95rem" }}>
            Pehle whole part compare karo. Whole part same ho, to decimal point ke baad tenths place compare karo. <span style={{ color: "#059669", fontWeight: 600 }}>(3.4 &gt; 3.09)</span>
          </p>
        ),
      },
      {
        title: "5. Real-life Examples",
        imageUrl: lesson.imageUrl,
        audioText:
          "Real-life Examples. Mere paas 5 apples hain, dost ke paas 8, so 5 is less than 8. Market mein 50 rupees versus 20 rupees items, so 50 is greater than 20.",
        body: (
          <p style={{ margin: 0, lineHeight: 1.55, color: "#4b5563", fontSize: "0.95rem" }}>
            • Mere paas 5 apples hain, dost ke paas 8: <span style={{ fontWeight: 700 }}>5 &lt; 8</span><br />
            • Market mein 50 Rs vs 20 Rs items: <span style={{ fontWeight: 700 }}>50 &gt; 20</span>
          </p>
        ),
      },
    ];
  }

  if (lesson.id === "organising-data") {
    return [
      {
        title: "1. What is Data?",
        audioText:
          "What is Data? Jab hum kisi topic par information ikatthi karte hain, jaise favourite fruit ya recess snack choices, use data kehte hain. Usko arrange karna bohot zaroori hota hai!",
        body: (
          <p style={{ margin: 0, lineHeight: 1.55, color: "#4b5563", fontSize: "0.95rem" }}>
            Jab hum kisi topic par information ikatthi karte hain (jaise favourite fruit, recess snack choices), use data kehte hain. Usko arrange karna bohot zaroori hota hai!
          </p>
        ),
      },
      {
        title: "2. Organising Data ka matlab",
        audioText:
          "Organising Data ka matlab. Data ko saaf, simple aur arranged tareeke se table, list ya graph mein likhna, taaki easily samajh aaye.",
        body: (
          <p style={{ margin: 0, lineHeight: 1.55, color: "#4b5563", fontSize: "0.95rem" }}>
            Data ko saaf, simple aur arranged tareeke se table, list ya graph mein likhna, taaki easily samajh aaye.
          </p>
        ),
      },
      {
        title: "3. Example: Colour Survey Table",
        audioText:
          "Colour Survey Table example. Blue has 4 votes, Red has 3 votes, Green has 2 votes, and Yellow has 1 vote. Blue is the most popular colour!",
        body: (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ background: "#f3f4f6", borderBottom: "1.5px solid #e5e7eb" }}>
                <th style={{ padding: "0.35rem 0.5rem", textAlign: "left", fontWeight: 700 }}>Colour</th>
                <th style={{ padding: "0.35rem 0.5rem", textAlign: "right", fontWeight: 700 }}>Votes Count</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "0.35rem 0.5rem" }}>🔵 Blue</td>
                <td style={{ padding: "0.35rem 0.5rem", textAlign: "right", fontWeight: 700 }}>4</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "0.35rem 0.5rem" }}>🔴 Red</td>
                <td style={{ padding: "0.35rem 0.5rem", textAlign: "right", fontWeight: 700 }}>3</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "0.35rem 0.5rem" }}>🟢 Green</td>
                <td style={{ padding: "0.35rem 0.5rem", textAlign: "right", fontWeight: 700 }}>2</td>
              </tr>
              <tr>
                <td style={{ padding: "0.35rem 0.5rem" }}>🟡 Yellow</td>
                <td style={{ padding: "0.35rem 0.5rem", textAlign: "right", fontWeight: 700 }}>1</td>
              </tr>
            </tbody>
          </table>
        ),
      },
      {
        title: "4. Organising ke Fayde (Benefits)",
        audioText:
          "Organising ke Fayde. Data samajhna easy ho jaata hai aur compare karna asaan hota hai. Bar graph, pictograph ya tally table banana possible ho jaata hai!",
        body: (
          <p style={{ margin: 0, lineHeight: 1.55, color: "#4b5563", fontSize: "0.95rem" }}>
            ✔ Data samajhna easy ho jaata hai & compare karna asaan hota hai.<br />
            ✔ Bar graph, pictograph ya tally table banana possible ho jaata hai!
          </p>
        ),
      },
    ];
  }

  if (lesson.id === "geometry") {
    return [
      {
        title: "1. Point (A dot / exact position)",
        imageUrl: lesson.imageUrl,
        audioText:
          "Point. A point shows an exact position. It has no length, no width. For example, a pencil dot, stars, or location pins.",
        body: (
          <p style={{ margin: 0, lineHeight: 1.55, color: "#4b5563", fontSize: "0.95rem" }}>
            A point shows an exact position. It has no length, no width. (e.g., A pencil dot, stars, location pins).
          </p>
        ),
      },
      {
        title: "2. Line (Goes on forever both sides)",
        imageUrl: lesson.imageUrl,
        audioText:
          "Line. Line dono taraf infinity tak chalti rehti hai. For example, a straight road or railway track.",
        body: (
          <p style={{ margin: 0, lineHeight: 1.55, color: "#4b5563", fontSize: "0.95rem" }}>
            Line dono taraf infinity tak chalti rehti hai. Symbol: ↔ AB. (e.g., straight road, railway track).
          </p>
        ),
      },
      {
        title: "3. Line Segment (Has 2 fixed ends)",
        imageUrl: lesson.imageUrl,
        audioText:
          "Line Segment. Line ka wo hissa jiska start aur end fixed ho. For example, a ruler edge or a matchstick.",
        body: (
          <p style={{ margin: 0, lineHeight: 1.55, color: "#4b5563", fontSize: "0.95rem" }}>
            Line ka wo hissa jiska start aur end fixed ho. Symbol: AB̅. (e.g., Ruler edge, matchstick).
          </p>
        ),
      },
      {
        title: "4. Ray (Kiran)",
        imageUrl: lesson.imageUrl,
        audioText:
          "Ray, or Kiran. Ray ek side se start hoti hai aur doosri side infinity tak jaati hai. For example, sunlight or a torch beam.",
        body: (
          <p style={{ margin: 0, lineHeight: 1.55, color: "#4b5563", fontSize: "0.95rem" }}>
            Ray ek side se start hoti hai aur doosri side infinity tak jaati hai. Symbol: → AB. (e.g., Sunlight, torch beam).
          </p>
        ),
      },
    ];
  }

  // Fallback: one card per fact (skip Think Box lines)
  return lesson.facts
    .filter((fact) => !fact.trim().startsWith("💡"))
    .map((fact, i) => {
      const [titlePart, ...rest] = fact.split(" : ");
      const title = rest.length ? `${i + 1}. ${titlePart}` : `Lesson page ${i + 1}`;
      const text = rest.length ? rest.join(" : ") : fact;
      return {
        title,
        imageUrl: lesson.imageUrl,
        audioText: `${title}. ${text}`,
        body: <InteractiveFactCard index={i} fact={text} />,
      };
    });
}

function LessonPage({
  lesson,
  onStartQuiz,
  transitionClass,
  allowSpeechFallback = false,
}: {
  lesson: Lesson;
  onStartQuiz: () => void;
  transitionClass: string;
  allowSpeechFallback?: boolean;
}) {
  const topics = getLessonTopics(lesson);
  const [topicIndex, setTopicIndex] = useState(0);

  // Reset topic pager when switching lessons
  React.useEffect(() => {
    setTopicIndex(0);
  }, [lesson.id]);

  const safeIndex = Math.min(topicIndex, Math.max(topics.length - 1, 0));
  const topic = topics[safeIndex];
  const isLastTopic = safeIndex >= topics.length - 1;
  const hasVisual = Boolean(topic?.videoUrl || topic?.imageUrl);

  const handleNext = () => {
    if (isLastTopic) {
      onStartQuiz();
      return;
    }
    setTopicIndex((i) => i + 1);
  };

  if (!topic) return null;

  return (
    <div className={`mascot-card-wrapper ${transitionClass}`}>
      <div className="mascot-player-card">
        {/* LEFT: lesson name + optional image */}
        <div
          className={`mascot-player-left mascot-player-left--topics${hasVisual ? "" : " mascot-player-left--no-image"}`}
        >
          <h2 className="mascot-left-title" style={{
              margin: 0,
              fontSize: hasVisual ? "1.15rem" : "1.45rem",
              fontWeight: 900,
              color: "#111827",
              lineHeight: 1.3,
              letterSpacing: "-0.02em",
              textAlign: hasVisual ? "left" : "center",
              alignSelf: hasVisual ? "flex-start" : "center",
              width: "100%",
            }}
          >
            {lesson.title}
          </h2>
          {topic.videoUrl ? (
            <PlayerVideo src={topic.videoUrl} />
          ) : topic.imageUrl ? (
            <PlayerImage src={topic.imageUrl} alt={lesson.title} />
          ) : null}
          <p className="mascot-page-indicator" style={{
              margin: hasVisual ? "auto 0 0" : 0,
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "#6b7280",
              alignSelf: hasVisual ? "flex-start" : "center",
              textAlign: hasVisual ? "left" : "center",
              width: "100%",
            }}
          >
            Lesson page {safeIndex + 1} of {topics.length}
          </p>
        </div>

        {/* RIGHT: topic question + answer */}
        <div className="mascot-player-right">
          {lesson.badgeText && (
            <span className="mascot-badge" style={{ fontSize: "0.65rem", padding: "0.2rem 0.65rem", display: "inline-flex", alignSelf: "flex-start" }}>
              🌿 {lesson.badgeText}
            </span>
          )}

          {lesson.mascotSpeech && (
            <div className="mascot-lesson-speech">
              <MascotSvg size={44} animate />
              <div className="mascot-lesson-speech-bubble">
                {lesson.mascotSpeech}
              </div>
            </div>
          )}

          <div className="mascot-lesson-body">
            <h1
              style={{
                margin: 0,
                fontSize: "1.2rem",
                fontWeight: 900,
                color: "#111827",
                lineHeight: 1.3,
                letterSpacing: "-0.025em",
                textAlign: "left",
              }}
            >
              {topic.title}
            </h1>
            <div style={{ width: "100%", textAlign: "left" }}>
              {topic.body}
            </div>
            <TopicAudioBar
              audioUrl={topic.audioUrl}
              audioText={topic.audioText}
              allowSpeechFallback={allowSpeechFallback}
              resetKey={`${lesson.id}-${safeIndex}`}
            />
          </div>

          <div className="mascot-lesson-nav">
            <button
              type="button"
              disabled={safeIndex === 0}
              onClick={() => setTopicIndex((i) => Math.max(0, i - 1))}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "0.45rem 1rem",
                borderRadius: "999px",
                border: "2px solid #e5e7eb",
                background: safeIndex === 0 ? "#f9fafb" : "white",
                color: safeIndex === 0 ? "#9ca3af" : "#374151",
                fontWeight: 800,
                fontSize: "0.8rem",
                cursor: safeIndex === 0 ? "not-allowed" : "pointer",
              }}
            >
              ← Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1.4rem",
                borderRadius: "999px",
                border: "none",
                background: "linear-gradient(180deg, #ff9f43, #ff6b35)",
                color: "white",
                fontWeight: 800,
                fontSize: "0.85rem",
                cursor: "pointer",
                boxShadow: "0 4px 0 #c44d00",
                transition: "transform 0.1s, box-shadow 0.1s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 5px 0 #c44d00";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 4px 0 #c44d00";
              }}
            >
              {isLastTopic ? "Start Quiz →" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


function QuizCard({
  lesson,
  questionIndex,
  onComplete,
  onScoreChange,
  onInviteProgress,
  onBackToLesson,
  transitionClass,
  inviteToken,
  reviewMode = false,
  allowSpeechFallback = false,
}: {
  lesson: Lesson;
  onBackToLesson: () => void;
  transitionClass: string;
  questionIndex: number;
  onComplete: () => void;
  onScoreChange: (delta: number) => void;
  onInviteProgress?: (update: {
    score?: number;
    maxScore?: number;
    phase?: string;
    completedLessonIds?: string[];
  }) => void;
  inviteToken?: string;
  reviewMode?: boolean;
  allowSpeechFallback?: boolean;
}) {
  const questions = lesson.quizQuestions;
  const question = questions[questionIndex];
  const total = questions.length;
  const visibleOptions = question.options.filter((o) => (o.text || "").trim().length > 0);
  const hasImage = Boolean(question.imageUrl || question.videoUrl);
  const hasAudio = Boolean(
    question.audioUrl || (allowSpeechFallback && question.audioText?.trim()),
  );

  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [revealedCorrect, setRevealedCorrect] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [hintText, setHintText] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const advancedRef = useRef(false);

  useEffect(() => {
    setShowHint(false);
    setHintText(null);
    setSelected(null);
    setAnswered(false);
    setRevealedCorrect(null);
    advancedRef.current = false;
  }, [questionIndex, question.id]);

  const toDisplayCorrect = (raw: number | undefined | null) => {
    if (raw === undefined || raw === null) return question.correctIndex;
    const byOrig = visibleOptions.findIndex((o) => (o.originalIndex ?? -1) === raw);
    if (byOrig >= 0) return byOrig;
    return raw;
  };

  const correctIndex = revealedCorrect ?? question.correctIndex;
  const isCorrect = selected !== null && selected === correctIndex;

  const handleSelect = async (idx: number) => {
    if (answered || submitting) return;
    setSelected(idx);
    const originalIndex = visibleOptions[idx]?.originalIndex ?? idx;

    if (inviteToken && !reviewMode) {
      setSubmitting(true);
      try {
        const res = await fetch(`/api/learn/${inviteToken}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            action: "quiz_answer",
            questionId: question.id,
            selectedIndex: originalIndex,
          }),
          cache: "no-store",
        });
        const raw = await res.text();
        let data: {
          error?: string;
          correctIndex?: number;
          correct?: boolean;
          pointsEarned?: number;
          explanation?: string;
          wrongExplanation?: string;
          score?: number;
          maxScore?: number;
          phase?: string;
          completedLessonIds?: string[];
        } = {};
        try {
          data = JSON.parse(raw) as typeof data;
        } catch {
          throw new Error("Quiz API returned a non-JSON response. Please refresh and try again.");
        }
        if (!res.ok) throw new Error(data.error ?? "Answer failed");
        setRevealedCorrect(toDisplayCorrect(data.correctIndex ?? originalIndex));
        setAnswered(true);
        if (typeof data.score === "number") {
          onInviteProgress?.({
            score: data.score,
            maxScore: data.maxScore,
            phase: data.phase,
            completedLessonIds: data.completedLessonIds,
          });
        }
        if (data.correct) {
          onScoreChange(typeof data.pointsEarned === "number" ? data.pointsEarned : 0);
        } else {
          onScoreChange(-1);
        }
        if (data.explanation) question.explanation = data.explanation;
        if (data.wrongExplanation) question.wrongExplanation = data.wrongExplanation;
      } catch (err) {
        console.error("quiz_answer failed:", err);
        setAnswered(false);
        setSelected(null);
        window.alert(err instanceof Error ? err.message : "Could not submit answer. Please try again.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setAnswered(true);
    if (idx === question.correctIndex) onScoreChange(10);
    else onScoreChange(-1);
  };

  const handleNext = () => {
    if (advancedRef.current) return;
    advancedRef.current = true;
    onComplete();
  };

  const handleShowHint = () => {
    if (question.hint) setHintText(question.hint);
    setShowHint(true);
  };

  const progressHeader = (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: "0.3rem",
        padding: "0.25rem 0.75rem", borderRadius: "999px",
        border: "1.5px solid #fcd34d",
        background: "linear-gradient(135deg, #fffbeb, #fef3c7)",
        fontSize: "0.65rem", fontWeight: 800, color: "#92400e",
        textTransform: "uppercase",
      }}>
        ⏱ Q{questionIndex + 1} of {total}
      </span>
      <div style={{ display: "flex", gap: "0.3rem" }}>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} style={{
            width: i === questionIndex ? 20 : 10, height: 10,
            borderRadius: "999px",
            background: i < questionIndex ? "#22c55e" : i === questionIndex ? "#6366f1" : "#e2e8f0",
            transition: "all 0.3s",
          }} />
        ))}
      </div>
    </div>
  );

  return (
    <div
      className={`mascot-card-wrapper ${transitionClass} ${answered && !isCorrect ? "quiz-card-shake" : ""}`}
    >
      <div className="mascot-player-card">
        {hasImage && (
          <div className="mascot-player-left-quiz" style={{ flexDirection: "column", gap: "0.75rem" }}>
            {question.videoUrl ? (
              <PlayerVideo src={question.videoUrl} />
            ) : (
              <PlayerImage src={question.imageUrl} alt="" />
            )}
            <p className="mascot-page-indicator" style={{ margin: "auto 0 0", alignSelf: "flex-start" }}>
              Question {questionIndex + 1} of {total}
            </p>
          </div>
        )}

        <div
          className="mascot-player-right-quiz"
          style={{ width: hasImage ? undefined : "100%", flex: 1 }}
        >
          {progressHeader}

          <div style={{ flexShrink: 0 }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 900, color: "#111827", margin: "0 0 0.25rem", lineHeight: 1.3 }}>
              {question.question}
            </h2>
            {question.subtitle && (
              <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: 0, lineHeight: 1.4 }}>
                {question.subtitle}
              </p>
            )}
          </div>

          {hasAudio && (
            <TopicAudioBar
              audioUrl={question.audioUrl}
              audioText={question.audioText}
              allowSpeechFallback={allowSpeechFallback}
              resetKey={`${question.id}-audio`}
            />
          )}

          <div className="mascot-quiz-options" style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flex: 1 }}>
            {visibleOptions.map((opt, idx) => {
              let bg = "white", border = "#e5e7eb", shadow = "#e5e7eb", color = "#374151";
              if (answered) {
                if (idx === correctIndex) {
                  bg = "linear-gradient(135deg, #f0fdf4, #dcfce7)";
                  border = "#22c55e"; shadow = "#16a34a"; color = "#14532d";
                } else if (idx === selected) {
                  bg = "linear-gradient(135deg, #fef2f2, #fee2e2)";
                  border = "#f87171"; shadow = "#ef4444"; color = "#7f1d1d";
                }
              }
              return (
                <button
                  key={`${opt.originalIndex ?? idx}-${opt.text}`}
                  type="button"
                  disabled={answered || submitting}
                  onClick={() => void handleSelect(idx)}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.7rem",
                    padding: "0.6rem 0.85rem",
                    borderRadius: "0.875rem",
                    border: `2.5px solid ${border}`,
                    background: bg,
                    cursor: answered || submitting ? "default" : "pointer",
                    textAlign: "left", width: "100%",
                    fontSize: "0.85rem", fontWeight: 700, color,
                    boxShadow: answered && (idx === correctIndex || idx === selected)
                      ? `0 4px 0 ${shadow}` : "0 3px 0 #e5e7eb",
                    transition: "all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                  }}
                  onMouseEnter={e => {
                    if (!answered && !submitting) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "#a78bfa";
                      (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!answered && !submitting) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "#e5e7eb";
                      (e.currentTarget as HTMLButtonElement).style.transform = "none";
                    }
                  }}
                >
                  <span style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 32, height: 32, borderRadius: "0.5rem",
                    background: "#f1f5f9", fontSize: "1.1rem", flexShrink: 0,
                  }}>{opt.emoji}</span>
                  <span style={{ flex: 1, fontWeight: 600 }}>{opt.text}</span>
                  {answered && idx === correctIndex && (
                    <span style={{
                      width: 24, height: 24, borderRadius: "50%",
                      background: "#22c55e", color: "white",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.75rem", fontWeight: 800, flexShrink: 0,
                    }}>✓</span>
                  )}
                  {answered && idx === selected && idx !== correctIndex && (
                    <span style={{
                      width: 24, height: 24, borderRadius: "50%",
                      background: "#ef4444", color: "white",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.75rem", fontWeight: 800, flexShrink: 0,
                    }}>✕</span>
                  )}
                </button>
              );
            })}
          </div>

          {answered && (
            <div
              className="mascot-animate-up"
              style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "0.7rem 0.9rem",
                borderRadius: "0.875rem",
                border: `2px solid ${isCorrect ? "#86efac" : "#fca5a5"}`,
                background: isCorrect
                  ? "linear-gradient(135deg, #f0fdf4, #dcfce7)"
                  : "linear-gradient(135deg, #fef2f2, #fee2e2)",
                flexShrink: 0,
              }}
            >
              <MascotSvg size={44} expression={isCorrect ? "correct" : "incorrect"} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "0.9rem", fontWeight: 800, margin: "0 0 0.15rem", color: isCorrect ? "#065f46" : "#991b1b" }}>
                  {isCorrect ? "Yay! 🎉" : "Oops! 🤭"}
                </p>
                <p style={{ fontSize: "0.78rem", color: isCorrect ? "#047857" : "#b91c1c", margin: 0, lineHeight: 1.4 }}>
                  {isCorrect ? question.explanation : (question.wrongExplanation ?? question.explanation)}
                </p>
              </div>
              <button
                type="button"
                onClick={handleNext}
                style={{
                  padding: "0.5rem 1rem", borderRadius: "0.75rem",
                  border: "none",
                  background: isCorrect ? "#16a34a" : "#3b82f6",
                  color: "white", fontSize: "0.85rem", fontWeight: 800,
                  cursor: "pointer", whiteSpace: "nowrap",
                  boxShadow: isCorrect ? "0 3px 0 #166534" : "0 3px 0 #1d4ed8",
                  flexShrink: 0,
                }}
              >
                Next →
              </button>
            </div>
          )}

          {question.hint && (
            <div style={{ flexShrink: 0, alignSelf: "flex-start" }}>
              {!showHint ? (
                <button
                  type="button"
                  onClick={handleShowHint}
                  className="hint-blink-tab"
                  aria-label="Show hint"
                >
                  <span className="hint-blink-bulb" aria-hidden>💡</span>
                  <span className="hint-blink-label">hint</span>
                </button>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.65rem",
                    padding: "0.7rem 0.9rem",
                    borderRadius: "0.875rem",
                    background: "#fffbeb",
                    border: "2px solid #fde68a",
                    maxWidth: "100%",
                  }}
                >
                  <span style={{ fontSize: "1.35rem", lineHeight: 1 }} aria-hidden>💡</span>
                  <div style={{ minWidth: 0 }}>
                    <p style={{
                      fontSize: "0.75rem", fontWeight: 800, color: "#92400e",
                      margin: "0 0 0.2rem", textTransform: "uppercase", letterSpacing: "0.04em",
                    }}>
                      Hint
                    </p>
                    <p style={{ fontSize: "0.85rem", color: "#b45309", margin: 0, lineHeight: 1.45, fontWeight: 600 }}>
                      {hintText ?? question.hint}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
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

  const descText = correctCount === 1
    ? "One right answer and BOOM — you popped out of the dirt! Photosynthesis is jealous."
    : correctCount >= totalQuestions
    ? "Perfect score! You're a full-grown legend. 🌳"
    : "Keep going — you're growing! Answer more to level up.";

  return (
    <div className="mascot-journey-footer-card">
      {/* LEFT: Text Info */}
      <div className="mascot-journey-footer-text">
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem", flexWrap: "wrap" }}>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
            padding: "0.25rem 0.75rem",
            borderRadius: "999px",
            border: "1.5px solid #86efac",
            background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
            fontSize: "0.7rem",
            fontWeight: 800,
            color: "#166534",
            textTransform: "uppercase",
          }}>
            🌱 Level {levelIdx + 1}
          </span>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 900, color: "#1f2937", margin: 0 }}>
            {levelName} MODE ACTIVATED!
          </h3>
        </div>
        <p style={{ fontSize: "0.82rem", color: "#6b7280", margin: 0, lineHeight: 1.4 }}>
          {descText}
        </p>
      </div>

      {/* RIGHT: Progress Slider & Plant Level Labels */}
      <div className="mascot-journey-footer-progress">
        {/* Track */}
        <div style={{
          height: "12px",
          background: "#e2e8f0",
          borderRadius: "999px",
          position: "relative",
          overflow: "visible",
          margin: "0 10px",
        }}>
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: `${progressPct}%`,
            background: "linear-gradient(90deg, #4ade80, #22c55e)",
            borderRadius: "999px",
            transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          }} />
          <div style={{
            position: "absolute",
            top: "-12px",
            left: `calc(${progressPct}% - 18px)`,
            transition: "left 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          }}>
            <MascotSvg size={36} />
          </div>
        </div>

        {/* Small Plant Labels Row */}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "0 10px" }}>
          {PLANT_LEVELS.map((lvl, i) => (
            <div key={lvl} style={{ display: "flex", alignItems: "center", gap: "0.2rem", fontSize: "0.72rem" }}>
              <span>{PLANT_LEVEL_EMOJIS[i]}</span>
              <span style={{
                fontWeight: i <= levelIdx ? 800 : 500,
                color: i <= levelIdx ? "#047857" : "#9ca3af",
              }}>
                {lvl}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */

type ViewMode = "lesson" | "quiz";

export function MascotQuizPlayer({
  initialLessonId,
  invite,
  staticDemo = false,
}: {
  initialLessonId?: string;
  /** Built-in ALL_MATH_LESSONS preview — never calls the lessons API. */
  staticDemo?: boolean;
  invite?: {
    token: string;
    lessons: InvitePlayLesson[];
    score: number;
    maxScore: number;
    completedLessonIds: string[];
    contentCompletedLessonIds: string[];
    reviewMode?: boolean;
    onProgress?: (update: {
      score?: number;
      maxScore?: number;
      phase?: string;
      completedLessonIds?: string[];
      contentCompletedLessonIds?: string[];
    }) => void;
    onExitToMap?: () => void;
  };
}) {
  const [remoteLesson, setRemoteLesson] = useState<Lesson | null>(null);
  const [remoteLoading, setRemoteLoading] = useState(
    Boolean(initialLessonId) && !invite && !staticDemo,
  );
  const [remoteError, setRemoteError] = useState("");

  useEffect(() => {
    if (invite || staticDemo || !initialLessonId) {
      setRemoteLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/public/lessons/${encodeURIComponent(initialLessonId)}`);
        const data = await res.json();
        if (!res.ok) {
          if (!cancelled) setRemoteLoading(false);
          return;
        }
        if (cancelled) return;
        const apiLesson = data.lesson;
        setRemoteLesson({
          id: apiLesson.id,
          mongoId: apiLesson.mongoId,
          title: apiLesson.title,
          badgeText: apiLesson.badgeText,
          mascotSpeech: apiLesson.mascotSpeech,
          facts: apiLesson.facts ?? [],
          ctaText: apiLesson.ctaText || "Next",
          imageUrl: apiLesson.imageUrl,
          pages: apiLesson.pages,
          quizQuestions: (apiLesson.quizQuestions ?? []).map(
            (q: {
              id: string;
              question: string;
              subtitle?: string;
              options: { emoji: string; text: string; originalIndex?: number }[];
              correctIndex: number;
              explanation: string;
              wrongExplanation?: string;
              hint?: string;
              imageUrl?: string;
              videoUrl?: string;
              audioUrl?: string;
              audioText?: string;
            }) => ({
              id: q.id,
              question: q.question,
              subtitle: q.subtitle,
              options: (q.options ?? [])
                .map((o, i) => ({
                  emoji: o.emoji || "⭐",
                  text: o.text,
                  originalIndex: o.originalIndex ?? i,
                }))
                .filter((o) => (o.text || "").trim().length > 0),
              correctIndex: q.correctIndex,
              explanation: q.explanation,
              wrongExplanation: q.wrongExplanation,
              hint: q.hint,
              imageUrl: q.imageUrl,
              videoUrl: q.videoUrl,
              audioUrl: q.audioUrl,
              audioText: q.audioText,
            }),
          ),
        });
      } catch {
        if (!cancelled) setRemoteError("Could not load lesson");
      } finally {
        if (!cancelled) setRemoteLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialLessonId, invite, staticDemo]);

  const lessonList: Lesson[] = invite
    ? invite.lessons
    : staticDemo || !remoteLesson
      ? ALL_MATH_LESSONS
      : [remoteLesson];

  const startIdx = (() => {
    if (invite && initialLessonId) {
      const idx = invite.lessons.findIndex((l) => l.id === initialLessonId);
      return idx >= 0 ? idx : 0;
    }
    if (remoteLesson) return 0;
    if (!initialLessonId) return 0;
    const idx = ALL_MATH_LESSONS.findIndex((l) => l.id === initialLessonId);
    return idx >= 0 ? idx : 0;
  })();

  const [activeLessonIndex, setActiveLessonIndex] = useState(startIdx);
  const lesson = lessonList[Math.min(activeLessonIndex, Math.max(lessonList.length - 1, 0))];
  /** TTS fallback only on the static /play demo — never on learn/invite (API lessons). */
  const allowSpeechFallback = staticDemo;
  const [viewMode, setViewMode] = useState<ViewMode>("lesson");
  const [hasStartedQuiz, setHasStartedQuiz] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [lives, setLives] = useState(7);
  const [score, setScore] = useState(invite ? invite.score : 0);

  useEffect(() => {
    if (!invite) return;
    setScore(invite.score);
  }, [invite?.score]);

  const [correctCount, setCorrectCount] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(() => {
    const unlocked = new Set<number>();
    for (let i = 0; i < startIdx; i++) unlocked.add(i);
    return unlocked;
  });

  useEffect(() => {
    if (remoteLesson) {
      setActiveLessonIndex(0);
      setViewMode("lesson");
      setHasStartedQuiz(false);
      setQuestionIndex(0);
      setCorrectCount(0);
      setQuizDone(false);
    }
  }, [remoteLesson]);

  useEffect(() => {
    if (!invite || !initialLessonId) return;
    const idx = invite.lessons.findIndex((l) => l.id === initialLessonId);
    if (idx < 0) return;
    setActiveLessonIndex(idx);
    setViewMode("lesson");
    setHasStartedQuiz(false);
    setQuestionIndex(0);
    setCorrectCount(0);
    setQuizDone(false);
    // Only re-sync when the lesson being opened changes — NOT when invite score/phase
    // updates mid-quiz (that was resetting players back to the lesson card).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- invite.lessons identity changes every parent score tick
  }, [initialLessonId, invite?.token]);

  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleQuestionComplete = useCallback(() => {
    if (!lesson) return;
    const next = questionIndex + 1;
    if (next >= lesson.quizQuestions.length) {
      setQuizDone(true);
      setCompletedLessons((prev) => new Set([...prev, activeLessonIndex]));
    } else {
      setQuestionIndex(next);
    }
  }, [questionIndex, lesson, activeLessonIndex]);

  if (remoteLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff8f0] game-font text-lg font-bold text-[#6b5b8a]">
        Loading your quest…
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff8f0] game-font text-lg font-bold text-[#6b5b8a]">
        {remoteError || "Lesson not found"}
      </div>
    );
  }

  const totalLessons = lessonList.length;
  const progressPct = (questionIndex / Math.max(lesson.quizQuestions.length, 1)) * 100;

  const isLessonUnlocked = (idx: number) =>
    idx === 0 || completedLessons.has(idx - 1);

  const handleScoreChange = (delta: number) => {
    if (invite) {
      // Invite total score is set from API via handleInviteProgress; delta only tracks
      // correct answers / lives for this lesson card.
      if (delta > 0) setCorrectCount((c) => c + 1);
      else setLives((l) => Math.max(0, l - 1));
      return;
    }
    if (delta > 0) {
      setScore((s) => s + delta);
      setCorrectCount((c) => c + 1);
    } else {
      setLives((l) => Math.max(0, l - 1));
    }
  };

  const handleInviteProgress = (update: {
    score?: number;
    maxScore?: number;
    phase?: string;
    completedLessonIds?: string[];
    contentCompletedLessonIds?: string[];
  }) => {
    if (typeof update.score === "number") {
      setScore(update.score);
    }
    invite?.onProgress?.(update);
  };

  const startQuiz = async () => {
    if (invite?.token && lesson.mongoId && !invite.reviewMode) {
      try {
        const res = await fetch(`/api/learn/${invite.token}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ action: "complete_lesson", lessonId: lesson.mongoId }),
        });
        const raw = await res.text();
        let data: { error?: string } = {};
        try {
          data = JSON.parse(raw) as { error?: string };
        } catch {
          window.alert("Could not start the quiz (API error). Please refresh and try again.");
          return;
        }
        const errMsg = String(data.error || "");
        if (!res.ok && !errMsg.toLowerCase().includes("already")) {
          window.alert(errMsg || "Could not start the quiz. Please try again.");
          return;
        }
      } catch {
        window.alert("Could not start the quiz. Check your connection and try again.");
        return;
      }
    }
    setHasStartedQuiz(true);
    setIsTransitioning(true);
    setTimeout(() => {
      setViewMode("quiz");
      setIsTransitioning(false);
    }, 450);
  };

  const switchLesson = (idx: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveLessonIndex(idx);
      setViewMode("lesson");
      setHasStartedQuiz(false);
      setQuestionIndex(0);
      setCorrectCount(0);
      setQuizDone(false);
      setIsTransitioning(false);
    }, 450);
  };

  const goToNextLesson = () => {
    const next = activeLessonIndex + 1;
    if (next < totalLessons) switchLesson(next);
    else invite?.onExitToMap?.();
  };

  return (
    <div className="mascot-shell mascot-shell-layout">
      {/* ── TOP HEADER ── */}
      <header className="mascot-header">
        <div className="mascot-header-inner">
          <Link
            href={invite ? "#" : "/"}
            onClick={(e) => {
              if (invite?.onExitToMap) {
                e.preventDefault();
                invite.onExitToMap();
              }
            }}
            className="mascot-header-brand"
            aria-label={invite ? "Back to quest map" : "Back to home"}
          >
            <MascotSvg size={24} animate={false} />
            <span className="mascot-header-brand-text">
              <BrandName />
            </span>
          </Link>

          <div className="mascot-header-lesson">
            <div className="mascot-header-lesson-badge">
              LESSON {activeLessonIndex + 1} OF {totalLessons}
            </div>
            <div className="mascot-header-lesson-title">
              {lesson.title.split(" (")[0]}
            </div>
          </div>

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

      {/* ── CONTENT — fills remaining height, scrolls internally ── */}
      <main className="mascot-main-content">


        {/* Main content — fills remaining space using grid stacking for overlay animations */}
        <div className="mascot-content-grid">
          {!quizDone ? (
            <>
              {/* LESSON CARD: Sits on top (z-index: 2) */}
              <div style={{
                gridArea: "1/1/2/2",
                zIndex: 2,
                pointerEvents: viewMode === "lesson" && !isTransitioning ? "auto" : "none",
                display: "flex",
                flexDirection: "column",
              }} className={
                viewMode === "lesson"
                  ? (isTransitioning ? "card-exit" : "card-enter")
                  : (isTransitioning ? "card-enter" : "card-hidden")
              }>
                <LessonPage
                  lesson={lesson}
                  onStartQuiz={startQuiz}
                  transitionClass=""
                  allowSpeechFallback={allowSpeechFallback}
                />
              </div>

              {/* QUIZ CARD: Sits behind (z-index: 1) */}
              <div style={{
                gridArea: "1/1/2/2",
                zIndex: 1,
                pointerEvents: viewMode === "quiz" && !isTransitioning ? "auto" : "none",
                display: "flex",
                flexDirection: "column",
              }} className={
                viewMode === "quiz"
                  ? (isTransitioning ? "quiz-hide" : "quiz-reveal")
                  : (isTransitioning ? "quiz-reveal" : "card-hidden")
              }>
                <QuizCard
                  key={`${activeLessonIndex}-${questionIndex}`}
                  lesson={lesson}
                  questionIndex={questionIndex}
                  onComplete={handleQuestionComplete}
                  onScoreChange={handleScoreChange}
                  onInviteProgress={invite ? handleInviteProgress : undefined}
                  inviteToken={invite?.token}
                  reviewMode={Boolean(invite?.reviewMode)}
                  allowSpeechFallback={allowSpeechFallback}
                  onBackToLesson={() => {
                    setIsTransitioning(true);
                    setTimeout(() => {
                      setViewMode("lesson");
                      setIsTransitioning(false);
                    }, 450);
                  }}
                  transitionClass=""
                />
              </div>
            </>
          ) : (
            <div style={{ gridArea: "1/1/2/2", flex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
              <div className="mascot-animate-in" style={{
                textAlign: "center", padding: "2rem 1.5rem",
                borderRadius: "1.5rem",
                background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
                border: "3px solid #6ee7b7",
                boxShadow: "0 6px 0 #34d399",
              }}>
                <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🎉</div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#065f46", margin: "0 0 0.5rem" }}>Amazing Job!</h2>
                <p style={{ color: "#047857", fontSize: "1rem", margin: "0 0 1.25rem" }}>
                  You crushed <strong>{lesson.title.split(" (")[0]}</strong>!
                </p>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "0.75rem",
                    flexWrap: "wrap",
                    marginBottom: "1.5rem",
                  }}
                >
                  <div
                    style={{
                      minWidth: 120,
                      padding: "0.85rem 1.1rem",
                      borderRadius: "1rem",
                      background: "white",
                      border: "2px solid #86efac",
                      boxShadow: "0 3px 0 #4ade80",
                    }}
                  >
                    <p style={{ margin: 0, fontSize: "0.7rem", fontWeight: 800, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Score
                    </p>
                    <p style={{ margin: "0.2rem 0 0", fontSize: "1.75rem", fontWeight: 900, color: "#065f46", fontFamily: "var(--font-game), Fredoka, system-ui, sans-serif" }}>
                      {invite ? score : correctCount * 10}
                      <span style={{ fontSize: "1rem", color: "#6b7280" }}>
                        {" "}
                        / {invite ? invite.maxScore : lesson.quizQuestions.length * 10}
                      </span>
                    </p>
                  </div>
                  <div
                    style={{
                      minWidth: 120,
                      padding: "0.85rem 1.1rem",
                      borderRadius: "1rem",
                      background: "white",
                      border: "2px solid #fcd34d",
                      boxShadow: "0 3px 0 #fbbf24",
                    }}
                  >
                    <p style={{ margin: 0, fontSize: "0.7rem", fontWeight: 800, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Correct
                    </p>
                    <p style={{ margin: "0.2rem 0 0", fontSize: "1.75rem", fontWeight: 900, color: "#92400e", fontFamily: "var(--font-game), Fredoka, system-ui, sans-serif" }}>
                      {correctCount}
                      <span style={{ fontSize: "1rem", color: "#6b7280" }}> / {lesson.quizQuestions.length}</span>
                    </p>
                  </div>
                  <div
                    style={{
                      minWidth: 120,
                      padding: "0.85rem 1.1rem",
                      borderRadius: "1rem",
                      background: "white",
                      border: "2px solid #c4b5fd",
                      boxShadow: "0 3px 0 #a78bfa",
                    }}
                  >
                    <p style={{ margin: 0, fontSize: "0.7rem", fontWeight: 800, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Stars
                    </p>
                    <p style={{ margin: "0.2rem 0 0", fontSize: "1.75rem", fontWeight: 900, color: "#5b21b6", fontFamily: "var(--font-game), Fredoka, system-ui, sans-serif" }}>
                      ⭐ {score}
                    </p>
                  </div>
                </div>

                {activeLessonIndex < totalLessons - 1 ? (
                  <button
                    onClick={goToNextLesson}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "0.5rem",
                      padding: "0.75rem 1.75rem", borderRadius: "999px",
                      border: "3px solid #e85d04",
                      background: "linear-gradient(180deg, #ff9f43, #ff6b35)",
                      color: "white", fontWeight: 800, fontSize: "1.1rem",
                      cursor: "pointer",
                      boxShadow: "0 6px 0 #c44d00",
                    }}
                  >
                    Next Lesson →
                  </button>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
                    <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#065f46", margin: 0 }}>
                      🏆 All lessons complete! You&apos;re a legend!
                    </p>
                    {invite?.onExitToMap && (
                      <button
                        type="button"
                        onClick={() => invite.onExitToMap?.()}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "0.5rem",
                          padding: "0.75rem 1.75rem", borderRadius: "999px",
                          border: "3px solid #059669",
                          background: "linear-gradient(180deg, #34d399, #10b981)",
                          color: "white", fontWeight: 800, fontSize: "1.05rem",
                          cursor: "pointer",
                          boxShadow: "0 6px 0 #047857",
                        }}
                      >
                        See your score & topics →
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── GLOBAL WALKING CARTOON MASCOT (WHOLE SCREEN WIDE) ── */}
      {!quizDone && (
        <InteractiveMascot
          mode={viewMode}
          onClick={() => {
            if (isTransitioning) return;
            if (viewMode === "lesson") {
              void startQuiz();
              return;
            }
            setIsTransitioning(true);
            setTimeout(() => {
              setViewMode("lesson");
              setIsTransitioning(false);
            }, 450);
          }}
        />
      )}

      {/* ── STICKY FOOTER STRIPE ── */}
      <footer className="mascot-footer-stripe">
        <div className="mascot-footer-stripe-inner">
          <JourneyCard
            correctCount={correctCount}
            totalQuestions={lesson.quizQuestions.length}
          />
        </div>
      </footer>
    </div>
  );
}
