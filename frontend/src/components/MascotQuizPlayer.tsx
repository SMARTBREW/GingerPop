"use client";

import React, { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { BrandName } from "@/components/BrandName";

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
  imageUrl?: string;
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
}

interface DiagramStep {
  emoji: string;
  label: string;
}

/* ─── Constants ──────────────────────────────────────────────────────────── */

const ALL_MATH_LESSONS: Lesson[] = [
  {
    id: "comparing-numbers",
    title: "Comparing Numbers (Bada, Chhota, Ya Barabar!)",
    badgeText: "TODAY'S MATH LESSON",
    imageUrl: "/img/image.png", // Alligator reference guide sheet
    mascotSpeech:
      "Psst! Do you know how to compare numbers? Yeh bilkul alligator (magarmach) ke muh ki tarah hai! Bada number dekhkar alligator apna muh us taraf khol leta hai! 🐊",
    diagram: [
      { emoji: "🐊", label: "8 > 4 (Greater)" },
      { emoji: "😐", label: "7 = 7 (Equal)" },
      { emoji: "🐊", label: "2 < 3 (Less)" },
    ],
    facts: [
      "Greater Than (>) matlab bada hai (e.g. 8 > 4) aur Less Than (<) matlab chhota hai (e.g. 2 < 3).",
      "Digits check karo: Jis number mein zyada digits hain, wo hamesha bada hoga! (e.g., 254 > 99).",
      "Decimal check: Pehle whole part compare karo (3.4 vs 3.09 -> 3.4 bada hai!).",
      "Hinglish Fun Rule: Magarmach hamesha bade (larger) number ko khana chahta hai!",
    ],
    ctaText: "Ready to test your math wizard skills? Quiz time! 📐",
    quizQuestions: [
      {
        id: "math-q1",
        question: "Which symbol fits here: 64 ___ 89?",
        subtitle: "Think about which number is bigger!",
        imageUrl: "/img/image copy.png", // Alligator comparison card sheet
        options: [
          { emoji: "🐊", text: "> (Greater Than)" },
          { emoji: "🐊", text: "< (Less Than)" },
          { emoji: "😐", text: "= (Equal To)" },
        ],
        correctIndex: 1,
        explanation: "Shabash! 64 chhota hai 89 se, isliye 64 < 89! 🎉",
        wrongExplanation: "Oops! 64 chhota (smaller) hota hai 89 se, so we use <.",
        hint: "Alligator always wants to eat the bigger number (89)!",
      },
      {
        id: "math-q2",
        question: "Solve this: 123 ___ 98",
        subtitle: "Count the digits first!",
        options: [
          { emoji: "🐊", text: "> (Greater Than)" },
          { emoji: "🐊", text: "< (Less Than)" },
          { emoji: "😐", text: "= (Equal To)" },
        ],
        correctIndex: 0,
        explanation: "Kya baat hai! 123 has 3 digits and 98 has only 2 digits, so 123 > 98! 🌟",
        wrongExplanation: "Check digits! 3 digits (123) is always bigger than 2 digits (98).",
        hint: "Digits check: 123 has 3 digits, 98 has 2.",
      },
      {
        id: "math-q3",
        question: "Compare these decimals: 5.2 ___ 5.09",
        subtitle: "Look closely at the tenths place!",
        options: [
          { emoji: "🐊", text: "> (Greater Than)" },
          { emoji: "🐊", text: "< (Less Than)" },
          { emoji: "😐", text: "= (Equal To)" },
        ],
        correctIndex: 0,
        explanation: "Superb! Pehle whole part check kiya (5 = 5), fir tenths (2 is bigger than 0), so 5.2 > 5.09! 🍬",
        wrongExplanation: "Oops! 5.2 has 2 tenths, 5.09 has 0 tenths. So 5.2 is bigger.",
        hint: "Write 5.2 as 5.20 to compare easily with 5.09!",
      },
      {
        id: "math-q4",
        question: "Compare these: 300 ___ 300",
        subtitle: "Both numbers look identical!",
        options: [
          { emoji: "🐊", text: "> (Greater Than)" },
          { emoji: "🐊", text: "< (Less Than)" },
          { emoji: "😐", text: "= (Equal To)" },
        ],
        correctIndex: 2,
        explanation: "Bilkul sahi! Dono side barabar hain, so we use = symbol! 🌟",
        wrongExplanation: "Oops! Both numbers are exactly the same, so they are equal (=).",
        hint: "Are they the same or is one larger?",
      }
    ],
  },
  {
    id: "organising-data",
    title: "Organising Data (Information ko Arrange Karna!)",
    badgeText: "TODAY'S MATH LESSON",
    mascotSpeech:
      "Hello young detective! Data matlab information collection. Lekin jab tak hum use list ya table mein organise nahi karenge, tab tak hum useful baatein nahi samajh sakte! 📊",
    diagram: [
      { emoji: "🍎", label: "Raw Survey" },
      { emoji: "📝", label: "Tally Marks" },
      { emoji: "📊", label: "Neat Graph" },
    ],
    facts: [
      "Raw Data matlab survey se mila seedha data (jaise Red, Blue, Green, Blue...).",
      "Organised data ko table, list ya graph mein likha jata hai taaki asani se samajh aaye.",
      "Tally marks banana aur pictograph banana data organisation seekhne ki solid activities hain!",
      "Organise karne se compare karna aur accurate conclusions nikalna bohot easy ho jata hai.",
    ],
    ctaText: "Let's crack the data detective quiz! Start! 🔍",
    quizQuestions: [
      {
        id: "data-q1",
        question: "10 friends se survey kiya aur answers mile: Red, Blue, Green, Blue, Yellow, Red, Blue, Green, Red, Blue. Which is the most popular color?",
        subtitle: "Organise and count: Red (3), Blue (4), Green (2), Yellow (1).",
        options: [
          { emoji: "🔴", text: "Red" },
          { emoji: "🔵", text: "Blue" },
          { emoji: "🟢", text: "Green" },
        ],
        correctIndex: 1,
        explanation: "Awesome! Blue color matches 4 times, which is the highest frequency! 🔵",
        wrongExplanation: "Count again! Blue appears 4 times, Red 3 times, Green 2 times. So Blue is the winner.",
        hint: "Count how many times each color is listed in the survey responses.",
      },
      {
        id: "data-q2",
        question: "Apne city ka maximum temp note kiya aur temperatures ko ascending order mein arrange karna hai. What is ascending order?",
        subtitle: "Think about sizes!",
        options: [
          { emoji: "📈", text: "Smallest to Biggest" },
          { emoji: "📉", text: "Biggest to Smallest" },
          { emoji: "📊", text: "Random arrangement" },
        ],
        correctIndex: 0,
        explanation: "Correct! Ascending order means small to big (jaise seedhi chhadna). 📈",
        wrongExplanation: "Incorrect. Ascending is going up (Smallest to Biggest). Descending is going down.",
        hint: "Ascend means to climb up!",
      },
      {
        id: "data-q3",
        question: "Teacher ne raw data share kiya: 3, 5, 2, 4, 6, 3, 0, 5, 4, 2. If you make a tally mark for number 3, how many tallies will it have?",
        subtitle: "Count how many times 3 appears in the list!",
        options: [
          { emoji: "Ⅰ", text: "1" },
          { emoji: "Ⅱ", text: "2" },
          { emoji: "Ⅲ", text: "3" },
        ],
        correctIndex: 1,
        explanation: "Yes! 3 appears exactly 2 times in the list (3, 5, 2, 4, 6, 3...), so it has 2 tallies! Ⅱ",
        wrongExplanation: "Oops! Count carefully: 3 appears 2 times.",
        hint: "Find all the '3's in: 3, 5, 2, 4, 6, 3, 0...",
      },
    ],
  },
  {
    id: "points-lines",
    title: "Points, Lines, & Line Segments",
    badgeText: "TODAY'S GEOMETRY LESSON",
    imageUrl: "/img/image copy 6.png", // Drawing line segment using ruler
    mascotSpeech:
      "Geometry time! Let's meet the building blocks of shapes: Point (bas ek tiny dot), Line (dono taraf infinite chalti hai), and Line Segment (has two fixed ends like a ruler). 📏",
    diagram: [
      { emoji: "📍", label: "Point (Dot)" },
      { emoji: "↔️", label: "Line (Endless)" },
      { emoji: "📏", label: "Segment (Fixed)" },
    ],
    facts: [
      "Point: Ek exact position dikhata hai. It has no length, no width (e.g. pencil dot, location pin).",
      "Line: Dono directions mein bina ruke chalti rehti hai. It has no ends! (e.g. endless straight road).",
      "Line Segment: Line ka ek fixed part jiske do fixed endpoints hote hain (e.g. matchstick, ruler edge).",
      "Ray: Ek endpoint se start hokar doosri side forever chalti jaati hai (e.g. torch light, sun ray).",
    ],
    ctaText: "Show your geometry power! Start Quiz! 📐",
    quizQuestions: [
      {
        id: "geom-q1",
        question: "Which of these has NO length and NO width, only an exact position?",
        subtitle: "It looks like a tiny dot!",
        options: [
          { emoji: "📍", text: "Point" },
          { emoji: "📏", text: "Line Segment" },
          { emoji: "↔️", text: "Line" },
        ],
        correctIndex: 0,
        explanation: "Perfect! A Point is just an exact position, represented by a tiny dot. 📍",
        wrongExplanation: "Oops! A point has no dimensions, only a location. Lines and segments have length.",
        hint: "Think about a Google Maps location pin!",
      },
      {
        id: "geom-q2",
        question: "What goes on forever in BOTH directions without any end?",
        subtitle: "Look at the straight road and railway tracks below!",
        imageUrl: "/img/image copy 2.png", // Straight road
        options: [
          { emoji: "📏", text: "Line Segment" },
          { emoji: "↔️", text: "Line" },
          { emoji: "➡️", text: "Ray" },
        ],
        correctIndex: 1,
        explanation: "Correct! A Line (↔) goes endlessly on both sides, just like an infinite straight road! ↔️",
        wrongExplanation: "Incorrect. A Line Segment has 2 ends, a Ray has 1 end, but a Line goes on forever on both sides.",
        hint: "Its symbol has arrows on both left and right (↔).",
      },
      {
        id: "geom-q3",
        question: "What geometric shape has one fixed endpoint and goes on forever in the other direction (like Ray AB)?",
        subtitle: "Look at the Ray diagram below!",
        imageUrl: "/img/image copy 4.png", // Ray AB and GH diagram
        options: [
          { emoji: "📍", text: "Point" },
          { emoji: "↔️", text: "Line" },
          { emoji: "➡️", text: "Ray" },
        ],
        correctIndex: 2,
        explanation: "Exactly! Ray has one starting endpoint and goes infinitely in the other direction. ➡️",
        wrongExplanation: "Oops! It has only one arrow pointing forever, so it is a Ray.",
        hint: "Think of a torch light shine direction or a sun ray!",
      },
      {
        id: "geom-q4",
        question: "How many matchsticks do you need to move to make 3 squares in this puzzle?",
        subtitle: "Look at the matches diagram below!",
        imageUrl: "/img/image copy 5.png", // Matchsticks puzzle
        options: [
          { emoji: "🪵", text: "Move 1 matchstick" },
          { emoji: "🪵", text: "Move 2 matchsticks" },
          { emoji: "🪵", text: "Move 3 matchsticks" },
        ],
        correctIndex: 1,
        explanation: "Yes! Moving exactly 2 matchsticks lets you rearrange the squares perfectly into 3! 🪵",
        wrongExplanation: "Try again! You need to move exactly 2 matchsticks.",
        hint: "Look at the arrow direction shown in the top and bottom diagrams.",
      }
    ],
  },
];

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
          <span>Click me to open quiz! 🎯</span>
        ) : (
          <span>Click me to open lesson! 📖</span>
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

function LessonPage({
  lesson,
  onStartQuiz,
  transitionClass,
}: {
  lesson: Lesson;
  onStartQuiz: () => void;
  transitionClass: string;
}) {
  return (
    <div
      className={transitionClass}
      style={{
        flex: 1,
        display: "flex",
        padding: "0.5rem 0",
        minHeight: 0,
        maxHeight: "480px",
      }}
    >
      {/* Single unified card */}
      <div style={{
        flex: 1,
        display: "flex",
        borderRadius: "1.5rem",
        overflow: "hidden",
        border: "2px solid #e9e9f0",
        boxShadow: "0 6px 0 #e0e0ea",
        background: "white",
        minHeight: 0,
      }}>
        {/* LEFT: Image panel */}
        {lesson.imageUrl && (
          <div style={{
            width: "38%",
            flexShrink: 0,
            background: "linear-gradient(145deg, #f0fdf4, #dcfce7)",
            borderRight: "2px solid #e9e9f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}>
            <img
              src={lesson.imageUrl}
              alt={lesson.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                maxHeight: "340px",
                borderRadius: "0.75rem",
                filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.08))",
              }}
            />
          </div>
        )}

        {/* RIGHT: Content panel */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          padding: "1.5rem 1.75rem",
          minWidth: 0,
          overflowY: "auto",
        }}>
          {/* Badge + Title */}
          <div>
            {lesson.badgeText && (
              <span className="mascot-badge" style={{ fontSize: "0.65rem", padding: "0.2rem 0.65rem", marginBottom: "0.5rem", display: "inline-flex" }}>
                🌿 {lesson.badgeText}
              </span>
            )}
            <h1 style={{
              fontSize: "1.35rem", fontWeight: 900, color: "#111827",
              lineHeight: 1.25, margin: "0.3rem 0 0", letterSpacing: "-0.025em",
            }}>
              {lesson.title}
            </h1>
          </div>

          {/* Mascot + speech */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.65rem" }}>
            <MascotSvg size={44} animate />
            <div style={{
              flex: 1,
              background: "#f8fafc",
              border: "1.5px solid #e2e8f0",
              borderRadius: "0.875rem",
              borderBottomLeftRadius: "0.25rem",
              padding: "0.6rem 0.875rem",
              fontSize: "0.82rem",
              lineHeight: 1.55,
              color: "#475569",
            }}>
              {lesson.mascotSpeech}
            </div>
          </div>

          {/* Key facts */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flex: 1 }}>
            <p style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9ca3af", margin: 0 }}>Key Points</p>
            {lesson.facts.slice(0, 4).map((fact, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: "0.6rem",
                fontSize: "0.82rem", color: "#374151", lineHeight: 1.5,
                padding: "0.4rem 0.6rem",
                background: i % 2 === 0 ? "#f9fafb" : "transparent",
                borderRadius: "0.5rem",
              }}>
                <span style={{
                  width: 20, height: 20, borderRadius: "50%",
                  background: ["#22c55e","#3b82f6","#f59e0b","#ec4899"][i],
                  color: "white",
                  fontSize: "0.65rem", fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, marginTop: "0.1rem",
                }}>{i + 1}</span>
                <span>{fact}</span>
              </div>
            ))}
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
  onBackToLesson,
  transitionClass,
}: {
  lesson: Lesson;
  onBackToLesson: () => void;
  transitionClass: string;
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

  // Use question image if available, else fall back to the lesson image
  const displayImage = question.imageUrl || lesson.imageUrl;

  return (
    <div
      className={`${transitionClass} ${answered && !isCorrect ? "quiz-card-shake" : ""}`}
      style={{
        flex: 1,
        display: "flex",
        padding: "0.5rem 0",
        minHeight: 0,
        maxHeight: "480px",
      }}
    >
      {/* Single unified card */}
      <div style={{
        flex: 1,
        display: "flex",
        borderRadius: "1.5rem",
        overflow: "hidden",
        border: "2px solid #e9e9f0",
        boxShadow: "0 6px 0 #e0e0ea",
        background: "white",
        minHeight: 0,
      }}>
        {/* LEFT: Image panel */}
        {displayImage && (
          <div style={{
            width: "38%",
            flexShrink: 0,
            background: "linear-gradient(145deg, #eff6ff, #dbeafe)",
            borderRight: "2px solid #e9e9f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}>
            <img
              src={displayImage}
              alt="Question illustration"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                maxHeight: "350px",
                borderRadius: "0.75rem",
                filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.08))",
              }}
            />
          </div>
        )}

        {/* RIGHT: Question + Options */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
          padding: "1.25rem 1.5rem",
          minWidth: 0,
          overflowY: "auto",
        }}>
          {/* Always show counter badge and progress dots inline at the top of right column */}
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

          {/* Question */}
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

          {/* Options */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flex: 1 }}>
            {question.options.map((opt, idx) => {
              let bg = "white", border = "#e5e7eb", shadow = "#e5e7eb", color = "#374151";
              if (answered) {
                if (idx === question.correctIndex) {
                  bg = "linear-gradient(135deg, #f0fdf4, #dcfce7)";
                  border = "#22c55e"; shadow = "#16a34a"; color = "#14532d";
                } else if (idx === selected) {
                  bg = "linear-gradient(135deg, #fef2f2, #fee2e2)";
                  border = "#f87171"; shadow = "#ef4444"; color = "#7f1d1d";
                }
              }
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={answered}
                  onClick={() => handleSelect(idx)}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.7rem",
                    padding: "0.6rem 0.85rem",
                    borderRadius: "0.875rem",
                    border: `2.5px solid ${border}`,
                    background: bg,
                    cursor: answered ? "default" : "pointer",
                    textAlign: "left", width: "100%",
                    fontSize: "0.85rem", fontWeight: 700, color,
                    boxShadow: answered && (idx === question.correctIndex || idx === selected)
                      ? `0 4px 0 ${shadow}` : "0 3px 0 #e5e7eb",
                    transition: "all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                  }}
                  onMouseEnter={e => {
                    if (!answered) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "#a78bfa";
                      (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!answered) {
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
                  {answered && idx === question.correctIndex && (
                    <span style={{
                      width: 24, height: 24, borderRadius: "50%",
                      background: "#22c55e", color: "white",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.75rem", fontWeight: 800, flexShrink: 0,
                    }}>✓</span>
                  )}
                  {answered && idx === selected && idx !== question.correctIndex && (
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

          {/* Feedback banner */}
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

          {/* Hint section */}
          <div style={{
            display: "flex", alignItems: "center", gap: "0.65rem",
            padding: "0.6rem 0.85rem",
            borderRadius: "0.875rem",
            background: "#fffbeb", border: "1.5px solid #fde68a",
            flexShrink: 0,
          }}>
            <MascotSvg size={36} expression="hint" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "0.8rem", fontWeight: 800, color: "#92400e", margin: "0 0 0.1rem" }}>💡 Need a hint?</p>
              <p style={{ fontSize: "0.75rem", color: "#b45309", margin: 0, lineHeight: 1.4 }}>
                {showHint && hintText ? hintText : "Stuck? I'll whisper a clue. Won't tell your parents."}
              </p>
            </div>
            {!showHint && (
              <button
                type="button"
                onClick={handleShowHint}
                style={{
                  padding: "0.4rem 0.85rem", borderRadius: "0.625rem",
                  border: "2px solid #d97706",
                  background: "linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)",
                  color: "white", fontSize: "0.8rem", fontWeight: 800,
                  cursor: "pointer", whiteSpace: "nowrap",
                  boxShadow: "0 3px 0 #d97706", flexShrink: 0,
                }}
              >
                Show clue
              </button>
            )}
          </div>
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
    <div style={{
      display: "flex",
      gap: "2.5rem",
      width: "100%",
      alignItems: "center",
      justifyContent: "space-between",
    }}>
      {/* LEFT: Text Info */}
      <div style={{ flex: "0 1 450px", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem" }}>
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
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.6rem", minWidth: 0 }}>
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

export function MascotQuizPlayer() {
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const lesson = ALL_MATH_LESSONS[activeLessonIndex];
  const [viewMode, setViewMode] = useState<ViewMode>("lesson");
  const [hasStartedQuiz, setHasStartedQuiz] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [lives, setLives] = useState(7);
  const [score, setScore] = useState(240);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());

  const totalLessons = ALL_MATH_LESSONS.length;
  const progressPct = (questionIndex / lesson.quizQuestions.length) * 100;

  // A lesson tab is unlocked if it's the first OR the previous lesson is completed
  const isLessonUnlocked = (idx: number) =>
    idx === 0 || completedLessons.has(idx - 1);

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
      // Mark this lesson as completed
      setCompletedLessons((prev) => new Set([...prev, activeLessonIndex]));
    } else {
      setQuestionIndex(next);
    }
  }, [questionIndex, lesson.quizQuestions.length, activeLessonIndex]);

  const [isTransitioning, setIsTransitioning] = useState(false);

  const startQuiz = () => {
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
  };

  return (
    <div className="mascot-shell" style={{ height: "100dvh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* ── TOP HEADER ── */}
      <header className="mascot-header">
        <div className="mascot-header-inner" style={{ justifyContent: "space-between" }}>
          {/* Home link with Mascot Icon on the left and Brand Name on the right */}
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "flex-start",
              gap: "0.5rem",
              padding: "0.35rem 0.85rem",
              borderRadius: "999px",
              border: "1.5px solid #e5e7eb",
              background: "white",
              textDecoration: "none",
              whiteSpace: "nowrap",
              flexShrink: 0,
              transition: "background 0.15s, transform 0.15s",
              boxShadow: "0 2px 4px rgba(0,0,0,0.04)"
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#f9fafb"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "white"; (e.currentTarget as HTMLAnchorElement).style.transform = "none"; }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MascotSvg size={24} animate={false} />
            </div>
            <span style={{
              fontFamily: "var(--font-game), 'Fredoka', system-ui, sans-serif",
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "#1f2937",
              letterSpacing: "-0.01em",
              display: "inline-block"
            }}>
              <BrandName />
            </span>
          </Link>

          {/* Left: lesson info */}
          <div className="mascot-header-lesson" style={{ marginLeft: "0.25rem", marginRight: "auto" }}>
            <div className="mascot-header-lesson-badge">
              LESSON {activeLessonIndex + 1} OF {totalLessons}
            </div>
            <div className="mascot-header-lesson-title" style={{ fontSize: "0.9rem", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {lesson.title.split(" (")[0]}
            </div>
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

      {/* ── CONTENT — fills remaining height, scrolls internally ── */}
      <main style={{
        flex: 1,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        maxWidth: "1100px",
        width: "100%",
        margin: "0 auto",
        padding: "0.75rem 1.5rem 0",
        gap: "0.5rem",
      }}>

        {/* Lesson selector tabs — fully unlocked, with directional progression arrows */}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", justifyContent: "center", flexShrink: 0, flexWrap: "wrap" }}>
          {ALL_MATH_LESSONS.map((item, idx) => {
            const done = completedLessons.has(idx);
            const active = activeLessonIndex === idx;
            return (
              <React.Fragment key={item.id}>
                <button
                  onClick={() => switchLesson(idx)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.35rem",
                    padding: "0.4rem 1rem",
                    borderRadius: "999px",
                    border: `2px solid ${active ? "#a78bfa" : done ? "#6ee7b7" : "#e5e7eb"}`,
                    background: active ? "#faf5ff" : done ? "#ecfdf5" : "#ffffff",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: active ? "#7c3aed" : done ? "#065f46" : "#374151",
                    cursor: "pointer",
                    boxShadow: active ? "0 3px 0 #a78bfa" : done ? "0 3px 0 #6ee7b7" : "0 3px 0 #e5e7eb",
                    transition: "all 0.15s",
                  }}
                >
                  {done ? "✅" : `${idx + 1}.`}{" "}
                  {item.id === "comparing-numbers" ? "Comparing" : item.id === "organising-data" ? "Data" : "Geometry"}
                </button>
                {idx < ALL_MATH_LESSONS.length - 1 && (
                  <span style={{
                    fontSize: "1.1rem",
                    fontWeight: 900,
                    color: "#cbd5e1",
                    margin: "0 0.2rem",
                    userSelect: "none",
                  }}>
                    ➔
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Main content — fills remaining space using grid stacking for overlay animations */}
        <div style={{
          flex: 1,
          overflow: "hidden",
          paddingBottom: "0.5rem",
          display: "grid",
          gridTemplateColumns: "1fr",
          gridTemplateRows: "1fr",
        }}>
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
                  <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#065f46" }}>🏆 All lessons complete! You&apos;re a legend!</p>
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
            if (isTransitioning) return; // avoid double click issues
            setIsTransitioning(true);
            setTimeout(() => {
              if (viewMode === "lesson") {
                setHasStartedQuiz(true);
                setViewMode("quiz");
              } else {
                setViewMode("lesson");
              }
              setIsTransitioning(false);
            }, 450);
          }}
        />
      )}

      {/* ── STICKY FOOTER STRIPE ── */}
      <footer style={{
        position: "sticky",
        bottom: 0,
        zIndex: 50,
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(12px)",
        borderTop: "2px solid rgba(0,0,0,0.08)",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.06)",
        flexShrink: 0,
      }}>
        <div style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "1.5rem 1.5rem",
          display: "flex",
          alignItems: "center",
        }}>
          <JourneyCard
            correctCount={correctCount}
            totalQuestions={lesson.quizQuestions.length}
          />
        </div>
      </footer>
    </div>
  );
}
