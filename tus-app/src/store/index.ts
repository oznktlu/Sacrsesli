// src/store/index.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Question, SpotNote, QuizSession, UserStats, UserProfile,
  UserAnswer, QuizMode
} from '../types';
import { STORAGE_KEYS, TUS_SUBJECTS } from '../constants';
import { generateId, getTodayStr } from '../utils';
import { SAMPLE_QUESTIONS } from '../utils/sampleData';

interface AppState {
  // Data
  questions: Question[];
  spotNotes: SpotNote[];
  sessions: QuizSession[];
  bookmarkedIds: string[];
  answeredMap: Record<string, UserAnswer>;
  userProfile: UserProfile | null;
  userStats: UserStats | null;
  activeSession: QuizSession | null;

  // UI
  isLoading: boolean;
  isOnboarded: boolean;

  // Actions
  init: () => Promise<void>;
  setOnboarded: (profile: Omit<UserProfile, 'id' | 'createdAt'>) => Promise<void>;
  
  // Quiz
  startSession: (config: { mode: QuizMode; subject?: string; topic?: string; count: number }) => QuizSession;
  submitAnswer: (questionId: string, selectedOptionId: string | null, timeSpent: number) => void;
  finishSession: () => void;
  
  // Notes
  saveSpotNote: (note: Omit<SpotNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteSpotNote: (id: string) => void;
  togglePinNote: (id: string) => void;
  
  // Bookmarks
  toggleBookmark: (questionId: string) => void;

  // Stats
  refreshStats: () => void;
  
  // Admin
  addQuestion: (q: Omit<Question, 'id'>) => void;
  updateQuestion: (id: string, q: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  questions: SAMPLE_QUESTIONS,
  spotNotes: [],
  sessions: [],
  bookmarkedIds: [],
  answeredMap: {},
  userProfile: null,
  userStats: null,
  activeSession: null,
  isLoading: false,
  isOnboarded: false,

  init: async () => {
    set({ isLoading: true });
    try {
      const [onboardingRaw, profileRaw, notesRaw, sessionsRaw, bookmarksRaw, answeredRaw] =
        await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_DONE),
          AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE),
          AsyncStorage.getItem(STORAGE_KEYS.SPOT_NOTES),
          AsyncStorage.getItem(STORAGE_KEYS.QUIZ_SESSIONS),
          AsyncStorage.getItem(STORAGE_KEYS.BOOKMARKED_QUESTIONS),
          AsyncStorage.getItem(STORAGE_KEYS.ANSWERED_QUESTIONS),
        ]);

      const isOnboarded = onboardingRaw === 'true';
      const userProfile = profileRaw ? JSON.parse(profileRaw) : null;
      const spotNotes = notesRaw ? JSON.parse(notesRaw) : [];
      const sessions = sessionsRaw ? JSON.parse(sessionsRaw) : [];
      const bookmarkedIds = bookmarksRaw ? JSON.parse(bookmarksRaw) : [];
      const answeredMap = answeredRaw ? JSON.parse(answeredRaw) : {};

      set({ isOnboarded, userProfile, spotNotes, sessions, bookmarkedIds, answeredMap });
      get().refreshStats();
    } finally {
      set({ isLoading: false });
    }
  },

  setOnboarded: async (profileData) => {
    const profile: UserProfile = {
      ...profileData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, 'true');
    set({ userProfile: profile, isOnboarded: true });
  },

  startSession: (config) => {
    const { questions } = get();
    let pool = [...questions];
    
    if (config.subject) pool = pool.filter(q => q.subject === config.subject);
    if (config.topic) pool = pool.filter(q => q.topic === config.topic);
    
    if (config.mode === 'weakpoints') {
      const { answeredMap } = get();
      pool = pool.filter(q => {
        const ans = answeredMap[q.id];
        return !ans || !ans.isCorrect;
      });
    }

    // Shuffle
    pool = pool.sort(() => Math.random() - 0.5).slice(0, config.count);

    const session: QuizSession = {
      id: generateId(),
      mode: config.mode,
      subject: config.subject,
      topic: config.topic,
      questionIds: pool.map(q => q.id),
      answers: [],
      startedAt: new Date().toISOString(),
    };

    set({ activeSession: session });
    return session;
  },

  submitAnswer: (questionId, selectedOptionId, timeSpent) => {
    const { activeSession, questions, answeredMap } = get();
    if (!activeSession) return;

    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const isCorrect = selectedOptionId === question.correctOptionId;
    const answer: UserAnswer = {
      questionId,
      selectedOptionId,
      isCorrect,
      timeSpent,
      answeredAt: new Date().toISOString(),
    };

    const updatedSession = {
      ...activeSession,
      answers: [...activeSession.answers, answer],
    };

    const updatedAnsweredMap = { ...answeredMap, [questionId]: answer };

    set({ activeSession: updatedSession, answeredMap: updatedAnsweredMap });
    AsyncStorage.setItem(STORAGE_KEYS.ANSWERED_QUESTIONS, JSON.stringify(updatedAnsweredMap));
  },

  finishSession: () => {
    const { activeSession, sessions } = get();
    if (!activeSession) return;

    const correctCount = activeSession.answers.filter(a => a.isCorrect).length;
    const finished: QuizSession = {
      ...activeSession,
      finishedAt: new Date().toISOString(),
      score: Math.round((correctCount / activeSession.answers.length) * 100),
    };

    const updatedSessions = [finished, ...sessions].slice(0, 100);
    set({ activeSession: null, sessions: updatedSessions });
    AsyncStorage.setItem(STORAGE_KEYS.QUIZ_SESSIONS, JSON.stringify(updatedSessions));
    get().refreshStats();
  },

  saveSpotNote: (noteData) => {
    const { spotNotes } = get();
    const now = new Date().toISOString();
    
    const existingIdx = spotNotes.findIndex(n => n.id === (noteData as any).id);
    let updated: SpotNote[];

    if (existingIdx >= 0) {
      updated = spotNotes.map((n, i) =>
        i === existingIdx ? { ...n, ...noteData, updatedAt: now } : n
      );
    } else {
      const newNote: SpotNote = {
        ...noteData,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      updated = [newNote, ...spotNotes];
    }

    set({ spotNotes: updated });
    AsyncStorage.setItem(STORAGE_KEYS.SPOT_NOTES, JSON.stringify(updated));
  },

  deleteSpotNote: (id) => {
    const updated = get().spotNotes.filter(n => n.id !== id);
    set({ spotNotes: updated });
    AsyncStorage.setItem(STORAGE_KEYS.SPOT_NOTES, JSON.stringify(updated));
  },

  togglePinNote: (id) => {
    const updated = get().spotNotes.map(n =>
      n.id === id ? { ...n, isPinned: !n.isPinned } : n
    );
    set({ spotNotes: updated });
    AsyncStorage.setItem(STORAGE_KEYS.SPOT_NOTES, JSON.stringify(updated));
  },

  toggleBookmark: (questionId) => {
    const { bookmarkedIds } = get();
    const updated = bookmarkedIds.includes(questionId)
      ? bookmarkedIds.filter(id => id !== questionId)
      : [...bookmarkedIds, questionId];
    set({ bookmarkedIds: updated });
    AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKED_QUESTIONS, JSON.stringify(updated));
  },

  refreshStats: () => {
    const { sessions, answeredMap, questions } = get();
    const allAnswers = Object.values(answeredMap);
    const correct = allAnswers.filter(a => a.isCorrect).length;
    
    // Subject stats
    const subjectMap: Record<string, { total: number; correct: number; time: number }> = {};
    allAnswers.forEach(ans => {
      const q = questions.find(q => q.id === ans.questionId);
      if (!q) return;
      if (!subjectMap[q.subject]) subjectMap[q.subject] = { total: 0, correct: 0, time: 0 };
      subjectMap[q.subject].total++;
      if (ans.isCorrect) subjectMap[q.subject].correct++;
      subjectMap[q.subject].time += ans.timeSpent;
    });

    const subjectStats = Object.entries(subjectMap).map(([subject, data]) => ({
      subject,
      totalAnswered: data.total,
      correct: data.correct,
      incorrect: data.total - data.correct,
      accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      avgTimePerQuestion: data.total > 0 ? Math.round(data.time / data.total) : 0,
    }));

    // Weekly activity (last 7 days)
    const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const count = allAnswers.filter(a => a.answeredAt.startsWith(dateStr)).length;
      return { date: dateStr, count };
    });

    // Streak
    let streakDays = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const hasActivity = allAnswers.some(a => a.answeredAt.startsWith(dateStr));
      if (hasActivity) streakDays++;
      else if (i > 0) break;
    }

    const stats: UserStats = {
      totalQuestionsAnswered: allAnswers.length,
      totalCorrect: correct,
      totalIncorrect: allAnswers.length - correct,
      overallAccuracy: allAnswers.length > 0 ? Math.round((correct / allAnswers.length) * 100) : 0,
      streakDays,
      lastActiveDate: getTodayStr(),
      subjectStats,
      weeklyActivity,
      recentSessions: sessions.slice(0, 5),
    };

    set({ userStats: stats });
  },

  addQuestion: (q) => {
    const newQ: Question = { ...q, id: generateId() };
    set(state => ({ questions: [newQ, ...state.questions] }));
  },

  updateQuestion: (id, partial) => {
    set(state => ({
      questions: state.questions.map(q => q.id === id ? { ...q, ...partial } : q),
    }));
  },

  deleteQuestion: (id) => {
    set(state => ({ questions: state.questions.filter(q => q.id !== id) }));
  },
}));
