// src/screens/AdminScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, TUS_SUBJECTS } from '../constants';
import { Card, Button, Badge, EmptyState } from '../components';
import { generateQuizQuestions } from '../services/claudeService';
import { Question } from '../types';

export const AdminDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { questions, deleteQuestion } = useAppStore();
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('');

  const filtered = questions.filter(q => {
    const matchSearch = !search || q.text.toLowerCase().includes(search.toLowerCase());
    const matchSubject = !filterSubject || q.subject === filterSubject;
    return matchSearch && matchSubject;
  });

  const handleDelete = (q: Question) => {
    Alert.alert('Soruyu Sil', 'Emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => deleteQuestion(q.id) },
    ]);
  };

  const subjectCounts = TUS_SUBJECTS.map(s => ({
    ...s,
    count: questions.filter(q => q.subject === s.label).length,
  }));

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>← Çıkış</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Admin Paneli</Text>
        <TouchableOpacity
          style={s.addBtn}
          onPress={() => navigation.navigate('AdminQuestionEdit', {})}
        >
          <Text style={s.addBtnText}>+ Ekle</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {/* Stats row */}
        <View style={s.statsRow}>
          <Card style={s.statCard}>
            <Text style={s.statNum}>{questions.length}</Text>
            <Text style={s.statLabel}>Toplam Soru</Text>
          </Card>
          <Card style={s.statCard}>
            <Text style={[s.statNum, { color: COLORS.success }]}>
              {TUS_SUBJECTS.length}
            </Text>
            <Text style={s.statLabel}>Branş</Text>
          </Card>
          <Card style={s.statCard}>
            <Text style={[s.statNum, { color: COLORS.warning }]}>
              {questions.filter(q => q.difficulty === 'zor').length}
            </Text>
            <Text style={s.statLabel}>Zor Soru</Text>
          </Card>
        </View>

        {/* Branş dağılımı */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Branş Dağılımı</Text>
          <View style={s.subjectGrid}>
            {subjectCounts.filter(s => s.count > 0).map(subj => (
              <TouchableOpacity
                key={subj.id}
                style={[s.subjectTile, filterSubject === subj.label && s.subjectTileActive]}
                onPress={() => setFilterSubject(filterSubject === subj.label ? '' : subj.label)}
              >
                <Text style={s.subjectIcon}>{subj.icon}</Text>
                <Text style={s.subjectCount}>{subj.count}</Text>
                <Text style={s.subjectName} numberOfLines={1}>{subj.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Soru listesi */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Sorular ({filtered.length})</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Soru ara..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={COLORS.textMuted}
          />

          {filtered.length === 0 ? (
            <EmptyState icon="📋" title="Soru bulunamadı" />
          ) : (
            filtered.map(q => (
              <Card key={q.id} style={s.questionCard}>
                <View style={s.questionTop}>
                  <Badge label={q.subject} />
                  <Badge
                    label={q.difficulty}
                    color={q.difficulty === 'zor' ? COLORS.danger : q.difficulty === 'orta' ? COLORS.warning : COLORS.success}
                    bgColor={q.difficulty === 'zor' ? COLORS.dangerLight : q.difficulty === 'orta' ? COLORS.warningLight : COLORS.successLight}
                  />
                </View>
                <Text style={s.questionText} numberOfLines={2}>{q.text}</Text>
                <View style={s.questionActions}>
                  <TouchableOpacity
                    style={s.editBtn}
                    onPress={() => navigation.navigate('AdminQuestionEdit', { questionId: q.id })}
                  >
                    <Text style={s.editBtnText}>✏️ Düzenle</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.deleteBtn} onPress={() => handleDelete(q)}>
                    <Text style={s.deleteBtnText}>🗑️ Sil</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

// ── AI Question Generator ─────────────────────────────────────────────────────
export const AdminQuestionEditScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { addQuestion } = useAppStore();
  const [subject, setSubject] = useState(TUS_SUBJECTS[0].label);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'kolay' | 'orta' | 'zor'>('orta');
  const [aiLoading, setAiLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState('');

  // Manual form
  const [manText, setManText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [optE, setOptE] = useState('');
  const [correct, setCorrect] = useState('A');
  const [explanation, setExplanation] = useState('');

  const handleAIGenerate = async () => {
    if (!topic.trim()) return Alert.alert('Hata', 'Konu girin');
    setAiLoading(true);
    try {
      const raw = await generateQuizQuestions(subject, topic, difficulty);
      setGeneratedText(raw);
      // Try parse and auto-fill
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
      const q = parsed.questions?.[0];
      if (q) {
        setManText(q.text);
        setOptA(q.options.find((o: any) => o.id === 'A')?.text ?? '');
        setOptB(q.options.find((o: any) => o.id === 'B')?.text ?? '');
        setOptC(q.options.find((o: any) => o.id === 'C')?.text ?? '');
        setOptD(q.options.find((o: any) => o.id === 'D')?.text ?? '');
        setOptE(q.options.find((o: any) => o.id === 'E')?.text ?? '');
        setCorrect(q.correctOptionId);
        setExplanation(q.explanation);
      }
    } catch {
      Alert.alert('AI Hatası', 'Soru üretilemedi. Formu manuel doldurun.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = () => {
    if (!manText.trim() || !optA || !optB || !optC || !optD) {
      return Alert.alert('Hata', 'Soru ve en az 4 seçenek zorunlu');
    }
    addQuestion({
      subject,
      topic: topic.trim(),
      difficulty,
      text: manText.trim(),
      options: [
        { id: 'A', text: optA },
        { id: 'B', text: optB },
        { id: 'C', text: optC },
        { id: 'D', text: optD },
        ...(optE ? [{ id: 'E', text: optE }] : []),
      ],
      correctOptionId: correct,
      explanation: explanation.trim(),
      tags: [subject, topic].filter(Boolean),
    });
    Alert.alert('✅ Kaydedildi', 'Soru başarıyla eklendi.', [
      { text: 'Tamam', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: SPACING.md, paddingTop: SPACING.xl + 20 }}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>← Geri</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Soru Ekle / Düzenle</Text>
        <TouchableOpacity onPress={handleSave} style={s.addBtn}>
          <Text style={s.addBtnText}>Kaydet</Text>
        </TouchableOpacity>
      </View>

      {/* AI Generator */}
      <Card style={{ marginBottom: SPACING.md }} elevated>
        <Text style={s.aiTitle}>✨ AI ile Soru Üret</Text>
        <Text style={s.aiSub}>Konu ve branş gir, AI otomatik doldursun</Text>

        <Text style={s2.label}>Branş</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {TUS_SUBJECTS.slice(0, 6).map(subj => (
            <TouchableOpacity
              key={subj.id}
              style={[s2.pill, subject === subj.label && s2.pillActive]}
              onPress={() => setSubject(subj.label)}
            >
              <Text style={[s2.pillText, subject === subj.label && { color: COLORS.white }]}>
                {subj.icon} {subj.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[s2.label, { marginTop: SPACING.md }]}>Konu</Text>
        <TextInput
          style={s2.input}
          value={topic}
          onChangeText={setTopic}
          placeholder="Örn: Propofol infüzyon sendromu"
          placeholderTextColor={COLORS.textMuted}
        />

        <Text style={s2.label}>Zorluk</Text>
        <View style={s2.diffRow}>
          {(['kolay', 'orta', 'zor'] as const).map(d => (
            <TouchableOpacity
              key={d}
              style={[s2.diffPill, difficulty === d && s2.diffPillActive]}
              onPress={() => setDifficulty(d)}
            >
              <Text style={[s2.diffText, difficulty === d && { color: COLORS.white }]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={s2.aiBtn} onPress={handleAIGenerate} disabled={aiLoading}>
          {aiLoading
            ? <ActivityIndicator color={COLORS.white} />
            : <Text style={s2.aiBtnText}>✨ Üret ve Formu Doldur</Text>
          }
        </TouchableOpacity>
      </Card>

      {/* Manual form */}
      <Text style={s2.label}>Soru Metni</Text>
      <TextInput
        style={[s2.input, { height: 100, textAlignVertical: 'top' }]}
        value={manText}
        onChangeText={setManText}
        multiline
        placeholder="Soru metni..."
        placeholderTextColor={COLORS.textMuted}
      />

      {['A', 'B', 'C', 'D', 'E'].map((id, i) => {
        const vals = [optA, optB, optC, optD, optE];
        const setters = [setOptA, setOptB, setOptC, setOptD, setOptE];
        return (
          <View key={id}>
            <Text style={s2.label}>
              {id} {i < 4 ? '(zorunlu)' : '(opsiyonel)'}
            </Text>
            <TextInput
              style={s2.input}
              value={vals[i]}
              onChangeText={setters[i]}
              placeholder={`Seçenek ${id}`}
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
        );
      })}

      <Text style={s2.label}>Doğru Cevap</Text>
      <View style={s2.diffRow}>
        {['A', 'B', 'C', 'D', 'E'].map(id => (
          <TouchableOpacity
            key={id}
            style={[s2.diffPill, correct === id && s2.diffPillActive]}
            onPress={() => setCorrect(id)}
          >
            <Text style={[s2.diffText, correct === id && { color: COLORS.white }]}>{id}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s2.label}>Açıklama</Text>
      <TextInput
        style={[s2.input, { height: 120, textAlignVertical: 'top' }]}
        value={explanation}
        onChangeText={setExplanation}
        multiline
        placeholder="Detaylı açıklama..."
        placeholderTextColor={COLORS.textMuted}
      />

      <Button label="✅ Soruyu Kaydet" onPress={handleSave} size="lg" style={{ marginTop: SPACING.md }} />
      <View style={{ height: SPACING.xxl }} />
    </ScrollView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: SPACING.md, paddingTop: SPACING.xl + 20,
    backgroundColor: COLORS.primary,
  },
  back: { color: 'rgba(255,255,255,0.7)', fontSize: TYPOGRAPHY.fontSizes.base },
  headerTitle: { fontSize: TYPOGRAPHY.fontSizes.md, fontWeight: TYPOGRAPHY.fontWeights.bold, color: COLORS.white },
  addBtn: {
    backgroundColor: COLORS.accent, paddingHorizontal: SPACING.md,
    paddingVertical: 8, borderRadius: BORDER_RADIUS.round,
  },
  addBtnText: { color: COLORS.white, fontWeight: TYPOGRAPHY.fontWeights.bold, fontSize: TYPOGRAPHY.fontSizes.sm },
  content: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  statsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  statCard: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: TYPOGRAPHY.fontSizes.xl, fontWeight: TYPOGRAPHY.fontWeights.extrabold, color: COLORS.primary },
  statLabel: { fontSize: TYPOGRAPHY.fontSizes.xs, color: COLORS.textSecondary },
  section: { marginBottom: SPACING.md },
  sectionTitle: { fontSize: TYPOGRAPHY.fontSizes.md, fontWeight: TYPOGRAPHY.fontWeights.bold, color: COLORS.text, marginBottom: SPACING.sm },
  subjectGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  subjectTile: {
    width: '30%', alignItems: 'center', padding: SPACING.sm,
    backgroundColor: COLORS.card, borderRadius: BORDER_RADIUS.md,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  subjectTileActive: { borderColor: COLORS.primary, backgroundColor: '#EFF4FB' },
  subjectIcon: { fontSize: 20 },
  subjectCount: { fontSize: TYPOGRAPHY.fontSizes.md, fontWeight: TYPOGRAPHY.fontWeights.bold, color: COLORS.primary, marginTop: 4 },
  subjectName: { fontSize: 10, color: COLORS.textSecondary, textAlign: 'center' },
  searchInput: {
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.cardBorder,
    borderRadius: BORDER_RADIUS.md, padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSizes.base, color: COLORS.text, marginBottom: SPACING.md,
  },
  questionCard: { marginBottom: SPACING.sm },
  questionTop: { flexDirection: 'row', gap: SPACING.sm, marginBottom: 6 },
  questionText: { fontSize: TYPOGRAPHY.fontSizes.sm, color: COLORS.text, lineHeight: 20, marginBottom: SPACING.sm },
  questionActions: { flexDirection: 'row', gap: SPACING.md },
  editBtn: { padding: 6 },
  editBtnText: { fontSize: TYPOGRAPHY.fontSizes.sm, color: COLORS.primary, fontWeight: TYPOGRAPHY.fontWeights.semibold },
  deleteBtn: { padding: 6 },
  deleteBtnText: { fontSize: TYPOGRAPHY.fontSizes.sm, color: COLORS.danger },
  aiTitle: { fontSize: TYPOGRAPHY.fontSizes.md, fontWeight: TYPOGRAPHY.fontWeights.bold, color: COLORS.text },
  aiSub: { fontSize: TYPOGRAPHY.fontSizes.xs, color: COLORS.textSecondary, marginBottom: SPACING.md },
});

const s2 = StyleSheet.create({
  label: {
    fontSize: TYPOGRAPHY.fontSizes.xs, fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.textSecondary, textTransform: 'uppercase',
    letterSpacing: 0.5, marginBottom: 6, marginTop: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.cardBorder,
    borderRadius: BORDER_RADIUS.md, padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSizes.base, color: COLORS.text, marginBottom: SPACING.sm,
  },
  pill: {
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: BORDER_RADIUS.round, borderWidth: 1, borderColor: COLORS.cardBorder,
    marginRight: 8, backgroundColor: COLORS.card,
  },
  pillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  pillText: { fontSize: TYPOGRAPHY.fontSizes.xs, color: COLORS.textSecondary },
  diffRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  diffPill: {
    flex: 1, alignItems: 'center', paddingVertical: 10,
    borderRadius: BORDER_RADIUS.md, borderWidth: 2, borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.card,
  },
  diffPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  diffText: { fontSize: TYPOGRAPHY.fontSizes.sm, fontWeight: TYPOGRAPHY.fontWeights.bold, color: COLORS.textSecondary },
  aiBtn: {
    backgroundColor: '#7C3AED', borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md, alignItems: 'center', marginTop: SPACING.md,
  },
  aiBtnText: { color: COLORS.white, fontWeight: TYPOGRAPHY.fontWeights.bold },
});
