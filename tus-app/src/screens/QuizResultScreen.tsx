// src/screens/QuizResultScreen.tsx
import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppStore } from '../store';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants';
import { Card, ProgressBar, Button } from '../components';
import { getAccuracyColor, formatDuration } from '../utils';

export const QuizResultScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { sessions, questions } = useAppStore();

  const session = sessions.find(s => s.id === route.params?.sessionId)
    ?? sessions[0];

  if (!session) {
    navigation.replace('MainTabs');
    return null;
  }

  const correct = session.answers.filter(a => a.isCorrect).length;
  const total = session.answers.length;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const totalTime = session.answers.reduce((acc, a) => acc + a.timeSpent, 0);
  const avgTime = total > 0 ? Math.round(totalTime / total) : 0;

  const getGrade = () => {
    if (pct >= 90) return { emoji: '🏆', label: 'Mükemmel!', color: COLORS.success };
    if (pct >= 75) return { emoji: '⭐', label: 'Çok İyi', color: COLORS.success };
    if (pct >= 60) return { emoji: '👍', label: 'İyi', color: COLORS.warning };
    if (pct >= 45) return { emoji: '📚', label: 'Çalışmaya Devam', color: COLORS.warning };
    return { emoji: '💪', label: 'Daha Fazla Pratik Gerek', color: COLORS.danger };
  };

  const grade = getGrade();

  // Wrong questions
  const wrongAnswers = session.answers.filter(a => !a.isCorrect);
  const wrongQuestions = wrongAnswers
    .map(a => ({ answer: a, question: questions.find(q => q.id === a.questionId) }))
    .filter(x => x.question);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Hero */}
      <LinearGradient colors={['#1A3C5E', '#0D2740']} style={s.hero}>
        <Text style={s.heroEmoji}>{grade.emoji}</Text>
        <Text style={s.heroGrade}>{grade.label}</Text>
        <Text style={s.heroScore}>{pct}%</Text>
        <Text style={s.heroSub}>{correct} / {total} doğru</Text>

        <View style={s.heroProgress}>
          <ProgressBar
            progress={pct / 100}
            color={pct >= 60 ? COLORS.accent : COLORS.danger}
            height={14}
          />
        </View>
      </LinearGradient>

      {/* Stats */}
      <View style={s.statsGrid}>
        <Card style={s.statCard}>
          <Text style={[s.statNum, { color: COLORS.success }]}>{correct}</Text>
          <Text style={s.statLbl}>Doğru</Text>
        </Card>
        <Card style={s.statCard}>
          <Text style={[s.statNum, { color: COLORS.danger }]}>{total - correct}</Text>
          <Text style={s.statLbl}>Yanlış</Text>
        </Card>
        <Card style={s.statCard}>
          <Text style={[s.statNum, { color: COLORS.warning }]}>{formatDuration(avgTime)}</Text>
          <Text style={s.statLbl}>Ort. Süre</Text>
        </Card>
        <Card style={s.statCard}>
          <Text style={[s.statNum, { color: COLORS.primary }]}>{formatDuration(totalTime)}</Text>
          <Text style={s.statLbl}>Toplam</Text>
        </Card>
      </View>

      {/* Wrong questions */}
      {wrongQuestions.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>❌ Yanlış Sorular ({wrongQuestions.length})</Text>
          {wrongQuestions.map(({ answer, question }) => (
            <Card key={answer.questionId} style={s.wrongCard}>
              <Text style={s.wrongSubject}>{question!.subject} — {question!.topic}</Text>
              <Text style={s.wrongText} numberOfLines={2}>{question!.text}</Text>
              <View style={s.wrongAnswerRow}>
                <View style={s.wrongTag}>
                  <Text style={s.wrongTagText}>
                    Senin: {answer.selectedOptionId ?? 'Boş'}
                  </Text>
                </View>
                <View style={s.correctTag}>
                  <Text style={s.correctTagText}>
                    Doğru: {question!.correctOptionId}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('QuestionDetail', { questionId: question!.id })}
              >
                <Text style={s.reviewLink}>Soruyu incele →</Text>
              </TouchableOpacity>
            </Card>
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={s.actions}>
        <Button
          label="Yeniden Dene"
          onPress={() => navigation.navigate('QuizSetup', { subject: session.subject })}
          variant="primary"
          size="lg"
          style={s.actionBtn}
        />
        <Button
          label="Ana Sayfa"
          onPress={() => navigation.navigate('MainTabs')}
          variant="ghost"
          size="lg"
          style={s.actionBtn}
        />
      </View>
    </ScrollView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: SPACING.xxl },
  hero: {
    alignItems: 'center',
    padding: SPACING.xl,
    paddingTop: SPACING.xxl + 20,
    paddingBottom: SPACING.xxl,
  },
  heroEmoji: { fontSize: 56, marginBottom: SPACING.sm },
  heroGrade: {
    fontSize: TYPOGRAPHY.fontSizes.xl,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  heroScore: {
    fontSize: 72,
    fontWeight: TYPOGRAPHY.fontWeights.extrabold,
    color: COLORS.white,
    letterSpacing: -2,
  },
  heroSub: {
    fontSize: TYPOGRAPHY.fontSizes.md,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: SPACING.lg,
  },
  heroProgress: { width: '100%' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    padding: SPACING.md,
  },
  statCard: { flex: 1, minWidth: '45%', alignItems: 'center', padding: SPACING.md },
  statNum: {
    fontSize: TYPOGRAPHY.fontSizes.xl,
    fontWeight: TYPOGRAPHY.fontWeights.extrabold,
    letterSpacing: -0.5,
  },
  statLbl: {
    fontSize: TYPOGRAPHY.fontSizes.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  section: { paddingHorizontal: SPACING.md },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSizes.md,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  wrongCard: { marginBottom: SPACING.sm },
  wrongSubject: {
    fontSize: TYPOGRAPHY.fontSizes.xs,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  wrongText: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  wrongAnswerRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  wrongTag: {
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.dangerLight,
  },
  wrongTagText: {
    fontSize: TYPOGRAPHY.fontSizes.xs,
    color: COLORS.danger,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
  },
  correctTag: {
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.successLight,
  },
  correctTagText: {
    fontSize: TYPOGRAPHY.fontSizes.xs,
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
  },
  reviewLink: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
  },
  actions: { padding: SPACING.md, gap: SPACING.sm },
  actionBtn: { width: '100%' },
});
