/**
 * Original exercise templates. Placeholders in {braces} are filled from the
 * pools below, so a few dozen templates yield thousands of distinct prompts.
 */

import type { Lang } from '@/i18n';
import type { ExerciseType, Goal } from '@/store/types';

type Bi = Record<Lang, string>;

export type Template = {
  id: string;
  type: ExerciseType;
  text: Bi;
  /** Self-check questions shown when no AI feedback is used. */
  check: Bi[];
  goals?: Goal[];
};

export type Pools = Record<string, Bi[]>;

export const POOLS: Pools = {
  situation: [
    { en: 'a small café that is losing customers to a chain next door', tr: 'yanındaki zincir yüzünden müşteri kaybeden küçük bir kafe' },
    { en: 'a team that keeps missing deadlines', tr: 'sürekli teslim tarihlerini kaçıran bir ekip' },
    { en: 'a city library that almost nobody under 30 visits', tr: '30 yaş altında neredeyse kimsenin gitmediği bir şehir kütüphanesi' },
    { en: 'a freelancer whose biggest client just left', tr: 'en büyük müşterisi az önce ayrılan bir serbest çalışan' },
    { en: 'a student who must choose a major this month', tr: 'bu ay bölüm seçmek zorunda olan bir öğrenci' },
    { en: 'a startup whose app gets downloads but no repeat use', tr: 'uygulaması indiriliyor ama tekrar kullanılmayan bir girişim' },
    { en: 'a family deciding whether to move to another city', tr: 'başka bir şehre taşınıp taşınmamaya karar veren bir aile' },
    { en: 'a hospital emergency room with long waiting times', tr: 'bekleme süreleri uzun bir hastane acil servisi' },
    { en: 'a musician whose videos stopped getting views', tr: 'videoları artık izlenmeyen bir müzisyen' },
    { en: 'a manager who has to cut the budget by 20%', tr: 'bütçeyi %20 kesmek zorunda olan bir yönetici' },
    { en: 'a neighbourhood with no place for teenagers to meet', tr: 'gençlerin buluşabileceği hiçbir yeri olmayan bir mahalle' },
    { en: 'an online course that 90% of people never finish', tr: 'insanların %90’ının hiç bitirmediği bir online kurs' },
  ],
  concept: [
    { en: 'a hospital', tr: 'hastane' },
    { en: 'a board game', tr: 'masa oyunu' },
    { en: 'waiting time', tr: 'bekleme süresi' },
    { en: 'a beehive', tr: 'arı kovanı' },
    { en: 'a public library', tr: 'halk kütüphanesi' },
    { en: 'a night market', tr: 'gece pazarı' },
    { en: 'a fitness tracker', tr: 'fitness bilekliği' },
    { en: 'a ferry', tr: 'vapur' },
    { en: 'grandparents', tr: 'büyükanne ve büyükbabalar' },
    { en: 'a recipe', tr: 'yemek tarifi' },
    { en: 'a lost-and-found box', tr: 'kayıp eşya kutusu' },
    { en: 'a weather forecast', tr: 'hava durumu' },
    { en: 'a theatre rehearsal', tr: 'tiyatro provası' },
    { en: 'a parking lot', tr: 'otopark' },
    { en: 'a choir', tr: 'koro' },
    { en: 'a vending machine', tr: 'otomat' },
    { en: 'a ship’s log', tr: 'gemi seyir defteri' },
    { en: 'a museum', tr: 'müze' },
    { en: 'an orchestra conductor', tr: 'orkestra şefi' },
    { en: 'a pharmacy', tr: 'eczane' },
  ],
  character: [
    { en: 'a ship captain', tr: 'bir gemi kaptanı' },
    { en: 'a 9-year-old child', tr: '9 yaşında bir çocuk' },
    { en: 'a detective', tr: 'bir dedektif' },
    { en: 'a farmer', tr: 'bir çiftçi' },
    { en: 'a stand-up comedian', tr: 'bir stand-up komedyeni' },
    { en: 'an emergency-room nurse', tr: 'bir acil servis hemşiresi' },
    { en: 'a chess grandmaster', tr: 'bir satranç büyükustası' },
    { en: 'a historian in the year 2100', tr: '2100 yılındaki bir tarihçi' },
    { en: 'your harshest competitor', tr: 'en sert rakibin' },
    { en: 'a mountain guide', tr: 'bir dağ rehberi' },
    { en: 'a street vendor', tr: 'bir seyyar satıcı' },
    { en: 'a novelist', tr: 'bir romancı' },
  ],
  failure: [
    { en: 'a product launch that nobody noticed', tr: 'kimsenin fark etmediği bir ürün lansmanı' },
    { en: 'a job interview that went badly', tr: 'kötü geçen bir iş görüşmesi' },
    { en: 'a presentation where the audience looked bored', tr: 'dinleyicilerin sıkıldığı bir sunum' },
    { en: 'a side project abandoned after two weeks', tr: 'iki hafta sonra bırakılan bir yan proje' },
    { en: 'an exam you studied hard for and still failed', tr: 'çok çalışıp yine de geçemediğin bir sınav' },
    { en: 'a restaurant that closed after six months', tr: 'altı ay sonra kapanan bir restoran' },
    { en: 'a fundraising campaign that reached 15% of its goal', tr: 'hedefinin %15’ine ulaşan bir bağış kampanyası' },
    { en: 'a new habit you dropped on day four', tr: 'dördüncü gün bıraktığın yeni bir alışkanlık' },
  ],
  belief: [
    { en: 'Customers choose mainly on price.', tr: 'Müşteriler esas olarak fiyata göre seçer.' },
    { en: 'More features make a product better.', tr: 'Daha fazla özellik ürünü daha iyi yapar.' },
    { en: 'Experience matters more than curiosity.', tr: 'Deneyim meraktan daha önemlidir.' },
    { en: 'You need a plan before you start.', tr: 'Başlamadan önce bir plana ihtiyacın var.' },
    { en: 'Working longer hours means getting more done.', tr: 'Daha uzun çalışmak daha çok iş çıkarmak demektir.' },
    { en: 'People resist change.', tr: 'İnsanlar değişime direnir.' },
    { en: 'Talent is mostly fixed.', tr: 'Yetenek çoğunlukla sabittir.' },
    { en: 'The best idea wins.', tr: 'En iyi fikir kazanır.' },
    { en: 'Remote teams can’t build strong culture.', tr: 'Uzaktan çalışan ekipler güçlü bir kültür kuramaz.' },
    { en: 'Older people don’t adopt new technology.', tr: 'Yaşlı insanlar yeni teknolojiyi benimsemez.' },
  ],
  dilemma: [
    { en: 'Two job offers: one pays 30% more at an unstable company, the other pays less but you’d learn far more.', tr: 'İki iş teklifi: biri dengesiz bir şirkette %30 daha fazla ödüyor, diğeri daha az ödüyor ama çok daha fazla öğreneceksin.' },
    { en: 'Your product can launch next week with a known flaw, or in two months polished.', tr: 'Ürünün bilinen bir kusurla gelecek hafta ya da cilalanmış hâlde iki ay sonra çıkabilir.' },
    { en: 'A friend asks you to co-found a company. You know their idea, not their work habits.', tr: 'Bir arkadaşın birlikte şirket kurmayı teklif ediyor. Fikrini biliyorsun ama çalışma alışkanlıklarını bilmiyorsun.' },
    { en: 'You can hire a brilliant but difficult expert, or a reliable generalist.', tr: 'Parlak ama zor bir uzmanı ya da güvenilir bir genelciyi işe alabilirsin.' },
    { en: 'An investor offers money today if you change your target customer.', tr: 'Bir yatırımcı hedef müşterini değiştirirsen bugün para vermeyi teklif ediyor.' },
    { en: 'You can move abroad for a role you’d love, but your partner’s career would pause.', tr: 'Seveceğin bir rol için yurt dışına taşınabilirsin ama partnerinin kariyeri duraklar.' },
    { en: 'A big client wants a custom feature that only they would use.', tr: 'Büyük bir müşteri yalnızca kendisinin kullanacağı özel bir özellik istiyor.' },
  ],
  goal: [
    { en: 'learning a new language in a year', tr: 'bir yılda yeni bir dil öğrenmek' },
    { en: 'switching careers into tech', tr: 'teknolojiye kariyer değiştirmek' },
    { en: 'opening a small neighbourhood shop', tr: 'küçük bir mahalle dükkânı açmak' },
    { en: 'writing a book', tr: 'bir kitap yazmak' },
    { en: 'running a marathon', tr: 'maraton koşmak' },
    { en: 'building an audience online', tr: 'internette bir kitle oluşturmak' },
    { en: 'saving enough to take a year off', tr: 'bir yıl ara verecek kadar para biriktirmek' },
    { en: 'starting a community project', tr: 'bir topluluk projesi başlatmak' },
  ],
};

const self = {
  count: { en: 'Did you write at least three different options?', tr: 'En az üç farklı seçenek yazdın mı?' },
  odd: { en: 'Is at least one idea surprising — even to you?', tr: 'En az bir fikir şaşırtıcı mı — sana bile?' },
  test: { en: 'Could you test one of them cheaply this week?', tr: 'Birini bu hafta ucuza test edebilir misin?' },
  why: { en: 'Did you write *why*, not just *what*?', tr: 'Sadece *ne* değil, *neden* de yazdın mı?' },
  change: { en: 'What new information would change your mind?', tr: 'Hangi yeni bilgi fikrini değiştirirdi?' },
  view: { en: 'Did you see something you couldn’t see from your own seat?', tr: 'Kendi yerinden göremediğin bir şey gördün mü?' },
};

export const TEMPLATES: Template[] = [
  // Alternative futures
  { id: 'fut-1', type: 'futures', text: { en: 'Imagine {goal}. Write three very different versions of how it looks one year later: one great, one messy, one surprising.', tr: '{goal} hedefini düşün. Bir yıl sonrasının çok farklı üç versiyonunu yaz: biri harika, biri karmaşık, biri şaşırtıcı.' }, check: [self.count, self.odd, self.why] },
  { id: 'fut-2', type: 'futures', text: { en: 'Take {situation}. Describe the situation five years from now if nothing changes — then if one small thing changes tomorrow.', tr: '{situation} durumunu ele al. Hiçbir şey değişmezse beş yıl sonra nasıl olur, yaz — sonra yarın küçük bir şey değişirse.' }, check: [self.why, self.change] },
  { id: 'fut-3', type: 'futures', text: { en: 'Picture yourself pursuing {goal}. What’s the first unexpected event that could change everything? Write three possible ones.', tr: '{goal} peşinde olduğunu hayal et. Her şeyi değiştirebilecek ilk beklenmedik olay ne olabilir? Üç olasılık yaz.' }, check: [self.count, self.odd] },
  { id: 'fut-4', type: 'futures', text: { en: 'Write a short newspaper headline from 2030 about {situation}. Then write two competing headlines that tell a different story.', tr: '{situation} hakkında 2030’dan kısa bir gazete manşeti yaz. Sonra farklı bir hikâye anlatan iki rakip manşet yaz.' }, check: [self.count, self.odd] },
  { id: 'fut-5', type: 'futures', text: { en: 'Think of a decision you’re facing. Describe the version of you who chose differently, one year from now. What do they know that you don’t?', tr: 'Önündeki bir kararı düşün. Bir yıl sonra farklı seçen hâlini anlat. Senin bilmediğin neyi biliyor?' }, check: [self.view, self.change], goals: ['personal', 'career'] },

  // Invert the problem
  { id: 'inv-1', type: 'invert', text: { en: 'Instead of fixing {situation}, list five ways to make it dramatically worse. Then flip each into a solution.', tr: '{situation} durumunu düzeltmek yerine onu çok daha kötü yapmanın beş yolunu listele. Sonra her birini bir çözüme çevir.' }, check: [self.count, self.test] },
  { id: 'inv-2', type: 'invert', text: { en: 'Your goal is {goal}. What would guarantee failure? Write the recipe for failure, then the opposite of each step.', tr: 'Hedefin {goal}. Başarısızlığı ne garanti ederdi? Başarısızlığın tarifini yaz, sonra her adımın tersini.' }, check: [self.count, self.why] },
  { id: 'inv-3', type: 'invert', text: { en: 'Who would benefit if {situation} never improved? What does that tell you about why it persists?', tr: '{situation} hiç düzelmezse kim fayda sağlardı? Bu, neden sürdüğü hakkında sana ne söylüyor?' }, check: [self.view, self.why] },
  { id: 'inv-4', type: 'invert', text: { en: 'Instead of adding something to solve {situation}, what could you remove?', tr: '{situation} durumunu çözmek için bir şey eklemek yerine neyi çıkarabilirsin?' }, check: [self.count, self.test] },
  { id: 'inv-5', type: 'invert', text: { en: 'Pretend the problem in {situation} is actually a hidden advantage. Make the strongest case you can.', tr: '{situation} içindeki sorunun aslında gizli bir avantaj olduğunu varsay. Yapabileceğin en güçlü savunmayı yaz.' }, check: [self.odd, self.why] },

  // Unexpected connections (Creativity Engine)
  { id: 'con-1', type: 'connect', text: { en: '{concept} + {concept2} + {concept3}. Invent a product, service or event that combines all three.', tr: '{concept} + {concept2} + {concept3}. Üçünü birleştiren bir ürün, hizmet ya da etkinlik icat et.' }, check: [self.count, self.odd, self.test] },
  { id: 'con-2', type: 'connect', text: { en: 'How would {concept} solve {situation}? Borrow at least two of its rules or habits.', tr: '{concept}, {situation} sorununu nasıl çözerdi? En az iki kuralını ya da alışkanlığını ödünç al.' }, check: [self.count, self.odd] },
  { id: 'con-3', type: 'connect', text: { en: 'Find three things {concept} and {concept2} secretly have in common. Turn the strangest one into an idea.', tr: '{concept} ile {concept2} arasındaki üç gizli ortak noktayı bul. En tuhafını bir fikre dönüştür.' }, check: [self.count, self.odd] },
  { id: 'con-4', type: 'connect', text: { en: 'Redesign {concept} as if it were run by {character}. What changes first?', tr: '{concept} sanki {character} tarafından yönetiliyormuş gibi yeniden tasarla. İlk ne değişir?' }, check: [self.odd, self.view] },
  { id: 'con-5', type: 'connect', text: { en: 'Take the best idea from {concept} and transplant it into {situation}. What would it look like on day one?', tr: '{concept} içindeki en iyi fikri al ve {situation} durumuna naklet. İlk gün nasıl görünürdü?' }, check: [self.test, self.why] },
  { id: 'con-6', type: 'connect', text: { en: 'Combine {concept} with {concept2} to make waiting, queuing or boredom enjoyable somewhere.', tr: 'Bir yerde beklemeyi, sırayı ya da sıkıntıyı keyifli yapmak için {concept} ile {concept2} öğelerini birleştir.' }, check: [self.count, self.odd], goals: ['creativity', 'startup'] },

  // Through other eyes
  { id: 'per-1', type: 'perspectives', text: { en: 'Describe {situation} as {character} would. What do they notice that everyone else misses?', tr: '{situation} durumunu {character} gözüyle anlat. Herkesin kaçırdığı neyi fark eder?' }, check: [self.view, self.why] },
  { id: 'per-2', type: 'perspectives', text: { en: 'Tell the story of {situation} three times: from the person causing it, the person suffering it, and a bystander.', tr: '{situation} hikâyesini üç kez anlat: soruna yol açan kişiden, ondan etkilenen kişiden ve bir izleyiciden.' }, check: [self.count, self.view] },
  { id: 'per-3', type: 'perspectives', text: { en: 'What advice would {character} and {character2} give about {goal}? Where do they disagree?', tr: '{character} ve {character2}, {goal} hakkında ne tavsiye ederdi? Nerede ayrışıyorlar?' }, check: [self.view, self.why] },
  { id: 'per-4', type: 'perspectives', text: { en: 'Think of someone who disagrees with you about something important. Write their view so well they’d sign it.', tr: 'Önemli bir konuda seninle aynı fikirde olmayan birini düşün. Onun görüşünü, altına imza atacağı kadar iyi yaz.' }, check: [self.view, self.change] },
  { id: 'per-5', type: 'perspectives', text: { en: 'You are {character} hired to fix {situation}. Write your first three moves.', tr: '{situation} durumunu düzeltmek için işe alınan {character} sensin. İlk üç hamleni yaz.' }, check: [self.count, self.test] },

  // Decide with missing information
  { id: 'par-1', type: 'partial', text: { en: '{dilemma} You can ask only ONE question before deciding. What do you ask, and why?', tr: '{dilemma} Karar vermeden önce yalnızca TEK bir soru sorabilirsin. Ne sorarsın, neden?' }, check: [self.why, self.change] },
  { id: 'par-2', type: 'partial', text: { en: '{dilemma} Decide now in one sentence. Then write what signal in the next month would make you reverse it.', tr: '{dilemma} Şimdi tek cümleyle karar ver. Sonra önümüzdeki ay hangi sinyalin kararını tersine çevireceğini yaz.' }, check: [self.why, self.change] },
  { id: 'par-3', type: 'partial', text: { en: '{dilemma} Is there a third option that isn’t on the table? Invent two.', tr: '{dilemma} Masada olmayan üçüncü bir seçenek var mı? İki tane icat et.' }, check: [self.count, self.odd] },
  { id: 'par-4', type: 'partial', text: { en: '{dilemma} Which choice is easier to undo? How much should that matter here?', tr: '{dilemma} Hangi seçimin geri alınması daha kolay? Bu, burada ne kadar önemli olmalı?' }, check: [self.why, self.test] },
  { id: 'par-5', type: 'partial', text: { en: '{dilemma} What is your gut saying? Now write the best argument against your gut.', tr: '{dilemma} İçgüdün ne diyor? Şimdi içgüdüne karşı en iyi argümanı yaz.' }, check: [self.why, self.change] },

  // Failure to opportunity
  { id: 'fai-1', type: 'failure', text: { en: 'Picture {failure}. List three things it revealed that success would have hidden.', tr: '{failure} düşün. Başarının gizleyeceği, onun ortaya çıkardığı üç şeyi listele.' }, check: [self.count, self.why] },
  { id: 'fai-2', type: 'failure', text: { en: 'Turn {failure} into the opening scene of a success story. What happens in scene two?', tr: '{failure} olayını bir başarı hikâyesinin açılış sahnesine dönüştür. İkinci sahnede ne olur?' }, check: [self.odd, self.test] },
  { id: 'fai-3', type: 'failure', text: { en: 'After {failure}, what’s one small asset left over (people, skills, data) that could start something new?', tr: '{failure} sonrasında geriye kalan, yeni bir şey başlatabilecek küçük bir varlık (insanlar, beceriler, veri) ne?' }, check: [self.count, self.test] },
  { id: 'fai-4', type: 'failure', text: { en: 'Recall a real setback of your own. Write what it taught you that no book could.', tr: 'Kendi yaşadığın gerçek bir aksiliği hatırla. Hiçbir kitabın öğretemeyeceği neyi öğrettiğini yaz.' }, check: [self.why, self.view] },
  { id: 'fai-5', type: 'failure', text: { en: '{failure}: write three experiments that would have revealed the problem in week one instead of month six.', tr: '{failure}: sorunu altıncı ay yerine ilk hafta ortaya çıkaracak üç deney yaz.' }, check: [self.count, self.test] },

  // What if I'm wrong?
  { id: 'wro-1', type: 'wrong', text: { en: '“{belief}” Assume this is false. What would you do differently starting tomorrow?', tr: '“{belief}” Bunun yanlış olduğunu varsay. Yarından itibaren neyi farklı yapardın?' }, check: [self.change, self.test] },
  { id: 'wro-2', type: 'wrong', text: { en: '“{belief}” Find two real-world examples where this breaks down.', tr: '“{belief}” Bunun işe yaramadığı iki gerçek örnek bul.' }, check: [self.count, self.why] },
  { id: 'wro-3', type: 'wrong', text: { en: 'Write down a belief you hold strongly about your work. Under what conditions would it be wrong?', tr: 'İşinle ilgili güçlü inandığın bir şeyi yaz. Hangi koşullarda yanlış olurdu?' }, check: [self.change, self.why] },
  { id: 'wro-4', type: 'wrong', text: { en: '“{belief}” If a newcomer ignored this rule completely, what might they discover?', tr: '“{belief}” Yeni gelen biri bu kuralı tamamen görmezden gelseydi, neyi keşfedebilirdi?' }, check: [self.odd, self.view] },
  { id: 'wro-5', type: 'wrong', text: { en: 'Pick a recent decision. Name the assumption it rested on, and one cheap way to check it.', tr: 'Yakın zamanda verdiğin bir kararı seç. Dayandığı varsayımı ve onu kontrol etmenin ucuz bir yolunu yaz.' }, check: [self.why, self.test] },
];
