// src/screens/NotesScreen.tsx
import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, TUS_SUBJECTS } from '../constants';
import { Card, EmptyState, Badge } from '../components';
import { formatDate } from '../utils';

export const NotesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { spotNotes, deleteSpotNote, togglePinNote } = useAppStore();
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let notes = [...spotNotes].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    if (selectedSubject) notes = notes.filter(n => n.subject === selectedSubject);
    if (search.trim()) {
      const q = search.toLowerCase();
      notes = notes.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return notes;
  }, [spotNotes, search, selectedSubject]);

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Notu Sil', `"${title}" silinecek. Emin misin?`, [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => deleteSpotNote(id) },
    ]);
  };

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Spot Notlar</Text>
        <TouchableOpacity
          style={s.addBtn}
          onPress={() => navigation.navigate('SpotNoteEdit', {})}
        >
          <Text style={s.addBtnText}>+ Yeni Not</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={s.searchContainer}>
        <TextInput
          style={s.searchInput}
          placeholder="Not ara..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Subject filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.filterScroll}
        contentContainerStyle={s.filterContent}
      >
        <TouchableOpacity
          style={[s.filterPill, !selectedSubject && s.filterPillActive]}
          onPress={() => setSelectedSubject(null)}
        >
          <Text style={[s.filterText, !selectedSubject && s.filterTextActive]}>Tümü</Text>
        </TouchableOpacity>
        {TUS_SUBJECTS.map(subj => (
          <TouchableOpacity
            key={subj.id}
            style={[s.filterPill, selectedSubject === subj.label && s.filterPillActive]}
            onPress={() => setSelectedSubject(
              selectedSubject === subj.label ? null : subj.label
            )}
          >
            <Text style={[s.filterText, selectedSubject === subj.label && s.filterTextActive]}>
              {subj.icon} {subj.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Notes list */}
      <ScrollView style={s.list} contentContainerStyle={s.listContent}>
        {filtered.length === 0 ? (
          <EmptyState
            icon="📝"
            title="Henüz not yok"
            description="Önemli konuları spot not olarak kaydet, hızlıca tekrar et."
            action="İlk Notunu Ekle"
            onAction={() => navigation.navigate('SpotNoteEdit', {})}
          />
        ) : (
          filtered.map(note => (
            <Card
              key={note.id}
              style={[s.noteCard, note.isPinned && s.noteCardPinned]}
              onPress={() => navigation.navigate('SpotNoteDetail', { noteId: note.id })}
            >
              <View style={s.noteTop}>
                <View style={s.noteMeta}>
                  {note.isPinned && <Text style={s.pinIcon}>📌 </Text>}
                  <Text style={s.noteSubject}>{note.subject}</Text>
                </View>
                <View style={s.noteActions}>
                  <TouchableOpacity
                    style={s.noteAction}
                    onPress={() => togglePinNote(note.id)}
                  >
                    <Text style={s.noteActionText}>{note.isPinned ? '📌' : '📍'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.noteAction}
                    onPress={() => navigation.navigate('SpotNoteEdit', { noteId: note.id })}
                  >
                    <Text style={s.noteActionText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.noteAction}
                    onPress={() => handleDelete(note.id, note.title)}
                  >
                    <Text style={s.noteActionText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={s.noteTitle}>{note.title}</Text>
              <Text style={s.notePreview} numberOfLines={3}>{note.content}</Text>

              <View style={s.noteBottom}>
                <View style={s.noteTags}>
                  {note.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} label={tag} />
                  ))}
                </View>
                <Text style={s.noteDate}>{formatDate(note.updatedAt)}</Text>
              </View>
            </Card>
          ))
        )}
        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </View>
  );
};

// ── SpotNoteEditScreen ────────────────────────────────────────────────────────
export const SpotNoteEditScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = (useNavigation() as any).getCurrentRoute?.()
    ?? { params: {} };

  // Can't easily get route from useNavigation — use separate hook
  return <SpotNoteEditInner />;
};

export const SpotNoteEditInner: React.FC = () => {
  const navigation = useNavigation<any>();
  const { spotNotes, saveSpotNote, generateSpotNoteSummary } = useAppStore() as any;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState(TUS_SUBJECTS[0].label);
  const [topic, setTopic] = useState('');
  const [tags, setTags] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const { generateSpotNoteSummary: genSummary } = require('../services/claudeService');

  const handleSave = () => {
    if (!title.trim()) return Alert.alert('Hata', 'Başlık zorunlu');
    saveSpotNote({
      title: title.trim(),
      content: content.trim(),
      subject,
      topic: topic.trim(),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      isPinned: false,
    });
    navigation.goBack();
  };

  const handleAIGenerate = async () => {
    if (!topic.trim()) return Alert.alert('Konu Gir', 'AI için konu alanını doldurun');
    setAiLoading(true);
    try {
      const text = await genSummary(topic, subject);
      setContent(text);
    } catch {
      Alert.alert('Hata', 'AI bağlantısı başarısız');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: SPACING.md, paddingTop: SPACING.xl + 20 }}>
      <View style={s2.row}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s2.back}>← Geri</Text>
        </TouchableOpacity>
        <Text style={s2.editorTitle}>Yeni Not</Text>
        <TouchableOpacity onPress={handleSave} style={s2.saveBtn}>
          <Text style={s2.saveBtnText}>Kaydet</Text>
        </TouchableOpacity>
      </View>

      <Text style={s2.label}>Başlık</Text>
      <TextInput style={s2.input} value={title} onChangeText={setTitle} placeholder="Not başlığı" />

      <Text style={s2.label}>Branş</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.md }}>
        {TUS_SUBJECTS.slice(0, 8).map(subj => (
          <TouchableOpacity
            key={subj.id}
            style={[s2.subjectPill, subject === subj.label && s2.subjectPillActive]}
            onPress={() => setSubject(subj.label)}
          >
            <Text style={[s2.subjectPillText, subject === subj.label && { color: COLORS.white }]}>
              {subj.icon} {subj.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={s2.label}>Konu</Text>
      <TextInput style={s2.input} value={topic} onChangeText={setTopic} placeholder="Örn: LAST tedavisi" />

      <TouchableOpacity style={s2.aiBtn} onPress={handleAIGenerate} disabled={aiLoading}>
        <Text style={s2.aiBtnText}>{aiLoading ? 'Üretiliyor...' : '✨ AI ile Spot Not Oluştur'}</Text>
      </TouchableOpacity>

      <Text style={s2.label}>İçerik</Text>
      <TextInput
        style={[s2.input, s2.textarea]}
        value={content}
        onChangeText={setContent}
        placeholder="Not içeriği (Markdown destekli)..."
        multiline
        numberOfLines={10}
        textAlignVertical="top"
      />

      <Text style={s2.label}>Etiketler (virgülle ayır)</Text>
      <TextInput
        style={s2.input}
        value={tags}
        onChangeText={setTags}
        placeholder="propofol, PRIS, yoğun bakım"
      />
    </ScrollView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    paddingTop: SPACING.xl + 20,
    backgroundColor: COLORS.primary,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSizes.xl,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.white,
  },
  addBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.round,
  },
  addBtnText: {
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    fontSize: TYPOGRAPHY.fontSizes.sm,
  },
  searchContainer: { padding: SPACING.md, backgroundColor: COLORS.primary },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSizes.base,
  },
  filterScroll: { backgroundColor: COLORS.card, maxHeight: 52 },
  filterContent: { paddingHorizontal: SPACING.md, paddingVertical: 10, gap: 8 },
  filterPill: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  filterPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { fontSize: TYPOGRAPHY.fontSizes.xs, color: COLORS.textSecondary },
  filterTextActive: { color: COLORS.white, fontWeight: TYPOGRAPHY.fontWeights.bold },
  list: { flex: 1 },
  listContent: { padding: SPACING.md },
  noteCard: { marginBottom: SPACING.sm },
  noteCardPinned: { borderColor: COLORS.accent, borderWidth: 2 },
  noteTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  noteMeta: { flexDirection: 'row', alignItems: 'center' },
  pinIcon: { fontSize: 14 },
  noteSubject: {
    fontSize: TYPOGRAPHY.fontSizes.xs,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.accent,
  },
  noteActions: { flexDirection: 'row', gap: 4 },
  noteAction: { padding: 4 },
  noteActionText: { fontSize: 16 },
  noteTitle: {
    fontSize: TYPOGRAPHY.fontSizes.md,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.text,
    marginBottom: 6,
  },
  notePreview: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  noteBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  noteTags: { flexDirection: 'row', gap: 4 },
  noteDate: { fontSize: TYPOGRAPHY.fontSizes.xs, color: COLORS.textMuted },
});

const s2 = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: SPACING.lg,
  },
  back: { color: COLORS.primary, fontSize: TYPOGRAPHY.fontSizes.base },
  editorTitle: {
    fontSize: TYPOGRAPHY.fontSizes.md,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.text,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.round,
  },
  saveBtnText: { color: COLORS.white, fontWeight: TYPOGRAPHY.fontWeights.bold },
  label: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSizes.base,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  textarea: { height: 200, textAlignVertical: 'top' },
  subjectPill: {
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    marginRight: 8, backgroundColor: COLORS.card,
  },
  subjectPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  subjectPillText: { fontSize: TYPOGRAPHY.fontSizes.xs, color: COLORS.textSecondary },
  aiBtn: {
    backgroundColor: '#7C3AED',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  aiBtnText: { color: COLORS.white, fontWeight: TYPOGRAPHY.fontWeights.bold },
});
