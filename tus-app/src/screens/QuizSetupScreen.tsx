// src/screens/QuizSetupScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../store';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, TUS_SUBJECTS, QUIZ_MODES, QUESTION_COUNTS } from '../constants';
import { Button, Card } from '../components';
import { QuizMode } from '../types';

export const QuizSetupScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { startSession, questions } = useAppStore();

  const [selectedSubject, setSelectedSubject] = useState<string | undefined>(route.params?.subject);
  const [selectedMode, setSelectedMode] = useState<QuizMode>(route.params?.mode ?? 'practice');
  const [selectedCount, setSelectedCount] = useState(20);

  const availableCount = questions.filter(q =>
    !selectedSubject || q.subject === selectedSubject
  ).length;

  const handleStart = () => {
    const session = startSession({
      mode: selectedMode,
      subject: selectedSubject,
      count: selectedCount,
    });
    navigation.navigate('QuizActive', { sessionId: session.id });
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Header */}
      <LinearGradient colors={['#1A3C5E', '#0D2740']} style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Quiz Ayarları</Text>
        <Text style={s.headerSub}>{availableCount} soru mevcut</Text>
      </LinearGradient>

      {/* Branş seçimi */}
      <View style={s.section}>
        <Text style={s.sectionLabel}>Branş</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.horizontalScroll}>
          <TouchableOpacity
            style={[s.subjectPill, !selectedSubject && s.subjectPillActive]}
            onPress={() => setSelectedSubject(undefined)}
          >
            <Text style={[s.subjectPillText, !selectedSubject && s.subjectPillTextActive]}>
              🎯 Karma
            </Text>
          </TouchableOpacity>
          {TUS_SUBJECTS.map(subj => (
            <TouchableOpacity
              key={subj.id}
              style={[s.subjectPill, selectedSubject === subj.label && s.subjectPillActive]}
              onPress={() => setSelectedSubject(subj.label)}
            >
              <Text style={[s.subjectPillText, selectedSubject === subj.label && s.subjectPillTextActive]}>
                {subj.icon} {subj.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Mod seçimi */}
      <View style={s.section}>
        <Text style={s.sectionLabel}>Quiz Modu</Text>
        {QUIZ_MODES.map(mode => (
          <TouchableOpacity
            key={mode.id}
            style={[s.modeCard, selectedMode === mode.id && s.modeCardActive]}
            onPress={() => setSelectedMode(mode.id as QuizMode)}
            activeOpacity={0.8}
          >
            <View style={[s.modeColor, { backgroundColor: mode.color }]} />
            <View style={s.modeInfo}>
              <Text style={[s.modeName, selectedMode === mode.id && s.modeNameActive]}>
                {mode.label}
              </Text>
              <Text style={s.modeDesc}>{mode.description}</Text>
            </View>
            {selectedMode === mode.id && (
              <View style={s.modeCheck}>
                <Text style={s.modeCheckText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Soru sayısı */}
      <View style={s.section}>
        <Text style={s.sectionLabel}>Soru Sayısı</Text>
        <View style={s.countRow}>
          {QUESTION_COUNTS.map(cnt => (
            <TouchableOpacity
              key={cnt}
              style={[s.countPill, selectedCount === cnt && s.countPillActive]}
              onPress={() => setSelectedCount(cnt)}
            >
              <Text style={[s.countText, selectedCount === cnt && s.countTextActive]}>
                {cnt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Özet */}
      <Card style={s.summaryCard} elevated>
        <Text style={s.summaryTitle}>Quiz Özeti</Text>
        <View style={s.summaryRow}>
          <Text style={s.summaryKey}>Branş</Text>
          <Text style={s.summaryVal}>{selectedSubject ?? 'Karma (Tüm)'}</Text>
        </View>
        <View style={s.summaryRow}>
          <Text style={s.summaryKey}>Mod</Text>
          <Text style={s.summaryVal}>{QUIZ_MODES.find(m => m.id === selectedMode)?.label}</Text>
        </View>
        <View style={s.summaryRow}>
          <Text style={s.summaryKey}>Soru</Text>
          <Text style={s.summaryVal}>
            {Math.min(selectedCount, availableCount)} soru
          </Text>
        </View>
        {selectedMode === 'timed' && (
          <View style={s.summaryRow}>
            <Text style={s.summaryKey}>Süre</Text>
            <Text style={s.summaryVal}>{Math.min(selectedCount, availableCount) * 1.5} dk</Text>
          </View>
        )}
      </Card>

      <Button
        label="Quizi Başlat"
        onPress={handleStart}
        size="lg"
        style={s.startBtn}
        disabled={availableCount === 0}
      />
    </ScrollView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: SPACING.xxl },
  header: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl + 20,
    paddingBottom: SPACING.xl,
  },
  backBtn: { marginBottom: SPACING.md },
  backText: { color: 'rgba(255,255,255,0.7)', fontSize: TYPOGRAPHY.fontSizes.base },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSizes.xxl,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.white,
  },
  headerSub: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.accent,
    marginTop: 4,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
  },
  section: { padding: SPACING.md, marginTop: SPACING.sm },
  sectionLabel: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  horizontalScroll: { marginHorizontal: -SPACING.md },
  subjectPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.card,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    flexShrink: 0,
    marginLeft: 4,
  },
  subjectPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  subjectPillText: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeights.medium,
  },
  subjectPillTextActive: {
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
  },
  modeCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0F4FA',
  },
  modeColor: {
    width: 6,
    height: 40,
    borderRadius: 3,
    marginRight: SPACING.md,
  },
  modeInfo: { flex: 1 },
  modeName: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.text,
  },
  modeNameActive: { color: COLORS.primary },
  modeDesc: {
    fontSize: TYPOGRAPHY.fontSizes.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  modeCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeCheckText: { color: COLORS.white, fontSize: 14, fontWeight: 'bold' },
  countRow: { flexDirection: 'row', gap: SPACING.sm },
  countPill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.card,
    alignItems: 'center',
  },
  countPillActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentLight,
  },
  countText: {
    fontSize: TYPOGRAPHY.fontSizes.md,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.textSecondary,
  },
  countTextActive: { color: COLORS.accent },
  summaryCard: { marginHorizontal: SPACING.md, marginTop: SPACING.md },
  summaryTitle: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  summaryKey: { fontSize: TYPOGRAPHY.fontSizes.sm, color: COLORS.textSecondary },
  summaryVal: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.text,
  },
  startBtn: { marginHorizontal: SPACING.md, marginTop: SPACING.lg },
});
