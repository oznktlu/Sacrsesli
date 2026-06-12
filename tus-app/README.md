# 🏥 TUS Hazırlık App — Production-Ready React Native

## Proje Özeti

Türkiye TUS sınavına yönelik, para kazandırmak için tasarlanmış profesyonel mobil uygulama.  
**React Native + Expo** ile iOS ve Android'de çalışır.

---

## 🏗️ Mimari

```
tus-app/
├── App.tsx                    # Root entry point
├── src/
│   ├── types/index.ts         # TypeScript interfaces
│   ├── constants/index.ts     # Renkler, branşlar, config
│   ├── store/index.ts         # Zustand global state
│   ├── services/
│   │   └── claudeService.ts   # Anthropic API entegrasyonu
│   ├── utils/
│   │   ├── index.ts           # Yardımcı fonksiyonlar
│   │   └── sampleData.ts      # 10 örnek TUS sorusu
│   ├── components/index.tsx   # Reusable UI bileşenleri
│   ├── navigation/index.tsx   # React Navigation setup
│   └── screens/
│       ├── OnboardingScreen.tsx   # 3 slide + profil kurulum
│       ├── HomeScreen.tsx         # Dashboard
│       ├── QuizSetupScreen.tsx    # Quiz konfigürasyonu
│       ├── QuizActiveScreen.tsx   # Aktif quiz (AI açıklamalı)
│       ├── QuizResultScreen.tsx   # Sonuç analizi
│       ├── NotesScreen.tsx        # Spot notlar + AI üretim
│       ├── StatsScreen.tsx        # İstatistikler + grafik
│       └── AdminScreen.tsx        # Admin paneli
```

---

## 🚀 Kurulum (Claude Code)

```bash
# 1. Proje klasörüne gir
cd tus-app

# 2. Bağımlılıkları yükle
npm install

# 3. Expo CLI kur (gerekirse)
npm install -g expo-cli

# 4. Uygulamayı başlat
npx expo start

# iOS Simulator için:
npx expo start --ios

# Android için:
npx expo start --android
```

---

## 📱 Özellikler

### ✅ Soru Bankası + Quiz
- 4 quiz modu: Alıştırma, Zamanlı (90sn/soru), Sınav, Zayıf Konular
- Branş ve konu filtreleme
- Anında geri bildirim + renk kodlu seçenekler
- Progress tracker, süre sayacı

### ✅ AI Destekli Açıklama (Claude API)
- Her soru için "✨ AI ile Detaylı Açıkla" butonu
- Soruya dayalı interaktif chat
- Spot not AI üretimi

### ✅ Spot Notlar
- Markdown destekli not editörü
- Branş + etiket sistemi
- Sabitleme (pin) özelliği
- AI ile otomatik not üretimi

### ✅ İstatistikler
- Branş bazlı doğruluk oranları
- Haftalık aktivite bar grafiği
- Günlük seri (streak) takibi
- Genel dağılım görselleştirmesi

### ✅ Admin Paneli
- Soru ekleme/düzenleme/silme
- AI ile otomatik soru üretimi (JSON parse + form auto-fill)
- Branş dağılımı özeti
- Filtreleme ve arama

---

## 🤖 Claude API Entegrasyonu

`src/services/claudeService.ts` dosyasında 3 ana işlev:

1. **explainQuestion()** — Soru açıklaması
2. **askQuestionChat()** — Interaktif soru-cevap
3. **generateSpotNoteSummary()** — Spot not üretimi
4. **generateQuizQuestions()** — Admin için soru üretimi

API key otomatik olarak Anthropic proxy üzerinden işlenir.

---

## 💰 Monetizasyon Stratejisi

```
Freemium Model:
├── Ücretsiz: 20 soru/gün, temel istatistik
├── Premium (₺199/ay): Sınırsız soru, AI açıklamalar, tam analiz
└── Pro (₺499/ay): Admin paneli, özel soru bankası
```

**Expo IAP** ile App Store/Play Store abonelik entegrasyonu için:
```bash
npx expo install expo-in-app-purchases
```

---

## 🎨 Tasarım Sistemi

```
Palet:
- Primary:  #1A3C5E (lacivert — tıbbi güven)
- Accent:   #00BFA5 (teal — modern, canlı)
- Danger:   #E53935
- Success:  #43A047
- Warning:  #FFB300

Tipografi: System font, 8 boyut skalası
```

---

## 📦 Sonraki Adımlar

1. **Soru bankası büyütme**: Admin panelinden AI ile üret veya PDF'ten import et
2. **Backend**: Firebase/Supabase ile cloud sync
3. **Push notifications**: Günlük hatırlatma
4. **Premium**: Expo IAP ile abonelik
5. **App Store deployment**: `eas build --platform ios`

---

## 🛠️ Claude Code ile Geliştirme

Bu projeyi Claude Code ile açarak şunları söyleyebilirsin:

- "Yeni bir branş ekle: Ortopedi"
- "Quiz sonuçlarını Supabase'e kaydet"
- "Push notification ile günlük hatırlatma ekle"
- "Flashcard modu yap"
- "Premium abonelik ekle"
