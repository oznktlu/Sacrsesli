// src/types/index.ts

export type Difficulty = 'kolay' | 'orta' | 'zor';
export type Subject = string;

export interface Option {
  id: string; // 'A' | 'B' | 'C' | 'D' | 'E'
  text: string;
}

export interface Question {
  id: string;
  subject: string;       // "Anesteziyoloji", "Dahiliye" vb.
  topic: string;         // "Genel Anestezi", "Kardiyoloji" vb.
  year?: number;         // TUS yılı
  difficulty: Difficulty;
  text: string;
  options: Option[];
  correctOptionId: string;
  explanation: string;
  tags: string[];
  imageUrl?: string;
}

export interface SpotNote {
  id: string;
  subject: string;
  topic: string;
  title: string;
  content: string;       // Markdown destekli
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
}

export interface UserAnswer {
  questionId: string;
  selectedOptionId: string | null;
  isCorrect: boolean;
  timeSpent: number;     // saniye
  answeredAt: string;
}

export interface QuizSession {
  id: string;
  mode: QuizMode;
  subject?: string;
  topic?: string;
  questionIds: string[];
  answers: UserAnswer[];
  startedAt: string;
  finishedAt?: string;
  score?: number;
}

export type QuizMode = 'timed' | 'practice' | 'exam' | 'weakpoints';

export interface SubjectStat {
  subject: string;
  totalAnswered: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  avgTimePerQuestion: number;
}

export interface UserStats {
  totalQuestionsAnswered: number;
  totalCorrect: number;
  totalIncorrect: number;
  overallAccuracy: number;
  streakDays: number;
  lastActiveDate: string;
  subjectStats: SubjectStat[];
  weeklyActivity: { date: string; count: number }[];
  recentSessions: QuizSession[];
}

export interface UserProfile {
  id: string;
  name: string;
  targetYear: number;
  targetRank: number;
  dailyGoal: number;     // soru/gün
  subscribedSubjects: string[];
  isPremium: boolean;
  createdAt: string;
}

// Admin panel types
export interface AdminQuestion extends Question {
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  reportCount: number;
}

export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: undefined;
  QuizSetup: { subject?: string; topic?: string; mode?: QuizMode };
  QuizActive: { sessionId: string };
  QuizResult: { sessionId: string };
  QuestionDetail: { questionId: string };
  SpotNoteDetail: { noteId: string };
  SpotNoteEdit: { noteId?: string; subject?: string };
  Profile: undefined;
  Subscription: undefined;
  AdminDashboard: undefined;
  AdminQuestionEdit: { questionId?: string };
};

export type TabParamList = {
  Home: undefined;
  Quiz: undefined;
  Notes: undefined;
  Stats: undefined;
  More: undefined;
};
