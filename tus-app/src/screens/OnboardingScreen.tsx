// src/screens/OnboardingScreen.tsx
import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Dimensions, TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../store';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants';
import { Button } from '../components';

const { width } = Dimensions.get('window');

const STEPS = [
  {
    emoji: '🏥',
    title: 'TUS Hazırlık',
    subtitle: 'Akademik. Kapsamlı. AI Destekli.',
    desc: 'Türkiye\'nin en güncel TUS soru bankası, yapay zeka açıklamaları ve detaylı istatistiklerle sınav başarını zirveye taşı.',
  },
  {
    emoji: '🧠',
    title: 'Akıllı Öğrenme',
    subtitle: 'Sadece ezberleme değil, anlama',
    desc: 'Her soruyu anlaman için AI açıklamaları, zayıf konularını tespit eden analizler ve kişiselleştirilmiş çalışma planı.',
  },
  {
    emoji: '📊',
    title: 'Performans Takibi',
    subtitle: 'Neyi bildiğini, neyi bilmediğini bil',
    desc: 'Branş bazlı doğruluk oranları, günlük aktivite grafikleri ve TUS hedef tarihine kadar olan ilerleme özeti.',
  },
];

export const OnboardingScreen: React.FC = () => {
  const { setOnboarded } = useAppStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [targetYear, setTargetYear] = useState(new Date().getFullYear() + 1);
  const [dailyGoal, setDailyGoal] = useState(20);
  const scrollRef = useRef<ScrollView>(null);

  const isLastSlide = step === STEPS.length - 1;

  const handleNext = () => {
    if (step < STEPS.length) {
      const next = step + 1;
      setStep(next);
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
    }
  };

  const handleStart = async () => {
    if (!name.trim()) return;
    await setOnboarded({
      name: name.trim(),
      targetYear,
      targetRank: 1000,
      dailyGoal,
      subscribedSubjects: [],
      isPremium: false,
    });
  };

  return (
    <View style={s.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
      >
        {/* Slides */}
        {STEPS.map((slide, i) => (
          <LinearGradient
            key={i}
            colors={['#1A3C5E', '#0D2740']}
            style={s.slide}
          >
            <Text style={s.slideEmoji}>{slide.emoji}</Text>
            <Text style={s.slideTitle}>{slide.title}</Text>
            <Text style={s.slideSubtitle}>{slide.subtitle}</Text>
            <Text style={s.slideDesc}>{slide.desc}</Text>
          </LinearGradient>
        ))}

        {/* Setup screen */}
        <LinearGradient colors={['#1A3C5E', '#0D2740']} style={s.slide}>
          <Text style={s.setupTitle}>Seni Tanıyalım 👋</Text>
          <Text style={s.setupSub}>Kişiselleştirilmiş bir deneyim için bilgilerini gir.</Text>

          <View style={s.form}>
            <Text style={s.formLabel}>Adın</Text>
            <TextInput
              style={s.formInput}
              value={name}
              onChangeText={setName}
              placeholder="Adın Soyadın"
              placeholderTextColor="rgba(255,255,255,0.4)"
              autoCapitalize="words"
            />

            <Text style={s.formLabel}>Hedef TUS Yılı</Text>
            <View style={s.yearRow}>
              {[2025, 2026, 2027, 2028].map(y => (
                <TouchableOpacity
                  key={y}
                  style={[s.yearPill, targetYear === y && s.yearPillActive]}
                  onPress={() => setTargetYear(y)}
                >
                  <Text style={[s.yearText, targetYear === y && s.yearTextActive]}>{y}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.formLabel}>Günlük Soru Hedefi</Text>
            <View style={s.yearRow}>
              {[10, 20, 40, 80].map(g => (
                <TouchableOpacity
                  key={g}
                  style={[s.yearPill, dailyGoal === g && s.yearPillActive]}
                  onPress={() => setDailyGoal(g)}
                >
                  <Text style={[s.yearText, dailyGoal === g && s.yearTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[s.startBtn, !name.trim() && s.startBtnDisabled]}
            onPress={handleStart}
            disabled={!name.trim()}
          >
            <Text style={s.startBtnText}>Başla 🚀</Text>
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>

      {/* Dots + Next (only on slides) */}
      {step < STEPS.length && (
        <View style={s.bottomBar}>
          <View style={s.dots}>
            {STEPS.map((_, i) => (
              <View
                key={i}
                style={[s.dot, step === i && s.dotActive]}
              />
            ))}
          </View>
          <TouchableOpacity style={s.nextBtn} onPress={handleNext}>
            <Text style={s.nextBtnText}>{isLastSlide ? 'Devam →' : 'İleri →'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D2740' },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  slideEmoji: { fontSize: 80, marginBottom: SPACING.xl },
  slideTitle: {
    fontSize: TYPOGRAPHY.fontSizes.display,
    fontWeight: TYPOGRAPHY.fontWeights.extrabold,
    color: COLORS.white,
    textAlign: 'center',
    letterSpacing: -1,
  },
  slideSubtitle: {
    fontSize: TYPOGRAPHY.fontSizes.md,
    color: COLORS.accent,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  slideDesc: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.xl,
    paddingBottom: SPACING.xxl,
    backgroundColor: '#0D2740',
  },
  dots: { flexDirection: 'row', gap: 8 },
  dot: {
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: { backgroundColor: COLORS.accent, width: 24 },
  nextBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.xl,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.round,
  },
  nextBtnText: {
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    fontSize: TYPOGRAPHY.fontSizes.base,
  },
  setupTitle: {
    fontSize: TYPOGRAPHY.fontSizes.xxl,
    fontWeight: TYPOGRAPHY.fontWeights.extrabold,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  setupSub: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  form: { width: '100%' },
  formLabel: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: SPACING.md,
  },
  formInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSizes.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  yearRow: { flexDirection: 'row', gap: SPACING.sm },
  yearPill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  yearPillActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  yearText: { color: 'rgba(255,255,255,0.7)', fontWeight: TYPOGRAPHY.fontWeights.bold },
  yearTextActive: { color: COLORS.white },
  startBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.round,
    paddingVertical: 18,
    paddingHorizontal: SPACING.xxl,
    marginTop: SPACING.xl,
    alignSelf: 'center',
  },
  startBtnDisabled: { opacity: 0.5 },
  startBtnText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSizes.lg,
    fontWeight: TYPOGRAPHY.fontWeights.extrabold,
  },
});
