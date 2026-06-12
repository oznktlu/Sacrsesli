// src/screens/QuizActiveScreen.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, Animated, ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppStore } from '../store';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants';
import { ProgressBar, Button } from '../components';
import { explainQuestion } from '../services/claudeService';
import { formatDuration } from '../utils';

const OPTION_IDS = ['A', 'B', 'C', 'D', 'E'];

export const QuizActiveScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { activeSession, questions, submitAnswer, finishSession } = useAppStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90);
  const [timeSpent, setTimeSpent] = useState(0);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const session = activeSession;
  const isTimed = session?.mode === 'timed';
  const currentQuestionId = session?.questionIds[currentIndex];
  const currentQuestion = questions.find(q => q.id === currentQuestionId);
  const totalQuestions = session?.questionIds.length ?? 0;
  const progress = totalQuestions > 0 ? (currentIndex + 1) / totalQuestions : 0;

  useEffect(() => {
    if (!session) {
      navigation.goBack();
      return;
    }
  }, [session]);

  // Timer
  useEffect(() => {
    if (!isTimed) return;
    setTimeLeft(90);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [currentIndex]);

  // Non-timed timer (just counting up)
  useEffect(() => {
    if (isTimed) return;
    timerRef.current = setInterval(() => setTimeSpent(prev => prev + 1), 1000);
    return () => clearInterval(timerRef.current!);
  }, [currentIndex]);

  const handleTimeout = useCallback(() => {
    if (currentQuestion) {
      submitAnswer(currentQuestion.id, null, 90);
    }
    setIsRevealed(true);
  }, [currentQuestion]);

  const handleSelectOption = (optionId: string) => {
    if (isRevealed) return;
    setSelectedOption(optionId);
    if (isTimed || session?.mode === 'exam') return; // exam mode: no instant reveal
    // Practice mode: reveal on selection? No — wait for confirm
  };

  const handleConfirm = () => {
    if (!currentQuestion) return;
    clearInterval(timerRef.current!);
    submitAnswer(currentQuestion.id, selectedOption, timeSpent);
    setIsRevealed(true);
    setShowExplanation(session?.mode === 'practice');
  };

  const handleLoadAI = async () => {
    if (!currentQuestion) return;
    setAiLoading(true);
    try {
      const explanation = await explainQuestion(currentQuestion, selectedOption);
      setAiExplanation(explanation);
    } catch {
      setAiExplanation('AI açıklaması yüklenemedi. Lütfen tekrar deneyin.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= totalQuestions) {
      finishSession();
      navigation.replace('QuizResult', { sessionId: session?.id });
      return;
    }

    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsRevealed(false);
      setShowExplanation(false);
      setAiExplanation(null);
      setTimeSpent(0);
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  };

  const handleQuit = () => {
    Alert.alert(
      'Quizden Çık',
      'İlerleme kaydedilecek. Çıkmak istiyor musun?',
      [
        { text: 'Devam Et', style: 'cancel' },
        {
          text: 'Çık', style: 'destructive',
          onPress: () => { finishSession(); navigation.goBack(); }
        },
      ]
    );
  };

  if (!currentQuestion) {
    return (
      <View style={s.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const getOptionStyle = (optId: string) => {
    if (!isRevealed) {
      return selectedOption === optId ? s.optionSelected : s.optionDefault;
    }
    if (optId === currentQuestion.correctOptionId) return s.optionCorrect;
    if (optId === selectedOption && optId !== currentQuestion.correctOptionId) return s.optionWrong;
    return s.optionDefault;
  };

  const getOptionTextStyle = (optId: string) => {
    if (!isRevealed) {
      return selectedOption === optId ? s.optionTextSelected : s.optionText;
    }
    if (optId === currentQuestion.correctOptionId) return s.optionTextCorrect;
    if (optId === selectedOption && optId !== currentQuestion.correctOptionId) return s.optionTextWrong;
    return s.optionText;
  };

  const timerColor = timeLeft <= 15 ? COLORS.danger : timeLeft <= 30 ? COLORS.warning : COLORS.accent;

  return (
    <View style={s.container}>
      {/* Top Bar */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={handleQuit} style={s.quitBtn}>
          <Text style={s.quitText}>✕</Text>
        </TouchableOpacity>

        <View style={s.progressBlock}>
          <Text style={s.progressLabel}>{currentIndex + 1} / {totalQuestions}</Text>
          <ProgressBar progress={progress} color={COLORS.accent} height={6} style={{ width: 160, marginTop: 4 }} />
        </View>

        {isTimed ? (
          <View style={s.timerBlock}>
            <Text style={[s.timerText, { color: timerColor }]}>{timeLeft}s</Text>
          </View>
        ) : (
          <Text style={s.elapsedText}>{formatDuration(timeSpent)}</Text>
        )}
      </View>

      {/* Timer bar for timed mode */}
      {isTimed && (
        <ProgressBar
          progress={timeLeft / 90}
          color={timerColor}
          height={4}
        />
      )}

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Tags */}
          <View style={s.tags}>
            <View style={s.tag}>
              <Text style={s.tagText}>{currentQuestion.subject}</Text>
            </View>
            <View style={[s.tag, s.tagTopic]}>
              <Text style={s.tagText}>{currentQuestion.topic}</Text>
            </View>
            {currentQuestion.year && (
              <View style={[s.tag, s.tagYear]}>
                <Text style={s.tagText}>TUS {currentQuestion.year}</Text>
              </View>
            )}
          </View>

          {/* Question */}
          <Text style={s.questionText}>{currentQuestion.text}</Text>

          {/* Options */}
          <View style={s.options}>
            {currentQuestion.options.map(opt => (
              <TouchableOpacity
                key={opt.id}
                style={[s.option, getOptionStyle(opt.id)]}
                onPress={() => handleSelectOption(opt.id)}
                disabled={isRevealed}
                activeOpacity={0.8}
              >
                <View style={s.optionId}>
                  <Text style={s.optionIdText}>{opt.id}</Text>
                </View>
                <Text style={[s.optionMain, getOptionTextStyle(opt.id)]}>{opt.text}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Result & Explanation */}
          {isRevealed && (
            <View style={s.resultBlock}>
              {selectedOption === currentQuestion.correctOptionId ? (
                <View style={s.resultCorrect}>
                  <Text style={s.resultIcon}>🎯</Text>
                  <Text style={s.resultText}>Doğru!</Text>
                </View>
              ) : (
                <View style={s.resultWrong}>
                  <Text style={s.resultIcon}>❌</Text>
                  <Text style={s.resultText}>
                    {selectedOption ? `Yanlış — Doğru: ${currentQuestion.correctOptionId}` : 'Süre doldu'}
                  </Text>
                </View>
              )}

              {showExplanation && (
                <View style={s.explanationBlock}>
                  <Text style={s.explanationTitle}>📖 Açıklama</Text>
                  <Text style={s.explanationText}>{currentQuestion.explanation}</Text>
                </View>
              )}

              {/* AI Button */}
              {!aiExplanation && (
                <TouchableOpacity
                  style={s.aiBtn}
                  onPress={handleLoadAI}
                  disabled={aiLoading}
                >
                  {aiLoading ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Text style={s.aiBtnText}>✨ AI ile Detaylı Açıkla</Text>
                  )}
                </TouchableOpacity>
              )}

              {aiExplanation && (
                <View style={s.aiBlock}>
                  <Text style={s.aiBlockTitle}>✨ AI Açıklaması</Text>
                  <Text style={s.aiBlockText}>{aiExplanation}</Text>
                </View>
              )}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={s.bottomBar}>
        {!isRevealed ? (
          <Button
            label="Cevabı Onayla"
            onPress={handleConfirm}
            size="lg"
            style={s.actionBtn}
            disabled={!selectedOption}
          />
        ) : (
          <Button
            label={currentIndex + 1 >= totalQuestions ? '🏁 Sonuçları Gör' : 'Sonraki Soru →'}
            onPress={handleNext}
            size="lg"
            style={s.actionBtn}
          />
        )}
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xl + 16,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  quitBtn: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  quitText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
  progressBlock: { alignItems: 'center' },
  progressLabel: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.white,
  },
  timerBlock: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.sm,
    minWidth: 52,
    alignItems: 'center',
  },
  timerText: {
    fontSize: TYPOGRAPHY.fontSizes.lg,
    fontWeight: TYPOGRAPHY.fontWeights.extrabold,
    fontVariant: ['tabular-nums'],
  },
  elapsedText: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: 'rgba(255,255,255,0.6)',
    minWidth: 52,
    textAlign: 'right',
  },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: SPACING.md },
  tag: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.accentLight,
  },
  tagTopic: { backgroundColor: '#EDE7F6' },
  tagYear: { backgroundColor: COLORS.warningLight },
  tagText: { fontSize: TYPOGRAPHY.fontSizes.xs, fontWeight: TYPOGRAPHY.fontWeights.semibold, color: COLORS.textSecondary },
  questionText: {
    fontSize: TYPOGRAPHY.fontSizes.md,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.text,
    lineHeight: 26,
    marginBottom: SPACING.lg,
  },
  options: { gap: SPACING.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 2,
  },
  optionDefault: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.cardBorder,
  },
  optionSelected: {
    backgroundColor: '#EFF4FB',
    borderColor: COLORS.primary,
  },
  optionCorrect: {
    backgroundColor: COLORS.successLight,
    borderColor: COLORS.success,
  },
  optionWrong: {
    backgroundColor: COLORS.dangerLight,
    borderColor: COLORS.danger,
  },
  optionId: {
    width: 28, height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.cardBorder,
    alignItems: 'center', justifyContent: 'center',
    marginRight: SPACING.sm,
    flexShrink: 0,
    marginTop: 1,
  },
  optionIdText: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.text,
  },
  optionMain: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSizes.base,
    lineHeight: 22,
  },
  optionText: { color: COLORS.text },
  optionTextSelected: { color: COLORS.primary, fontWeight: TYPOGRAPHY.fontWeights.semibold },
  optionTextCorrect: { color: COLORS.success, fontWeight: TYPOGRAPHY.fontWeights.semibold },
  optionTextWrong: { color: COLORS.danger },
  resultBlock: { marginTop: SPACING.lg },
  resultCorrect: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.successLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  resultWrong: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.dangerLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  resultIcon: { fontSize: 20, marginRight: SPACING.sm },
  resultText: { fontSize: TYPOGRAPHY.fontSizes.base, fontWeight: TYPOGRAPHY.fontWeights.bold },
  explanationBlock: {
    backgroundColor: '#F0F4FA',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  explanationTitle: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  explanationText: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.text,
    lineHeight: 22,
  },
  aiBtn: {
    backgroundColor: '#7C3AED',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  aiBtnText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSizes.base,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
  },
  aiBlock: {
    backgroundColor: '#F3EEFF',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: '#7C3AED',
  },
  aiBlockTitle: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: '#7C3AED',
    marginBottom: SPACING.sm,
  },
  aiBlockText: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.text,
    lineHeight: 22,
  },
  bottomBar: {
    padding: SPACING.md,
    paddingBottom: SPACING.lg + 8,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  actionBtn: { width: '100%' },
});
