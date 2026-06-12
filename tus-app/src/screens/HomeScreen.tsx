// src/screens/HomeScreen.tsx
import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, TUS_SUBJECTS, QUIZ_MODES } from '../constants';
import { Card, SectionHeader, ProgressBar, StatTile, Badge } from '../components';
import { formatDate, getAccuracyColor } from '../utils';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { userProfile, userStats, refreshStats } = useAppStore();

  useEffect(() => { refreshStats(); }, []);

  const accuracy = userStats?.overallAccuracy ?? 0;
  const dailyDone = userStats?.weeklyActivity?.at(-1)?.count ?? 0;
  const dailyGoal = userProfile?.dailyGoal ?? 20;
  const dailyProgress = Math.min(1, dailyDone / dailyGoal);

  const getTodayGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Günaydın';
    if (h < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={refreshStats} tintColor={COLORS.accent} />
      }
    >
      <StatusBar barStyle="light-content" />

      {/* Header Hero */}
      <LinearGradient colors={['#1A3C5E', '#0D2740']} style={s.hero}>
        <View style={s.heroTop}>
          <View>
            <Text style={s.greeting}>{getTodayGreeting()}, {userProfile?.name ?? 'Hekim'} 👋</Text>
            <Text style={s.heroSub}>TUS hedefine devam et</Text>
          </View>
          <TouchableOpacity
            style={s.profileBtn}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={s.profileBtnText}>
              {(userProfile?.name ?? 'U')[0].toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Günlük ilerleme */}
        <View style={s.dailyCard}>
          <View style={s.dailyTop}>
            <Text style={s.dailyTitle}>Bugünkü Hedef</Text>
            <Text style={s.dailyCount}>{dailyDone}/{dailyGoal} soru</Text>
          </View>
          <ProgressBar
            progress={dailyProgress}
            color={COLORS.accent}
            height={10}
            style={{ marginTop: SPACING.sm }}
          />
          {dailyProgress >= 1 && (
            <Text style={s.dailyDone}>🎯 Hedef tamamlandı!</Text>
          )}
        </View>

        {/* Streak */}
        <View style={s.streakRow}>
          <Text style={s.streakIcon}>🔥</Text>
          <Text style={s.streakText}>{userStats?.streakDays ?? 0} günlük seri</Text>
          <View style={s.streakBadge}>
            <Text style={s.streakBadgeText}>%{accuracy} doğruluk</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Stats Row */}
      <View style={s.statsRow}>
        <StatTile
          label="Toplam Soru"
          value={userStats?.totalQuestionsAnswered ?? 0}
          color={COLORS.primary}
        />
        <View style={{ width: SPACING.sm }} />
        <StatTile
          label="Doğru"
          value={userStats?.totalCorrect ?? 0}
          color={COLORS.success}
        />
        <View style={{ width: SPACING.sm }} />
        <StatTile
          label="Seri"
          value={`${userStats?.streakDays ?? 0}g`}
          color={COLORS.warning}
        />
      </View>

      {/* Quiz Modları */}
      <View style={s.section}>
        <SectionHeader title="Hızlı Başla" />
        <View style={s.modesGrid}>
          {QUIZ_MODES.map(mode => (
            <TouchableOpacity
              key={mode.id}
              style={[s.modeCard, { borderLeftColor: mode.color, borderLeftWidth: 4 }]}
              onPress={() => navigation.navigate('QuizSetup', { mode: mode.id })}
              activeOpacity={0.8}
            >
              <Text style={s.modeLabel}>{mode.label}</Text>
              <Text style={s.modeDesc}>{mode.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Branşlar */}
      <View style={s.section}>
        <SectionHeader
          title="Branşlar"
          action="Tümü"
          onAction={() => navigation.navigate('Quiz')}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {TUS_SUBJECTS.map(subj => {
            const stat = userStats?.subjectStats?.find(s => s.subject === subj.label);
            return (
              <TouchableOpacity
                key={subj.id}
                style={s.subjectCard}
                onPress={() => navigation.navigate('QuizSetup', { subject: subj.label })}
                activeOpacity={0.8}
              >
                <Text style={s.subjectIcon}>{subj.icon}</Text>
                <Text style={s.subjectLabel}>{subj.label}</Text>
                {stat && (
                  <Text style={[s.subjectAcc, { color: getAccuracyColor(stat.accuracy) }]}>
                    %{stat.accuracy}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Son oturumlar */}
      {(userStats?.recentSessions?.length ?? 0) > 0 && (
        <View style={s.section}>
          <SectionHeader title="Son Oturumlar" />
          {userStats!.recentSessions.slice(0, 3).map(session => {
            const correct = session.answers.filter(a => a.isCorrect).length;
            const total = session.answers.length;
            const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
            return (
              <Card key={session.id} style={s.sessionCard}>
                <View style={s.sessionRow}>
                  <View>
                    <Text style={s.sessionSubject}>{session.subject ?? 'Karma'}</Text>
                    <Text style={s.sessionDate}>{formatDate(session.startedAt)}</Text>
                  </View>
                  <View style={s.sessionRight}>
                    <Text style={[s.sessionScore, { color: getAccuracyColor(pct) }]}>%{pct}</Text>
                    <Text style={s.sessionCount}>{correct}/{total}</Text>
                  </View>
                </View>
                <ProgressBar
                  progress={pct / 100}
                  color={getAccuracyColor(pct)}
                  height={6}
                  style={{ marginTop: SPACING.sm }}
                />
              </Card>
            );
          })}
        </View>
      )}

      <View style={{ height: SPACING.xxl }} />
    </ScrollView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: SPACING.xxl },
  hero: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl + 20,
    paddingBottom: SPACING.xl,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  greeting: {
    fontSize: TYPOGRAPHY.fontSizes.xl,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.white,
  },
  heroSub: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileBtnText: {
    fontSize: TYPOGRAPHY.fontSizes.md,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.white,
  },
  dailyCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  dailyTop: { flexDirection: 'row', justifyContent: 'space-between' },
  dailyTitle: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: TYPOGRAPHY.fontWeights.medium,
  },
  dailyCount: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
  },
  dailyDone: {
    fontSize: TYPOGRAPHY.fontSizes.xs,
    color: COLORS.accent,
    marginTop: SPACING.sm,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
  },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  streakIcon: { fontSize: 20 },
  streakText: { color: 'rgba(255,255,255,0.85)', fontSize: TYPOGRAPHY.fontSizes.sm, flex: 1 },
  streakBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.round,
  },
  streakBadgeText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSizes.xs,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  section: { marginTop: SPACING.lg, paddingHorizontal: SPACING.md },
  modesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  modeCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  modeLabel: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.text,
  },
  modeDesc: {
    fontSize: TYPOGRAPHY.fontSizes.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  subjectCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginRight: SPACING.sm,
    alignItems: 'center',
    minWidth: 90,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  subjectIcon: { fontSize: 28, marginBottom: 6 },
  subjectLabel: {
    fontSize: TYPOGRAPHY.fontSizes.xs,
    color: COLORS.text,
    fontWeight: TYPOGRAPHY.fontWeights.medium,
    textAlign: 'center',
  },
  subjectAcc: {
    fontSize: TYPOGRAPHY.fontSizes.xs,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    marginTop: 4,
  },
  sessionCard: { marginBottom: SPACING.sm },
  sessionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  sessionSubject: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.text,
  },
  sessionDate: { fontSize: TYPOGRAPHY.fontSizes.xs, color: COLORS.textSecondary, marginTop: 2 },
  sessionRight: { alignItems: 'flex-end' },
  sessionScore: { fontSize: TYPOGRAPHY.fontSizes.lg, fontWeight: TYPOGRAPHY.fontWeights.bold },
  sessionCount: { fontSize: TYPOGRAPHY.fontSizes.xs, color: COLORS.textSecondary },
});
