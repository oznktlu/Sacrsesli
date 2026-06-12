// src/screens/StatsScreen.tsx
import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Dimensions
} from 'react-native';
import { useAppStore } from '../store';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants';
import { Card, SectionHeader, ProgressBar } from '../components';
import { getAccuracyColor } from '../utils';

const { width } = Dimensions.get('window');
const BAR_MAX_HEIGHT = 80;

export const StatsScreen: React.FC = () => {
  const { userStats, refreshStats } = useAppStore();

  useEffect(() => { refreshStats(); }, []);

  const stats = userStats;
  if (!stats) {
    return (
      <View style={s.empty}>
        <Text style={s.emptyText}>📊 Henüz istatistik yok</Text>
        <Text style={s.emptySubText}>Quiz çözdükçe istatistiklerin burada görünecek.</Text>
      </View>
    );
  }

  const maxDaily = Math.max(...stats.weeklyActivity.map(d => d.count), 1);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>İstatistikler</Text>
      </View>

      {/* Overview cards */}
      <View style={s.overviewGrid}>
        <Card style={s.overviewCard} elevated>
          <Text style={[s.overviewNum, { color: COLORS.primary }]}>
            {stats.totalQuestionsAnswered}
          </Text>
          <Text style={s.overviewLabel}>Toplam Soru</Text>
        </Card>
        <Card style={s.overviewCard} elevated>
          <Text style={[s.overviewNum, { color: getAccuracyColor(stats.overallAccuracy) }]}>
            %{stats.overallAccuracy}
          </Text>
          <Text style={s.overviewLabel}>Genel Doğruluk</Text>
        </Card>
        <Card style={s.overviewCard} elevated>
          <Text style={[s.overviewNum, { color: COLORS.warning }]}>🔥{stats.streakDays}</Text>
          <Text style={s.overviewLabel}>Günlük Seri</Text>
        </Card>
        <Card style={s.overviewCard} elevated>
          <Text style={[s.overviewNum, { color: COLORS.danger }]}>{stats.totalIncorrect}</Text>
          <Text style={s.overviewLabel}>Yanlış</Text>
        </Card>
      </View>

      {/* Weekly activity bar chart */}
      <View style={s.section}>
        <SectionHeader title="Haftalık Aktivite" />
        <Card elevated>
          <View style={s.barChart}>
            {stats.weeklyActivity.map((day, i) => {
              const barHeight = maxDaily > 0 ? (day.count / maxDaily) * BAR_MAX_HEIGHT : 0;
              const dayName = new Date(day.date).toLocaleDateString('tr-TR', { weekday: 'short' });
              const isToday = i === stats.weeklyActivity.length - 1;
              return (
                <View key={day.date} style={s.barItem}>
                  <Text style={s.barValue}>{day.count > 0 ? day.count : ''}</Text>
                  <View style={s.barTrack}>
                    <View
                      style={[
                        s.barFill,
                        {
                          height: Math.max(barHeight, day.count > 0 ? 4 : 0),
                          backgroundColor: isToday ? COLORS.accent : COLORS.primary,
                          opacity: isToday ? 1 : 0.6,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[s.barLabel, isToday && s.barLabelToday]}>{dayName}</Text>
                </View>
              );
            })}
          </View>
        </Card>
      </View>

      {/* Subject performance */}
      {stats.subjectStats.length > 0 && (
        <View style={s.section}>
          <SectionHeader title="Branş Performansı" />
          {stats.subjectStats
            .sort((a, b) => b.totalAnswered - a.totalAnswered)
            .map(sub => (
              <Card key={sub.subject} style={s.subjectCard}>
                <View style={s.subjectTop}>
                  <Text style={s.subjectName}>{sub.subject}</Text>
                  <View style={s.subjectRight}>
                    <Text style={[s.subjectAcc, { color: getAccuracyColor(sub.accuracy) }]}>
                      %{sub.accuracy}
                    </Text>
                    <Text style={s.subjectTotal}>{sub.totalAnswered} soru</Text>
                  </View>
                </View>
                <ProgressBar
                  progress={sub.accuracy / 100}
                  color={getAccuracyColor(sub.accuracy)}
                  height={8}
                  style={{ marginTop: SPACING.sm }}
                />
                <View style={s.subjectDetail}>
                  <Text style={s.subjectDetailText}>✅ {sub.correct} doğru</Text>
                  <Text style={s.subjectDetailText}>❌ {sub.incorrect} yanlış</Text>
                  <Text style={s.subjectDetailText}>⏱ ort {sub.avgTimePerQuestion}sn</Text>
                </View>
              </Card>
            ))
          }
        </View>
      )}

      {/* Accuracy donut (simplified) */}
      <View style={s.section}>
        <SectionHeader title="Genel Dağılım" />
        <Card elevated>
          <View style={s.donutRow}>
            <View style={s.donutVisual}>
              <View style={[s.donutOuter, { borderColor: getAccuracyColor(stats.overallAccuracy) }]}>
                <Text style={[s.donutPct, { color: getAccuracyColor(stats.overallAccuracy) }]}>
                  %{stats.overallAccuracy}
                </Text>
                <Text style={s.donutLabel}>Doğruluk</Text>
              </View>
            </View>
            <View style={s.donutLegend}>
              <View style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: COLORS.success }]} />
                <Text style={s.legendText}>Doğru: {stats.totalCorrect}</Text>
              </View>
              <View style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: COLORS.danger }]} />
                <Text style={s.legendText}>Yanlış: {stats.totalIncorrect}</Text>
              </View>
              <View style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: COLORS.cardBorder }]} />
                <Text style={s.legendText}>Toplam: {stats.totalQuestionsAnswered}</Text>
              </View>
              <View style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: COLORS.warning }]} />
                <Text style={s.legendText}>Oturum: {stats.recentSessions.length}</Text>
              </View>
            </View>
          </View>
        </Card>
      </View>

      <View style={{ height: SPACING.xxl }} />
    </ScrollView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: SPACING.xxl },
  empty: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.background, padding: SPACING.xl,
  },
  emptyText: { fontSize: TYPOGRAPHY.fontSizes.xl, fontWeight: TYPOGRAPHY.fontWeights.bold, color: COLORS.text },
  emptySubText: { fontSize: TYPOGRAPHY.fontSizes.base, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm },
  header: {
    padding: SPACING.md,
    paddingTop: SPACING.xl + 20,
    backgroundColor: COLORS.primary,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSizes.xxl,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.white,
    paddingBottom: SPACING.md,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  overviewCard: { width: '47%', alignItems: 'center', padding: SPACING.md },
  overviewNum: {
    fontSize: TYPOGRAPHY.fontSizes.xxl,
    fontWeight: TYPOGRAPHY.fontWeights.extrabold,
    letterSpacing: -1,
  },
  overviewLabel: {
    fontSize: TYPOGRAPHY.fontSizes.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  section: { paddingHorizontal: SPACING.md, marginBottom: SPACING.md },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: BAR_MAX_HEIGHT + 50,
    paddingTop: SPACING.md,
  },
  barItem: { flex: 1, alignItems: 'center' },
  barValue: {
    fontSize: TYPOGRAPHY.fontSizes.xs,
    color: COLORS.textSecondary,
    marginBottom: 4,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
  },
  barTrack: {
    width: 24,
    height: BAR_MAX_HEIGHT,
    justifyContent: 'flex-end',
    borderRadius: 4,
    backgroundColor: COLORS.background,
    overflow: 'hidden',
  },
  barFill: { width: '100%', borderRadius: 4 },
  barLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  barLabelToday: {
    color: COLORS.accent,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
  },
  subjectCard: { marginBottom: SPACING.sm },
  subjectTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subjectName: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.text,
  },
  subjectRight: { alignItems: 'flex-end' },
  subjectAcc: { fontSize: TYPOGRAPHY.fontSizes.md, fontWeight: TYPOGRAPHY.fontWeights.bold },
  subjectTotal: { fontSize: TYPOGRAPHY.fontSizes.xs, color: COLORS.textSecondary },
  subjectDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  subjectDetailText: { fontSize: TYPOGRAPHY.fontSizes.xs, color: COLORS.textSecondary },
  donutRow: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md },
  donutVisual: { marginRight: SPACING.xl },
  donutOuter: {
    width: 100, height: 100,
    borderRadius: 50,
    borderWidth: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutPct: { fontSize: TYPOGRAPHY.fontSizes.xl, fontWeight: TYPOGRAPHY.fontWeights.extrabold },
  donutLabel: { fontSize: 10, color: COLORS.textSecondary },
  donutLegend: { flex: 1, gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendText: { fontSize: TYPOGRAPHY.fontSizes.sm, color: COLORS.text },
});
