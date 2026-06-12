// src/services/claudeService.ts
import { ANTHROPIC_API_BASE, CLAUDE_MODEL } from '../constants';
import { Question } from '../types';

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

const callClaude = async (messages: ClaudeMessage[], systemPrompt: string): Promise<string> => {
  const response = await fetch(ANTHROPIC_API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API Hatası: ${response.status} - ${err}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text ?? '';
};

export const explainQuestion = async (
  question: Question,
  userSelectedOptionId: string | null
): Promise<string> => {
  const systemPrompt = `Sen bir TUS (Tıpta Uzmanlık Sınavı) uzman eğitmenisin. 
Türkçe, açık ve anlaşılır bir dil kullanarak soruları açıklarsın.
Cevapların şu yapıda olsun:
1. Doğru cevap ve neden doğru olduğu
2. Yanlış seçeneklerin neden yanlış olduğu (kısa)
3. Klinik pearl / hatırlatıcı not
Markdown kullanabilirsin. Özlü ve eğitici ol.`;

  const userChoice = userSelectedOptionId
    ? `Öğrencinin seçtiği cevap: ${userSelectedOptionId}`
    : 'Öğrenci cevap vermedi.';

  const questionText = `
Soru: ${question.text}

Seçenekler:
${question.options.map(o => `${o.id}) ${o.text}`).join('\n')}

Doğru cevap: ${question.correctOptionId}
${userChoice}

Bu soruyu detaylı açıkla.`;

  return callClaude([{ role: 'user', content: questionText }], systemPrompt);
};

export const askQuestionChat = async (
  question: Question,
  chatHistory: ClaudeMessage[],
  userMessage: string
): Promise<string> => {
  const systemPrompt = `Sen bir TUS uzman eğitmenisin. Aşağıdaki TUS sorusu bağlamında öğrencinin sorularını yanıtlıyorsun.

SORU: ${question.text}
SEÇENEKLER: ${question.options.map(o => `${o.id}) ${o.text}`).join(' | ')}
DOĞRU CEVAP: ${question.correctOptionId}
AÇIKLAMA: ${question.explanation}

Türkçe, kısa ve net cevap ver. Klinik bağlantı kur.`;

  const messages: ClaudeMessage[] = [
    ...chatHistory,
    { role: 'user', content: userMessage },
  ];

  return callClaude(messages, systemPrompt);
};

export const generateSpotNoteSummary = async (topic: string, subject: string): Promise<string> => {
  const systemPrompt = `Sen bir TUS uzman eğitmenisin. Verilen konu için kısa, ezberlenmesi kolay spot notlar oluşturuyorsun.
Format:
- Markdown kullan
- Bullet points ile ana noktaları listele
- Önemli sayıları/değerleri **kalın** yaz
- Maksimum 300 kelime
- Türkçe`;

  const prompt = `${subject} - ${topic} konusu için TUS spot notları oluştur.`;
  return callClaude([{ role: 'user', content: prompt }], systemPrompt);
};

export const generateQuizQuestions = async (
  subject: string,
  topic: string,
  difficulty: string
): Promise<string> => {
  const systemPrompt = `Sen bir TUS soru yazarısın. JSON formatında soru üret.
Format: {"questions": [{"text": "...", "options": [{"id":"A","text":"..."},...], "correctOptionId": "X", "explanation": "..."}]}
Sadece JSON döndür, başka metin ekleme.`;

  const prompt = `${subject} - ${topic} konusunda ${difficulty} zorlukta 3 adet TUS sorusu oluştur.`;
  return callClaude([{ role: 'user', content: prompt }], systemPrompt);
};
