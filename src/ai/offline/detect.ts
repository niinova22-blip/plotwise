import type { AiLang } from '../contract';

export type Topic =
  | 'career'
  | 'startup'
  | 'money'
  | 'relationship'
  | 'study'
  | 'move'
  | 'health'
  | 'creative'
  | 'general';

/** Lowercase word stems; matched as substrings so Turkish suffixes still hit. */
const TOPIC_STEMS: Record<Exclude<Topic, 'general'>, string[]> = {
  career: [
    'job', 'career', 'boss', 'manager', 'promotion', 'salary', ' quit', 'resign', 'interview', 'colleague', 'office', 'hire',
    'iş ', 'işim', 'işi ', 'işte', 'işten', 'kariyer', 'patron', 'müdür', 'yönetici', 'terfi', 'maaş', 'istifa', 'mülakat', 'görüşme', 'mesai', 'ofis', 'çalıştığım',
  ],
  startup: [
    'startup', 'company', 'business', 'founder', 'customer', 'product', 'launch', ' app', 'market', 'investor', 'side project',
    'girişim', 'şirket', 'işletme', 'kurucu', 'müşteri', 'ürün', 'uygulama', 'pazar', 'yatırımcı', 'dükkan', 'e-ticaret', 'kendi işim',
  ],
  money: [
    'money', 'debt', 'loan', 'invest', 'saving', 'budget', ' rent', 'mortgage', 'afford', 'expensive',
    'para', 'borç', 'kredi', 'yatırım', 'birikim', 'bütçe', 'kira', 'pahalı', 'maddi', 'harcama',
  ],
  relationship: [
    'partner', 'girlfriend', 'boyfriend', 'wife', 'husband', 'marriage', 'friend', 'family', 'parents', 'breakup', ' dating', 'relationship',
    'sevgili', 'eşim', 'evlilik', 'evlen', 'arkadaş', 'aile', 'annem', 'babam', 'ayrıl', 'ilişki', 'flört', 'kardeş',
  ],
  study: [
    'school', 'university', 'college', 'exam', 'degree', 'master', 'phd', 'course', 'study', 'learn', 'major', 'bootcamp',
    'okul', 'üniversite', 'sınav', 'bölüm', 'yüksek lisans', 'doktora', 'kurs', 'ders', 'öğren', 'yks', 'kpss', 'ales', 'diploma',
  ],
  move: [
    'move', 'moving', 'abroad', 'city', 'country', 'relocate', 'visa', 'emigrate',
    'taşın', 'şehir', 'yurtdışı', 'yurt dışı', 'ülke', 'göç', 'vize', 'memleket',
  ],
  health: [
    'health', 'sleep', 'exercise', 'gym', 'weight', 'diet', 'tired', 'stress', 'habit', 'energy',
    'sağlık', 'uyku', 'spor', 'kilo', 'diyet', 'yorgun', 'stres', 'alışkanlık', 'enerji', 'egzersiz',
  ],
  creative: [
    'write', 'writing', 'book', 'novel', ' art ', 'music', 'song', 'paint', 'design', 'film', 'youtube', 'content', 'creative',
    ' yazı', ' yazar', ' yazmak', 'kitap', 'roman', 'sanat', 'müzik', 'şarkı', 'resim', 'tasarım', 'içerik', 'yaratıcı', 'hikâye', 'hikaye',
  ],
};

export function lower(text: string, lang: AiLang) {
  return ` ${text.toLocaleLowerCase(lang === 'tr' ? 'tr-TR' : 'en-US')} `;
}

/** Picks the topic with the most stem hits; ties keep the earlier topic. */
export function detectTopic(text: string, lang: AiLang): Topic {
  const t = lower(text, lang);
  let best: Topic = 'general';
  let bestHits = 0;
  for (const [topic, stems] of Object.entries(TOPIC_STEMS) as [Topic, string[]][]) {
    const hits = stems.filter((stem) => t.includes(stem)).length;
    if (hits > bestHits) {
      best = topic;
      bestHits = hits;
    }
  }
  return best;
}

const CRISIS_PHRASES = [
  'suicide', 'suicidal', 'kill myself', 'end my life', 'want to die', 'self-harm', 'self harm', 'hurt myself', 'no reason to live',
  'intihar', 'kendimi öldür', 'canıma kıy', 'ölmek istiyorum', 'yaşamak istemiyorum', 'kendime zarar', 'hayatıma son', 'yaşamanın anlamı yok',
];

/** Conservative phrase match; the AI path does this with the model instead. */
export function looksLikeCrisis(text: string): boolean {
  const t = lower(text, 'tr') + lower(text, 'en');
  return CRISIS_PHRASES.some((p) => t.includes(p));
}

/** Small deterministic hash so the same input gives the same picks. */
export function seedOf(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Picks `n` distinct items starting at a seed-dependent offset. */
export function pick<T>(items: T[], n: number, seed: number): T[] {
  if (items.length <= n) return items.slice();
  const start = seed % items.length;
  return Array.from({ length: n }, (_, i) => items[(start + i) % items.length]);
}

export const clip = (text: string, n = 60) => {
  const flat = text.replace(/\s+/g, ' ').trim();
  return flat.length > n ? `${flat.slice(0, n - 1).trim()}…` : flat;
};
