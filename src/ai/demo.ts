/**
 * Canned responses used when no AI proxy is configured, so every flow can be
 * tried end to end. Clearly labelled as demo content in the UI.
 */

import type { AiContext, AiInput, AiOutput, AiTask, Scenario } from './contract';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const clip = (text: string, n = 60) => (text.length > n ? `${text.slice(0, n - 1).trim()}…` : text);

const copy = {
  en: {
    clarify: (p: string) => ({
      summary: `You're weighing: “${clip(p)}”`,
      questions: [
        'If this went perfectly, what would be different in your life a year from now?',
        'What would you lose if you decided not to act at all?',
      ],
    }),
    assumptions: [
      { text: 'This decision is all-or-nothing.', why: 'Many choices can be tested in small, reversible steps first.' },
      { text: 'Your current situation will stay stable if you do nothing.', why: 'Doing nothing is also a bet on the future.' },
      { text: 'Other people will react the way you expect.', why: 'You may be predicting their reaction without asking.' },
    ],
    reframes: [
      { title: 'A learning problem', text: 'What is the cheapest way to learn whether this is right for you?' },
      { title: 'A timing problem', text: 'Not “whether”, but “when and under which conditions”.' },
      { title: 'An identity problem', text: 'Which version of you do you want to practise being?' },
    ],
    provocation: 'If a friend described this exact situation to you, what would you tell them to try first?',
    opportunities: ['Learn fast from a real-world signal', 'Build confidence through a small win', 'Discover options you can’t see yet'],
    risks: ['Spending time on the wrong question', 'Overcommitting before you have evidence', 'Avoiding the decision by over-planning'],
    experiments: [
      { title: 'Talk to two people who’ve done it', how: 'Ask what surprised them most and what they’d do differently.', timebox: '48 hours' },
      { title: 'Run a weekend version', how: 'Spend one weekend living the decision on a tiny scale.', timebox: 'This weekend' },
      { title: 'Write the failure story', how: 'Imagine it failed in a year. Write why in 10 lines, then fix the top reason.', timebox: '20 minutes' },
    ],
    scenarios: (goal: string, horizon: string): Scenario[] => [
      {
        kind: 'tailwind',
        title: 'Momentum builds',
        timeline: [
          { when: 'Month 1', event: `You start “${clip(goal, 40)}” and find a rhythm faster than expected.` },
          { when: 'Midway', event: 'A small early result earns you attention from someone useful.' },
          { when: horizon, event: 'You have options you didn’t have before — and a new decision to make.' },
        ],
        decision: { prompt: 'Someone offers you a bigger opportunity before you feel ready.', options: ['Take it now', 'Ask for a smaller trial', 'Decline and keep building'] },
      },
      {
        kind: 'obstacle',
        title: 'Life gets in the way',
        timeline: [
          { when: 'Month 1', event: 'You begin well, but your energy is lower than planned.' },
          { when: 'Midway', event: 'An unexpected demand eats most of your time for weeks.' },
          { when: horizon, event: 'You’ve made half the progress you hoped — and learned what really slows you down.' },
        ],
        decision: { prompt: 'You’re behind plan and motivation is dropping.', options: ['Cut the goal in half', 'Find a partner to keep you accountable', 'Pause and restart later'] },
      },
      {
        kind: 'pivot',
        title: 'A different path appears',
        timeline: [
          { when: 'Month 1', event: 'While pursuing the goal you notice a related problem nobody is solving.' },
          { when: 'Midway', event: 'The side path starts to feel more alive than the original plan.' },
          { when: horizon, event: 'Your goal has changed shape — for better or worse.' },
        ],
        decision: { prompt: 'The side path is promising but uncertain.', options: ['Switch fully', 'Split your time', 'Stay on the original plan'] },
      },
    ],
    step: (stage: 1 | 2, choice: string) =>
      stage === 1
        ? {
            narrative: `You chose: “${clip(choice, 50)}”. For a few weeks it seems to work.`,
            twist: 'Then you learn something new: the thing you assumed was scarce (time, money or support) is actually more available than you thought — but only if you ask for it.',
            decision: { prompt: 'How do you use this new information?', options: ['Ask for help openly', 'Keep going alone', 'Rethink the goal itself'] },
            insight: '',
            keyAssumption: '',
          }
        : {
            narrative: `You chose: “${clip(choice, 50)}”. The story settles into a new shape.`,
            twist: '',
            decision: null,
            insight: 'The turning points in this future came from choices about support and pacing — not from talent.',
            keyAssumption: 'That you have to do this alone and at full speed.',
          },
    feedback: {
      feedback: 'Good start. Your first ideas stay close to the obvious — that’s normal.',
      pushFurther: 'Now write one idea that would seem absurd to a sensible person, then find one useful piece inside it.',
    },
  },
  tr: {
    clarify: (p: string) => ({
      summary: `Tarttığın konu: “${clip(p)}”`,
      questions: [
        'Bu mükemmel giderse, bir yıl sonra hayatında ne farklı olurdu?',
        'Hiç harekete geçmemeye karar verirsen ne kaybederdin?',
      ],
    }),
    assumptions: [
      { text: 'Bu karar ya hep ya hiç.', why: 'Birçok seçim önce küçük ve geri alınabilir adımlarla denenebilir.' },
      { text: 'Hiçbir şey yapmazsan mevcut durumun aynı kalır.', why: 'Hiçbir şey yapmamak da gelecek üzerine bir bahistir.' },
      { text: 'Diğer insanlar beklediğin gibi tepki verecek.', why: 'Onlara sormadan tepkilerini tahmin ediyor olabilirsin.' },
    ],
    reframes: [
      { title: 'Bir öğrenme problemi', text: 'Bunun sana uygun olup olmadığını öğrenmenin en ucuz yolu ne?' },
      { title: 'Bir zamanlama problemi', text: '“Yapmalı mıyım” değil, “ne zaman ve hangi koşullarda”.' },
      { title: 'Bir kimlik problemi', text: 'Kendinin hangi versiyonu olmayı pratik etmek istiyorsun?' },
    ],
    provocation: 'Bir arkadaşın sana tam olarak bu durumu anlatsa, önce neyi denemesini söylerdin?',
    opportunities: ['Gerçek bir sinyalden hızla öğrenmek', 'Küçük bir kazanımla özgüven kazanmak', 'Henüz göremediğin seçenekleri keşfetmek'],
    risks: ['Yanlış soruya zaman harcamak', 'Kanıt olmadan fazla bağlanmak', 'Fazla planlayarak kararı ertelemek'],
    experiments: [
      { title: 'Bunu yapmış iki kişiyle konuş', how: 'Onları en çok neyin şaşırttığını ve neyi farklı yapacaklarını sor.', timebox: '48 saat' },
      { title: 'Hafta sonu versiyonunu dene', how: 'Bir hafta sonunu kararı küçük ölçekte yaşayarak geçir.', timebox: 'Bu hafta sonu' },
      { title: 'Başarısızlık hikâyesini yaz', how: 'Bir yıl sonra başarısız olduğunu hayal et. Nedenini 10 satırda yaz, en büyük nedeni düzelt.', timebox: '20 dakika' },
    ],
    scenarios: (goal: string, horizon: string): Scenario[] => [
      {
        kind: 'tailwind',
        title: 'İvme kazanıyorsun',
        timeline: [
          { when: '1. ay', event: `“${clip(goal, 40)}” işine başlıyorsun ve beklediğinden hızlı bir ritim buluyorsun.` },
          { when: 'Yarı yol', event: 'Küçük bir erken sonuç, işine yarayacak birinin dikkatini çekiyor.' },
          { when: horizon, event: 'Daha önce olmayan seçeneklerin var — ve verilecek yeni bir karar.' },
        ],
        decision: { prompt: 'Biri sana hazır hissetmeden önce daha büyük bir fırsat sunuyor.', options: ['Hemen kabul et', 'Daha küçük bir deneme iste', 'Reddet ve inşa etmeye devam et'] },
      },
      {
        kind: 'obstacle',
        title: 'Hayat araya giriyor',
        timeline: [
          { when: '1. ay', event: 'İyi başlıyorsun ama enerjin planladığından düşük.' },
          { when: 'Yarı yol', event: 'Beklenmedik bir yük haftalarca zamanının çoğunu alıyor.' },
          { when: horizon, event: 'Umduğun ilerlemenin yarısını yaptın — ve seni asıl neyin yavaşlattığını öğrendin.' },
        ],
        decision: { prompt: 'Planın gerisindesin ve motivasyon düşüyor.', options: ['Hedefi yarıya indir', 'Seni takip edecek bir ortak bul', 'Ara ver, sonra yeniden başla'] },
      },
      {
        kind: 'pivot',
        title: 'Farklı bir yol beliriyor',
        timeline: [
          { when: '1. ay', event: 'Hedefin peşindeyken kimsenin çözmediği bağlantılı bir sorun fark ediyorsun.' },
          { when: 'Yarı yol', event: 'Yan yol, asıl plandan daha canlı hissettirmeye başlıyor.' },
          { when: horizon, event: 'Hedefin şekil değiştirdi — iyi ya da kötü yönde.' },
        ],
        decision: { prompt: 'Yan yol umut verici ama belirsiz.', options: ['Tamamen geç', 'Zamanını böl', 'Asıl planda kal'] },
      },
    ],
    step: (stage: 1 | 2, choice: string) =>
      stage === 1
        ? {
            narrative: `Seçimin: “${clip(choice, 50)}”. Birkaç hafta boyunca işe yarıyor gibi.`,
            twist: 'Sonra yeni bir şey öğreniyorsun: kıt sandığın şey (zaman, para ya da destek) aslında düşündüğünden daha erişilebilir — ama sadece istersen.',
            decision: { prompt: 'Bu yeni bilgiyi nasıl kullanırsın?', options: ['Açıkça yardım iste', 'Tek başına devam et', 'Hedefin kendisini yeniden düşün'] },
            insight: '',
            keyAssumption: '',
          }
        : {
            narrative: `Seçimin: “${clip(choice, 50)}”. Hikâye yeni bir biçime oturuyor.`,
            twist: '',
            decision: null,
            insight: 'Bu gelecekteki dönüm noktaları yetenekten değil, destek ve tempo ile ilgili seçimlerden geldi.',
            keyAssumption: 'Bunu tek başına ve tam hızla yapmak zorunda olduğun.',
          },
    feedback: {
      feedback: 'İyi başlangıç. İlk fikirlerin bariz olana yakın duruyor — bu normal.',
      pushFurther: 'Şimdi mantıklı birine saçma gelecek bir fikir yaz, sonra içinde işe yarar bir parça bul.',
    },
  },
};

export async function demoRespond<T extends AiTask>(
  task: T,
  input: AiInput<T>,
  context: AiContext,
): Promise<AiOutput<T>> {
  await wait(700);
  const c = copy[context.lang];
  const i = input as Record<string, unknown>;
  const out: Record<AiTask, () => unknown> = {
    'lab.clarify': () => ({ crisis: false, ...c.clarify(String(i.problem)) }),
    'lab.assumptions': () => ({ crisis: false, assumptions: c.assumptions }),
    'lab.reframe': () => ({ crisis: false, reframes: c.reframes, provocation: c.provocation }),
    'lab.experiment': () => ({
      crisis: false,
      opportunities: c.opportunities,
      risks: c.risks,
      experiments: c.experiments,
    }),
    'future.scenarios': () => ({
      crisis: false,
      scenarios: c.scenarios(String(i.goal), String(i.horizon)),
    }),
    'future.step': () => {
      const history = i.history as { choice: string }[];
      return { crisis: false, ...c.step(i.stage as 1 | 2, history[history.length - 1]?.choice ?? '') };
    },
    'train.feedback': () => ({ crisis: false, ...c.feedback }),
  };
  return out[task]() as AiOutput<T>;
}
