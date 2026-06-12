// src/utils/index.ts
export const generateId = () =>
  Math.random().toString(36).substring(2) + Date.now().toString(36);

export const getTodayStr = () => new Date().toISOString().split('T')[0];

export const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}dk ${s}sn` : `${s}sn`;
};

export const getAccuracyColor = (accuracy: number) => {
  if (accuracy >= 75) return '#43A047';
  if (accuracy >= 50) return '#FFB300';
  return '#E53935';
};

export const shuffleArray = <T>(arr: T[]): T[] =>
  [...arr].sort(() => Math.random() - 0.5);
