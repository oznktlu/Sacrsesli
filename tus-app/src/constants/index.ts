// src/constants/index.ts

export const COLORS = {
  primary: '#1A3C5E',       // Koyu lacivert — tıbbi güven
  primaryLight: '#2D6DA8',
  accent: '#00BFA5',         // Teal — modern, canlı
  accentLight: '#E0F5F2',
  danger: '#E53935',
  dangerLight: '#FFEBEE',
  success: '#43A047',
  successLight: '#E8F5E9',
  warning: '#FFB300',
  warningLight: '#FFF8E1',
  background: '#F7F9FC',
  card: '#FFFFFF',
  cardBorder: '#E8EDF3',
  text: '#1A2433',
  textSecondary: '#5A6A7E',
  textMuted: '#9AA5B4',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.5)',
  gradient: {
    primary: ['#1A3C5E', '#2D6DA8'],
    accent: ['#00BFA5', '#00897B'],
    quiz: ['#1A3C5E', '#0D2740'],
  },
};

export const TYPOGRAPHY = {
  fontSizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 30,
    display: 38,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  lineHeights: {
    tight: 1.2,
    base: 1.5,
    relaxed: 1.7,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

export const TUS_SUBJECTS = [
  { id: 'anestezi', label: 'Anesteziyoloji', icon: '💉', color: '#1A3C5E' },
  { id: 'dahiliye', label: 'İç Hastalıkları', icon: '🫀', color: '#C62828' },
  { id: 'cerrahi', label: 'Genel Cerrahi', icon: '🔪', color: '#2E7D32' },
  { id: 'pediatri', label: 'Pediatri', icon: '👶', color: '#6A1B9A' },
  { id: 'kadin-dogum', label: 'Kadın-Doğum', icon: '🌸', color: '#AD1457' },
  { id: 'psikiyatri', label: 'Psikiyatri', icon: '🧠', color: '#283593' },
  { id: 'noroloji', label: 'Nöroloji', icon: '⚡', color: '#E65100' },
  { id: 'kardiyoloji', label: 'Kardiyoloji', icon: '❤️', color: '#B71C1C' },
  { id: 'radyoloji', label: 'Radyoloji', icon: '🩻', color: '#37474F' },
  { id: 'patoloji', label: 'Patoloji', icon: '🔬', color: '#4E342E' },
  { id: 'mikrobiyoloji', label: 'Mikrobiyoloji', icon: '🦠', color: '#1B5E20' },
  { id: 'farmakoloji', label: 'Farmakoloji', icon: '💊', color: '#880E4F' },
  { id: 'biyokimya', label: 'Biyokimya', icon: '🧪', color: '#0D47A1' },
  { id: 'fizyoloji', label: 'Fizyoloji', icon: '🫁', color: '#004D40' },
  { id: 'anatomi', label: 'Anatomi', icon: '🦴', color: '#3E2723' },
];

export const QUIZ_MODES = [
  {
    id: 'practice',
    label: 'Alıştırma',
    description: 'Süresiz, açıklamalı',
    icon: 'book-open',
    color: COLORS.primary,
  },
  {
    id: 'timed',
    label: 'Zamanlı',
    description: 'Soru başı 90 sn',
    icon: 'clock',
    color: COLORS.warning,
  },
  {
    id: 'exam',
    label: 'Sınav Modu',
    description: 'Gerçek TUS koşulları',
    icon: 'award',
    color: COLORS.danger,
  },
  {
    id: 'weakpoints',
    label: 'Zayıf Konular',
    description: 'Hata yaptıkların',
    icon: 'target',
    color: '#7B1FA2',
  },
];

export const QUESTION_COUNTS = [10, 20, 40, 100];

export const CLAUDE_MODEL = 'claude-sonnet-4-6';
export const ANTHROPIC_API_BASE = 'https://api.anthropic.com/v1/messages';

export const STORAGE_KEYS = {
  USER_PROFILE: '@tus_user_profile',
  USER_STATS: '@tus_user_stats',
  QUIZ_SESSIONS: '@tus_quiz_sessions',
  SPOT_NOTES: '@tus_spot_notes',
  BOOKMARKED_QUESTIONS: '@tus_bookmarks',
  ANSWERED_QUESTIONS: '@tus_answered',
  ONBOARDING_DONE: '@tus_onboarding',
  LAST_ACTIVE: '@tus_last_active',
};
