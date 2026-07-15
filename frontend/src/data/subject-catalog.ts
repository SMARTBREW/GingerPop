export interface CatalogSubtopic {
  id: string;
  title: string;
  description?: string;
  emoji?: string;
  /** Links to a MascotQuizPlayer lesson id; omit if coming soon */
  lessonId?: string;
}

export interface CatalogTopic {
  id: string;
  title: string;
  description?: string;
  emoji?: string;
  subtopics: CatalogSubtopic[];
}

export interface CatalogSubject {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  accent: string;
  topics: CatalogTopic[];
}

export const SUBJECT_CATALOG: CatalogSubject[] = [
  {
    id: "maths",
    title: "Maths",
    description: "Numbers, data, shapes & more",
    emoji: "🔢",
    color: "#fff7ed",
    accent: "#ea580c",
    topics: [
      {
        id: "numbers",
        title: "Numbers",
        emoji: "🐊",
        description: "Compare, count and play with numbers",
        subtopics: [
          {
            id: "comparing-numbers",
            title: "Comparing Numbers",
            emoji: "⚖️",
            description: "Greater than, less than & equal to",
            lessonId: "comparing-numbers",
          },
        ],
      },
      {
        id: "data",
        title: "Data Handling",
        emoji: "📊",
        description: "Organise information into tables",
        subtopics: [
          {
            id: "organising-data",
            title: "Organising Data",
            emoji: "📋",
            description: "Surveys, tables and frequencies",
            lessonId: "organising-data",
          },
        ],
      },
      {
        id: "geometry",
        title: "Geometry",
        emoji: "📐",
        description: "Points, lines, segments and rays",
        subtopics: [
          {
            id: "point-line-ray",
            title: "Point, Line, Segment & Ray",
            emoji: "➡️",
            description: "Building blocks of geometry",
            lessonId: "geometry",
          },
        ],
      },
    ],
  },
  {
    id: "science",
    title: "Science",
    description: "Plants, animals & the world around us",
    emoji: "🔬",
    color: "#f0fdf4",
    accent: "#16a34a",
    topics: [
      {
        id: "plants",
        title: "Plants",
        emoji: "🌱",
        description: "How plants grow and live",
        subtopics: [
          {
            id: "parts-of-plant",
            title: "Parts of a Plant",
            emoji: "🍃",
            description: "Coming soon",
          },
          {
            id: "photosynthesis",
            title: "Photosynthesis",
            emoji: "☀️",
            description: "Coming soon",
          },
        ],
      },
      {
        id: "animals",
        title: "Animals",
        emoji: "🐾",
        description: "Habitats and animal life",
        subtopics: [
          {
            id: "habitats",
            title: "Animal Habitats",
            emoji: "🏡",
            description: "Coming soon",
          },
        ],
      },
    ],
  },
  {
    id: "english",
    title: "English",
    description: "Words, stories and grammar fun",
    emoji: "📚",
    color: "#eff6ff",
    accent: "#2563eb",
    topics: [
      {
        id: "grammar",
        title: "Grammar",
        emoji: "✏️",
        description: "Nouns, verbs and sentences",
        subtopics: [
          {
            id: "nouns",
            title: "Nouns",
            emoji: "🏷️",
            description: "Coming soon",
          },
          {
            id: "verbs",
            title: "Verbs",
            emoji: "🏃",
            description: "Coming soon",
          },
        ],
      },
      {
        id: "reading",
        title: "Reading",
        emoji: "📖",
        description: "Stories and comprehension",
        subtopics: [
          {
            id: "short-stories",
            title: "Short Stories",
            emoji: "✨",
            description: "Coming soon",
          },
        ],
      },
    ],
  },
];

export function findSubject(id: string) {
  return SUBJECT_CATALOG.find((s) => s.id === id);
}

export function findTopic(subjectId: string, topicId: string) {
  return findSubject(subjectId)?.topics.find((t) => t.id === topicId);
}
