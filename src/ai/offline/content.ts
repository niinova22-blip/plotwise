/**
 * Original content for the offline thinking engine. Every entry is written for
 * Plotwise; nothing is taken from books or other products.
 */

import type { AiLang, ScenarioKind } from '../contract';
import type { Topic } from './detect';

export type Assumption = { text: string; why: string };
export type Reframe = { title: string; text: string };
export type Experiment = { title: string; how: string; timebox: string };
export type ScenarioDraft = { title: string; events: [string, string, string]; prompt: string; options: string[] };
export type Twist = { twist: string; prompt: string; options: string[] };

type ByTopic<T> = Record<Topic, T[]>;

export type Pack = {
  summary: (problem: string) => string;
  clarify: ByTopic<string>;
  assumptions: ByTopic<Assumption>;
  reframes: Reframe[];
  provocations: string[];
  /** Built from the assumption the user doubted most. */
  provocationFrom: (assumption: string) => string;
  opportunities: string[];
  risks: string[];
  opportunityFrom: (assumption: string) => string;
  riskFrom: (assumption: string) => string;
  experiments: ByTopic<Experiment>;
  experimentFrom: (assumption: string) => Experiment;
  future: {
    /** Three timeline labels per horizon, indexed like `future.horizons` in i18n. */
    labels: [string, string, string][];
    scenarios: Record<ScenarioKind, ((goal: string) => ScenarioDraft)[]>;
    narrative1: ((choice: string) => string)[];
    twists: Twist[];
    narrative2: ((choice: string) => string)[];
    insights: Record<ScenarioKind, string[]>;
    keyAssumptions: Record<ScenarioKind, string[]>;
  };
  train: {
    few: string;
    some: string;
    many: string;
    short: string;
    push: Record<string, string[]>;
  };
};

const en: Pack = {
  summary: (p) => `You're weighing: “${p}”`,
  clarify: {
    general: [
      'If this went perfectly, what would be different a year from now?',
      'What would you lose if you decided not to act at all?',
      'What part of this are you most avoiding thinking about?',
      'Who else is affected by this, and what do they want?',
      'What would make this decision easy?',
      'What have you already tried, and what did it teach you?',
    ],
    career: [
      'What exactly drains you about the current role — the work, the people or the direction?',
      'If you stayed two more years, what would you have that you don’t have now?',
      'Which skill do you want to be paid for in three years?',
    ],
    startup: [
      'Who has this problem badly enough to pay for a fix today?',
      'What is the smallest version you could put in front of a real person this week?',
      'What would you need to see to stop — and to double down?',
    ],
    money: [
      'What number would make this feel safe, and where does that number come from?',
      'Is this about money itself, or about what money would let you do?',
      'What happens in the worst realistic case — and could you live with it?',
    ],
    relationship: [
      'What do you need from this person that you haven’t said out loud?',
      'If they described this situation, how would their story differ from yours?',
      'What would a good outcome look like for both of you?',
    ],
    study: [
      'What do you want to be able to do after this — not just which title to hold?',
      'Is there a cheaper or faster way to test whether you enjoy this field?',
      'Whose expectations are shaping this choice?',
    ],
    move: [
      'What are you moving toward, and what are you moving away from?',
      'What would an ordinary Tuesday look like in the new place?',
      'What could you only do if you stayed?',
    ],
    health: [
      'When did this habit last go well, and what was different then?',
      'What gets in the way on a bad day, specifically?',
      'What is the smallest change you’d still be proud of?',
    ],
    creative: [
      'Who is this for, if not for everyone?',
      'What would you make if nobody would ever see it?',
      'What usually stops you halfway?',
    ],
  },
  assumptions: {
    general: [
      { text: 'This decision is all-or-nothing.', why: 'Most choices can be tried in small, reversible steps first.' },
      { text: 'If you do nothing, things will stay as they are.', why: 'Doing nothing is also a bet on the future.' },
      { text: 'Other people will react the way you expect.', why: 'You may be predicting their reaction without asking.' },
      { text: 'You need more information before you can start.', why: 'Some information only appears once you act.' },
      { text: 'There is one right answer here.', why: 'Several paths might work; the question is which you can commit to.' },
      { text: 'How you feel now is how you’ll feel later.', why: 'Feelings about a choice often change once you’re inside it.' },
      { text: 'You have to figure this out alone.', why: 'Someone may have faced a close version of this already.' },
      { text: 'The obvious obstacle is the real obstacle.', why: 'The loudest problem isn’t always the one that blocks you.' },
    ],
    career: [
      { text: 'A new job will fix what bothers you about this one.', why: 'Some frustrations travel with you to the next role.' },
      { text: 'Your manager knows what you want.', why: 'People rarely guess ambitions that were never said.' },
      { text: 'Leaving would close the door for good.', why: 'Many industries are smaller and more forgiving than they look.' },
    ],
    startup: [
      { text: 'People will want this because you do.', why: 'Your enthusiasm is evidence about you, not the market.' },
      { text: 'You need to quit your job to start.', why: 'Early tests often fit into evenings and weekends.' },
      { text: 'The product has to be finished before anyone sees it.', why: 'Rough versions reveal problems while they’re cheap to fix.' },
    ],
    money: [
      { text: 'More money would remove the stress.', why: 'Stress often comes from uncertainty, not the amount.' },
      { text: 'This expense or risk can’t be reduced.', why: 'Most costs have a smaller, slower or shared version.' },
      { text: 'Everyone else has this figured out.', why: 'Money worries are common and rarely talked about.' },
    ],
    relationship: [
      { text: 'They already know how you feel.', why: 'What feels obvious inside is often invisible outside.' },
      { text: 'Bringing it up will make things worse.', why: 'Unspoken issues tend to grow quietly.' },
      { text: 'Their behaviour means what you think it means.', why: 'The same action can come from very different reasons.' },
    ],
    study: [
      { text: 'This degree or course is the only way in.', why: 'Many fields accept portfolios, projects or experience.' },
      { text: 'Choosing now locks you in forever.', why: 'People change direction after studying more than you’d think.' },
      { text: 'You have to be good at it before you can enjoy it.', why: 'Enjoyment often comes first and skill follows.' },
    ],
    move: [
      { text: 'A new place will feel like a new you.', why: 'Habits and worries usually come along in the suitcase.' },
      { text: 'Staying means standing still.', why: 'You can change a lot without changing your address.' },
      { text: 'You can picture daily life there accurately.', why: 'Holidays and imagination skip the ordinary days.' },
    ],
    health: [
      { text: 'You need more willpower.', why: 'Changing the environment usually beats trying harder.' },
      { text: 'Missing a day means you failed.', why: 'Consistency over weeks matters more than perfect days.' },
      { text: 'You have to change everything at once.', why: 'One small change that sticks often beats a full overhaul.' },
    ],
    creative: [
      { text: 'You need a big idea before you start.', why: 'Ideas often grow out of small, messy starts.' },
      { text: 'If it isn’t original, it isn’t worth making.', why: 'Most good work remixes things that came before.' },
      { text: 'Real creators feel confident.', why: 'Doubt is part of almost every creative process.' },
    ],
  },
  reframes: [
    { title: 'A learning problem', text: 'What is the cheapest way to learn whether this is right for you?' },
    { title: 'A timing problem', text: 'Not “whether”, but “when and under which conditions”.' },
    { title: 'An identity problem', text: 'Which version of you do you want to practise being?' },
    { title: 'A design problem', text: 'If you could redesign the situation instead of choosing inside it, what would you change?' },
    { title: 'A story problem', text: 'In five years, which version of this story would you want to tell?' },
    { title: 'A resource problem', text: 'What would you do if time, money or energy were not the bottleneck — and which one actually is?' },
    { title: 'A conversation problem', text: 'Is there one honest conversation that would make this much smaller?' },
    { title: 'An experiment problem', text: 'What could you try for two weeks and then decide with evidence?' },
    { title: 'A values problem', text: 'Which option fits what you care about most, even if it’s harder?' },
    { title: 'A subtraction problem', text: 'What could you stop doing that would make this easier?' },
  ],
  provocations: [
    'If a friend described this exact situation, what would you tell them to try first?',
    'What would you do if you knew you couldn’t fail — and what is the smallest piece of that?',
    'What would the boldest person you know do here? The most careful?',
    'If you had to decide in the next ten minutes, what would you choose?',
    'What would make this problem disappear entirely, even if it sounds silly?',
    'What would you advise yourself one year from now to have done today?',
    'Which option would you pick if nobody would ever find out?',
    'What is the most interesting mistake you could make here?',
  ],
  provocationFrom: (a) => `Suppose “${a}” is simply false. What becomes possible?`,
  opportunities: [
    'Learn fast from a real-world signal instead of guessing',
    'Build confidence through a small, visible win',
    'Discover options you can’t see from where you are now',
    'Find people who care about the same thing',
    'Turn a vague worry into a concrete question',
    'Practise deciding with incomplete information',
  ],
  risks: [
    'Spending energy on the wrong question',
    'Committing heavily before you have evidence',
    'Avoiding the decision by over-planning',
    'Letting other people’s expectations decide for you',
    'Underestimating how much time this will take',
    'Ignoring the cost of doing nothing',
  ],
  opportunityFrom: (a) => `If “${a}” turns out wrong, a path you dismissed may open up`,
  riskFrom: (a) => `Building the plan on “${a}” without checking it`,
  experiments: {
    general: [
      { title: 'Talk to two people who’ve done it', how: 'Ask what surprised them most and what they’d do differently.', timebox: '48 hours' },
      { title: 'Write the failure story', how: 'Imagine it failed in a year. Write why in 10 lines, then fix the top reason.', timebox: '20 minutes' },
      { title: 'Decide by coin, then check your gut', how: 'Flip a coin for the choice. Notice whether you feel relief or disappointment.', timebox: '5 minutes' },
      { title: 'Do a one-hour version', how: 'Spend one focused hour acting as if you had already decided.', timebox: '1 hour' },
      { title: 'List what you’d stop doing', how: 'Write three things you would give up for this. See if you still want it.', timebox: '15 minutes' },
      { title: 'Ask for one piece of feedback', how: 'Show your plan to one honest person and ask what they would change.', timebox: 'This week' },
    ],
    career: [
      { title: 'Have the career conversation', how: 'Tell your manager one thing you want to grow into and ask what it would take.', timebox: 'This week' },
      { title: 'Shadow the next role', how: 'Ask someone in the role you want for 30 minutes about a typical week.', timebox: '48 hours' },
      { title: 'Apply to one job as research', how: 'Apply to a single role to learn what the market says about you.', timebox: '3 days' },
    ],
    startup: [
      { title: 'Five customer conversations', how: 'Ask five people how they handle the problem today. Don’t pitch — listen.', timebox: 'This week' },
      { title: 'Fake-door test', how: 'Make a one-page description and see how many people ask for it.', timebox: '48 hours' },
      { title: 'Sell it before you build it', how: 'Try to get one person to commit — even a small pre-payment or a firm yes.', timebox: '1 week' },
    ],
    money: [
      { title: 'Track one week of spending', how: 'Write down every expense for seven days, without judging it.', timebox: '7 days' },
      { title: 'Price the worst case', how: 'Write the realistic worst outcome with real numbers. Decide if you can absorb it.', timebox: '30 minutes' },
      { title: 'Ask one person how they did it', how: 'Find someone who made a similar money decision and ask what they learned.', timebox: 'This week' },
    ],
    relationship: [
      { title: 'Say one honest sentence', how: 'Share one clear feeling or need, without blame, and listen to the reply.', timebox: '48 hours' },
      { title: 'Ask, don’t guess', how: 'Ask them how they see the situation before you explain your view.', timebox: 'Next conversation' },
      { title: 'Write their side', how: 'Write the situation from their point of view in 10 lines.', timebox: '15 minutes' },
    ],
    study: [
      { title: 'Take a free first lesson', how: 'Find a free intro class or lecture in the field and notice your energy.', timebox: 'This week' },
      { title: 'Talk to a graduate', how: 'Ask someone who finished this path what they wish they’d known.', timebox: '48 hours' },
      { title: 'Build one tiny project', how: 'Make something small using the skill to see if you enjoy the actual work.', timebox: 'Weekend' },
    ],
    move: [
      { title: 'Live an ordinary day there', how: 'Plan a normal weekday in the new place — commute, groceries, evenings.', timebox: '1 hour of research' },
      { title: 'Talk to someone who moved', how: 'Ask what they miss and what they would never go back to.', timebox: 'This week' },
      { title: 'Change one thing locally', how: 'Try one change you hoped moving would bring, right where you are.', timebox: '2 weeks' },
    ],
    health: [
      { title: 'Shrink the habit', how: 'Make the habit so small it’s impossible to skip — two minutes a day.', timebox: '7 days' },
      { title: 'Change one cue', how: 'Rearrange one thing in your environment that triggers the old habit.', timebox: 'Today' },
      { title: 'Log energy, not effort', how: 'Note your energy three times a day and look for one pattern.', timebox: '5 days' },
    ],
    creative: [
      { title: 'Make a bad first draft', how: 'Create the worst possible version on purpose, then keep one good part.', timebox: '30 minutes' },
      { title: 'Share something unfinished', how: 'Show a rough piece to one person and ask what caught their attention.', timebox: '48 hours' },
      { title: 'Steal a structure', how: 'Take the shape of a work you love and fill it with your own material.', timebox: '1 hour' },
    ],
  },
  experimentFrom: (a) => ({
    title: 'Test your shakiest assumption',
    how: `Find one cheap way to check whether “${a}” is true — ask, try or look it up.`,
    timebox: '48 hours',
  }),
  future: {
    labels: [
      ['Week 2', 'Month 2', 'Month 3'],
      ['Month 1', 'Month 3', 'Month 6'],
      ['Month 2', 'Month 6', 'One year'],
      ['Year 1', 'Year 2', 'Year 3'],
    ],
    scenarios: {
      tailwind: [
        (g) => ({
          title: 'Momentum builds',
          events: [
            `You start “${g}” and find a rhythm faster than expected.`,
            'A small early result earns attention from someone useful.',
            'You have options you didn’t have before — and a new decision to make.',
          ],
          prompt: 'Someone offers you a bigger opportunity before you feel ready.',
          options: ['Take it now', 'Ask for a smaller trial first', 'Decline and keep building'],
        }),
        (g) => ({
          title: 'It clicks',
          events: [
            `The first steps of “${g}” feel easier than you feared.`,
            'You find one person who wants to do this with you.',
            'Progress is real, and expectations — yours and others’ — start to rise.',
          ],
          prompt: 'With things going well, you’re tempted to raise the stakes.',
          options: ['Go bigger', 'Keep the same pace', 'Lock in what you have'],
        }),
      ],
      obstacle: [
        (g) => ({
          title: 'Life gets in the way',
          events: [
            `You begin “${g}” well, but your energy is lower than planned.`,
            'An unexpected demand eats most of your time for weeks.',
            'You’ve made half the progress you hoped — and learned what really slows you down.',
          ],
          prompt: 'You’re behind plan and motivation is dropping.',
          options: ['Cut the goal in half', 'Find someone to keep you accountable', 'Pause and restart later'],
        }),
        (g) => ({
          title: 'The plan hits a wall',
          events: [
            `Early on, “${g}” runs into a problem you didn’t see coming.`,
            'A key resource — money, time or a person — becomes unavailable.',
            'You still care about the goal, but the original plan no longer works.',
          ],
          prompt: 'The wall is real. What do you do with it?',
          options: ['Push through it', 'Find a way around', 'Ask for help'],
        }),
      ],
      pivot: [
        (g) => ({
          title: 'A different path appears',
          events: [
            `While pursuing “${g}”, you notice a related problem nobody is solving.`,
            'The side path starts to feel more alive than the original plan.',
            'Your goal has changed shape — for better or worse.',
          ],
          prompt: 'The side path is promising but uncertain.',
          options: ['Switch fully', 'Split your time', 'Stay on the original plan'],
        }),
        (g) => ({
          title: 'You want something else',
          events: [
            `Halfway into “${g}”, you realise the part you enjoy isn’t the part you planned.`,
            'A conversation shows you a version of the goal you hadn’t considered.',
            'You’re standing at a fork you didn’t know existed.',
          ],
          prompt: 'What you want has shifted.',
          options: ['Follow the new interest', 'Finish what you started first', 'Combine the two'],
        }),
      ],
    },
    narrative1: [
      (c) => `You chose: “${c}”. For a few weeks it seems to work.`,
      (c) => `You chose: “${c}”. It costs more effort than you expected, but things move.`,
      (c) => `You chose: “${c}”. Some people are surprised by it; you feel oddly calm.`,
    ],
    twists: [
      {
        twist: 'You learn that the thing you assumed was scarce — time, money or support — is more available than you thought, but only if you ask.',
        prompt: 'How do you use this new information?',
        options: ['Ask for help openly', 'Keep going alone', 'Rethink the goal itself'],
      },
      {
        twist: 'Someone you trust tells you, kindly, that they think you’re heading the wrong way.',
        prompt: 'How do you respond?',
        options: ['Ask them to explain', 'Thank them and continue', 'Pause and reconsider'],
      },
      {
        twist: 'An outside change — a new rule, a market shift, a life event — moves the ground under your plan.',
        prompt: 'The context has changed. What now?',
        options: ['Adapt the plan', 'Wait for things to settle', 'Use the change as an opening'],
      },
      {
        twist: 'You discover you’ve been measuring progress with the wrong number.',
        prompt: 'What do you start paying attention to instead?',
        options: ['How it feels day to day', 'What other people notice', 'What you’ve learned'],
      },
      {
        twist: 'A second option appears that is safer but smaller.',
        prompt: 'Do you take the safer path?',
        options: ['Take the safe option', 'Keep the bigger bet', 'Try to do both for a while'],
      },
      {
        twist: 'You realise the hardest part isn’t the work — it’s what you’ll have to stop doing.',
        prompt: 'What are you willing to give up?',
        options: ['Something comfortable', 'Some free time', 'Nothing yet — find another way'],
      },
    ],
    narrative2: [
      (c) => `You chose: “${c}”. The story settles into a new shape.`,
      (c) => `You chose: “${c}”. Not everything works, but you understand why.`,
      (c) => `You chose: “${c}”. Looking back, this was the real turning point.`,
    ],
    insights: {
      tailwind: [
        'Good news brought its own decisions — success needs a plan too.',
        'The turning points came from how you handled momentum, not from luck.',
        'Saying yes and saying not yet were both real choices here.',
      ],
      obstacle: [
        'The turning points came from choices about support and pacing — not from talent.',
        'The obstacle didn’t end the story; how you redefined progress did.',
        'Adjusting the goal kept it alive.',
      ],
      pivot: [
        'Your goal was a starting point, not a contract.',
        'Paying attention to what energised you changed the direction.',
        'Some of the best options only appeared once you were moving.',
      ],
    },
    keyAssumptions: {
      tailwind: [
        'That an early win means the plan is right.',
        'That you have to say yes to every opportunity.',
        'That success would feel the way you imagine.',
      ],
      obstacle: [
        'That you have to do this alone and at full speed.',
        'That falling behind means failing.',
        'That the original plan was the only plan.',
      ],
      pivot: [
        'That changing direction means giving up.',
        'That you already know what you want.',
        'That the first goal you named is the real goal.',
      ],
    },
  },
  train: {
    few: 'Good start. Your first ideas stay close to the obvious — that’s normal. Try to reach at least five before judging any of them.',
    some: 'Nice range. Look at your list: which idea surprised you the most? That’s usually the one worth developing.',
    many: 'Lots of ideas — great. Now pick the strangest one and spend a minute making it practical.',
    short: 'Write a little more — even a rough sentence gives your thinking something to push against.',
    push: {
      futures: ['Now write the future you’d least expect — then find one thing in it you’d actually want.', 'Pick one future and ask: what would have to be true a month before it?'],
      invert: ['Take your worst idea and reverse it once more. What useful action appears?', 'Which of these “bad” moves are you secretly already doing?'],
      connect: ['Connect the two most distant ideas on your list. What new thing sits between them?', 'Add a random object from the room you’re in and make it part of the solution.'],
      perspectives: ['Now answer as someone who strongly disagrees with you. What do they see?', 'How would a child explain this? What would they find obvious?'],
      partial: ['What single piece of missing information would change your decision most? How could you get it cheaply?', 'Decide now, then write the one signal that would make you change your mind.'],
      failure: ['What did this failure make possible that success would have hidden?', 'Who else has failed this way — and what did they build afterwards?'],
      wrong: ['Write the strongest argument against your view, as if you believed it.', 'If you were wrong, how would you find out soonest?'],
    },
  },
};

const tr: Pack = {
  summary: (p) => `Tarttığın konu: “${p}”`,
  clarify: {
    general: [
      'Bu mükemmel giderse, bir yıl sonra ne farklı olurdu?',
      'Hiç harekete geçmemeye karar verirsen ne kaybederdin?',
      'Bu konunun en çok düşünmekten kaçındığın kısmı hangisi?',
      'Bundan başka kim etkileniyor ve onlar ne istiyor?',
      'Bu kararı kolaylaştıracak şey ne olurdu?',
      'Şimdiye kadar ne denedin ve sana ne öğretti?',
    ],
    career: [
      'Mevcut işte seni tam olarak ne yoruyor — işin kendisi mi, insanlar mı, yön mü?',
      'İki yıl daha kalsan, şu an olmayan neye sahip olurdun?',
      'Üç yıl sonra hangi beceri için para almak istiyorsun?',
    ],
    startup: [
      'Bu sorunu, bugün çözümü için para ödeyecek kadar kim yaşıyor?',
      'Bu hafta gerçek birinin önüne koyabileceğin en küçük versiyon ne?',
      'Bırakmak için neyi görmen gerekir — peki üstüne gitmek için?',
    ],
    money: [
      'Hangi rakam seni güvende hissettirirdi ve o rakam nereden geliyor?',
      'Mesele paranın kendisi mi, yoksa paranın yapmana izin vereceği şey mi?',
      'Gerçekçi en kötü durumda ne olur — ve bununla yaşayabilir misin?',
    ],
    relationship: [
      'Bu kişiden, yüksek sesle söylemediğin neye ihtiyacın var?',
      'O bu durumu anlatsa, hikâyesi seninkinden nasıl farklı olurdu?',
      'İkiniz için de iyi bir sonuç neye benzerdi?',
    ],
    study: [
      'Bunun sonunda ne yapabilmek istiyorsun — sadece hangi unvanı taşımak değil?',
      'Bu alanı sevip sevmediğini daha ucuz ya da hızlı test etmenin bir yolu var mı?',
      'Bu seçimi kimin beklentileri şekillendiriyor?',
    ],
    move: [
      'Neye doğru gidiyorsun, neyden uzaklaşıyorsun?',
      'Yeni yerde sıradan bir salı günü neye benzerdi?',
      'Sadece kalırsan yapabileceğin ne var?',
    ],
    health: [
      'Bu alışkanlık en son ne zaman iyi gitti ve o zaman ne farklıydı?',
      'Kötü bir günde tam olarak ne araya giriyor?',
      'Yine de gurur duyacağın en küçük değişiklik ne?',
    ],
    creative: [
      'Herkes için değilse, bu kimin için?',
      'Kimse görmeyecek olsa ne yapardın?',
      'Genelde seni yarı yolda ne durduruyor?',
    ],
  },
  assumptions: {
    general: [
      { text: 'Bu karar ya hep ya hiç.', why: 'Çoğu seçim önce küçük ve geri alınabilir adımlarla denenebilir.' },
      { text: 'Hiçbir şey yapmazsan her şey olduğu gibi kalır.', why: 'Hiçbir şey yapmamak da gelecek üzerine bir bahistir.' },
      { text: 'Diğer insanlar beklediğin gibi tepki verecek.', why: 'Onlara sormadan tepkilerini tahmin ediyor olabilirsin.' },
      { text: 'Başlamadan önce daha fazla bilgiye ihtiyacın var.', why: 'Bazı bilgiler ancak harekete geçince ortaya çıkar.' },
      { text: 'Burada tek bir doğru cevap var.', why: 'Birkaç yol işe yarayabilir; asıl soru hangisine bağlanabileceğin.' },
      { text: 'Şu an nasıl hissediyorsan sonra da öyle hissedeceksin.', why: 'Bir seçim hakkındaki duygular, içine girince sık sık değişir.' },
      { text: 'Bunu tek başına çözmek zorundasın.', why: 'Biri bunun çok benzerini daha önce yaşamış olabilir.' },
      { text: 'Bariz engel, asıl engel.', why: 'En gürültülü sorun her zaman seni durduran sorun değildir.' },
    ],
    career: [
      { text: 'Yeni bir iş, bu işte seni rahatsız eden şeyi çözecek.', why: 'Bazı sıkıntılar bir sonraki işe de seninle gelir.' },
      { text: 'Yöneticin ne istediğini biliyor.', why: 'İnsanlar hiç söylenmemiş hedefleri nadiren tahmin eder.' },
      { text: 'Ayrılırsan o kapı sonsuza dek kapanır.', why: 'Çoğu sektör göründüğünden küçük ve daha affedicidir.' },
    ],
    startup: [
      { text: 'İnsanlar bunu sen istediğin için isteyecek.', why: 'Heyecanın piyasa hakkında değil, senin hakkında bir kanıt.' },
      { text: 'Başlamak için işini bırakman gerekiyor.', why: 'İlk testler çoğu zaman akşamlara ve hafta sonlarına sığar.' },
      { text: 'Kimse görmeden önce ürün bitmiş olmalı.', why: 'Kaba versiyonlar, sorunları düzeltmesi ucuzken gösterir.' },
    ],
    money: [
      { text: 'Daha fazla para stresi ortadan kaldırır.', why: 'Stres çoğu zaman miktardan değil belirsizlikten gelir.' },
      { text: 'Bu masraf ya da risk azaltılamaz.', why: 'Çoğu maliyetin daha küçük, daha yavaş ya da paylaşılan bir versiyonu vardır.' },
      { text: 'Herkes bu işi çözmüş durumda.', why: 'Para kaygıları yaygındır ve nadiren konuşulur.' },
    ],
    relationship: [
      { text: 'Ne hissettiğini zaten biliyor.', why: 'İçeriden bariz gelen şey dışarıdan çoğu zaman görünmez.' },
      { text: 'Konuyu açmak işleri kötüleştirir.', why: 'Konuşulmayan sorunlar sessizce büyüme eğilimindedir.' },
      { text: 'Davranışı, düşündüğün anlama geliyor.', why: 'Aynı davranış çok farklı nedenlerden doğabilir.' },
    ],
    study: [
      { text: 'Bu bölüm ya da kurs tek giriş yolu.', why: 'Birçok alan portfolyo, proje ya da deneyimi de kabul eder.' },
      { text: 'Şimdi seçmek seni sonsuza dek bağlar.', why: 'İnsanlar okuduktan sonra sandığından çok daha sık yön değiştirir.' },
      { text: 'Keyif almadan önce iyi olman gerekir.', why: 'Keyif çoğu zaman önce gelir, beceri arkasından.' },
    ],
    move: [
      { text: 'Yeni bir yer, yeni bir sen gibi hissettirecek.', why: 'Alışkanlıklar ve kaygılar genelde bavulda seninle gelir.' },
      { text: 'Kalmak yerinde saymak demek.', why: 'Adresini değiştirmeden de çok şeyi değiştirebilirsin.' },
      { text: 'Oradaki günlük hayatı doğru hayal edebiliyorsun.', why: 'Tatiller ve hayal gücü sıradan günleri atlar.' },
    ],
    health: [
      { text: 'Daha fazla iradeye ihtiyacın var.', why: 'Ortamı değiştirmek genelde daha çok zorlamaktan iyi sonuç verir.' },
      { text: 'Bir günü kaçırmak başarısız olduğun anlamına gelir.', why: 'Haftalar boyunca süreklilik, kusursuz günlerden daha önemlidir.' },
      { text: 'Her şeyi aynı anda değiştirmen gerekiyor.', why: 'Kalıcı olan küçük bir değişiklik çoğu zaman büyük bir revizyondan iyidir.' },
    ],
    creative: [
      { text: 'Başlamadan önce büyük bir fikre ihtiyacın var.', why: 'Fikirler çoğu zaman küçük ve dağınık başlangıçlardan büyür.' },
      { text: 'Özgün değilse yapmaya değmez.', why: 'İyi işlerin çoğu daha önce gelenleri yeniden harmanlar.' },
      { text: 'Gerçek üreticiler kendinden emin hisseder.', why: 'Şüphe, neredeyse her yaratıcı sürecin parçasıdır.' },
    ],
  },
  reframes: [
    { title: 'Bir öğrenme problemi', text: 'Bunun sana uygun olup olmadığını öğrenmenin en ucuz yolu ne?' },
    { title: 'Bir zamanlama problemi', text: '“Yapmalı mıyım” değil, “ne zaman ve hangi koşullarda”.' },
    { title: 'Bir kimlik problemi', text: 'Kendinin hangi versiyonu olmayı pratik etmek istiyorsun?' },
    { title: 'Bir tasarım problemi', text: 'Durumun içinde seçmek yerine durumu yeniden tasarlayabilsen neyi değiştirirdin?' },
    { title: 'Bir hikâye problemi', text: 'Beş yıl sonra bu hikâyenin hangi versiyonunu anlatmak isterdin?' },
    { title: 'Bir kaynak problemi', text: 'Zaman, para ya da enerji darboğaz olmasa ne yapardın — ve asıl darboğaz hangisi?' },
    { title: 'Bir konuşma problemi', text: 'Bunu çok küçültecek tek bir dürüst konuşma var mı?' },
    { title: 'Bir deney problemi', text: 'İki hafta deneyip sonra kanıtla karar verebileceğin ne var?' },
    { title: 'Bir değerler problemi', text: 'Daha zor olsa bile, en çok önem verdiğin şeye hangi seçenek uyuyor?' },
    { title: 'Bir çıkarma problemi', text: 'Neyi yapmayı bırakırsan bu kolaylaşır?' },
  ],
  provocations: [
    'Bir arkadaşın sana tam olarak bu durumu anlatsa, önce neyi denemesini söylerdin?',
    'Başarısız olamayacağını bilsen ne yapardın — ve bunun en küçük parçası ne?',
    'Tanıdığın en cesur kişi burada ne yapardı? Peki en temkinli olanı?',
    'On dakika içinde karar vermek zorunda olsan neyi seçerdin?',
    'Kulağa saçma gelse bile, bu problemi tamamen ortadan kaldıracak şey ne olurdu?',
    'Bir yıl sonraki sen, bugün ne yapmış olmanı tavsiye ederdi?',
    'Kimse asla öğrenmeyecek olsa hangi seçeneği seçerdin?',
    'Burada yapabileceğin en ilginç hata ne olurdu?',
  ],
  provocationFrom: (a) => `Diyelim ki “${a}” düpedüz yanlış. Ne mümkün hâle gelir?`,
  opportunities: [
    'Tahmin etmek yerine gerçek bir sinyalden hızla öğrenmek',
    'Küçük, görünür bir kazanımla özgüven kazanmak',
    'Şu an bulunduğun yerden göremediğin seçenekleri keşfetmek',
    'Aynı şeyi önemseyen insanları bulmak',
    'Belirsiz bir kaygıyı somut bir soruya dönüştürmek',
    'Eksik bilgiyle karar verme pratiği yapmak',
  ],
  risks: [
    'Enerjiyi yanlış soruya harcamak',
    'Kanıt olmadan fazla bağlanmak',
    'Fazla planlayarak kararı ertelemek',
    'Başkalarının beklentilerinin senin yerine karar vermesi',
    'Bunun ne kadar zaman alacağını küçümsemek',
    'Hiçbir şey yapmamanın bedelini görmezden gelmek',
  ],
  opportunityFrom: (a) => `“${a}” yanlış çıkarsa, elediğin bir yol açılabilir`,
  riskFrom: (a) => `Planı “${a}” varsayımına kontrol etmeden dayandırmak`,
  experiments: {
    general: [
      { title: 'Bunu yapmış iki kişiyle konuş', how: 'Onları en çok neyin şaşırttığını ve neyi farklı yapacaklarını sor.', timebox: '48 saat' },
      { title: 'Başarısızlık hikâyesini yaz', how: 'Bir yıl sonra başarısız olduğunu hayal et. Nedenini 10 satırda yaz, en büyük nedeni düzelt.', timebox: '20 dakika' },
      { title: 'Yazı tura at, sonra içine bak', how: 'Seçim için yazı tura at. Rahatlama mı hayal kırıklığı mı hissettiğine dikkat et.', timebox: '5 dakika' },
      { title: 'Bir saatlik versiyonunu yap', how: 'Bir saatini, zaten karar vermişsin gibi davranarak geçir.', timebox: '1 saat' },
      { title: 'Neleri bırakacağını listele', how: 'Bunun için vazgeçeceğin üç şeyi yaz. Hâlâ istiyor musun, bak.', timebox: '15 dakika' },
      { title: 'Tek bir geri bildirim iste', how: 'Planını dürüst bir kişiye göster ve neyi değiştireceğini sor.', timebox: 'Bu hafta' },
    ],
    career: [
      { title: 'Kariyer konuşmasını yap', how: 'Yöneticine büyümek istediğin bir alanı söyle ve bunun için ne gerektiğini sor.', timebox: 'Bu hafta' },
      { title: 'Sonraki rolü yakından gör', how: 'İstediğin roldeki birine 30 dakika tipik bir haftasını sor.', timebox: '48 saat' },
      { title: 'Araştırma amaçlı bir başvuru yap', how: 'Piyasanın senin hakkında ne dediğini görmek için tek bir ilana başvur.', timebox: '3 gün' },
    ],
    startup: [
      { title: 'Beş müşteri görüşmesi', how: 'Beş kişiye bu sorunu bugün nasıl çözdüklerini sor. Satış yapma — dinle.', timebox: 'Bu hafta' },
      { title: 'Sahte kapı testi', how: 'Tek sayfalık bir tanıtım hazırla ve kaç kişinin istediğine bak.', timebox: '48 saat' },
      { title: 'Yapmadan önce sat', how: 'Bir kişiden taahhüt almaya çalış — küçük bir ön ödeme ya da net bir evet.', timebox: '1 hafta' },
    ],
    money: [
      { title: 'Bir haftalık harcamayı yaz', how: 'Yedi gün boyunca her harcamayı yargılamadan not et.', timebox: '7 gün' },
      { title: 'En kötü durumun fiyatını çıkar', how: 'Gerçekçi en kötü sonucu gerçek rakamlarla yaz. Kaldırabilir misin, karar ver.', timebox: '30 dakika' },
      { title: 'Bunu yapmış birine sor', how: 'Benzer bir para kararı vermiş birini bul ve ne öğrendiğini sor.', timebox: 'Bu hafta' },
    ],
    relationship: [
      { title: 'Tek bir dürüst cümle kur', how: 'Suçlamadan net bir duygu ya da ihtiyacını paylaş ve cevabı dinle.', timebox: '48 saat' },
      { title: 'Tahmin etme, sor', how: 'Kendi bakışını anlatmadan önce onun durumu nasıl gördüğünü sor.', timebox: 'Bir sonraki konuşma' },
      { title: 'Onun tarafını yaz', how: 'Durumu onun gözünden 10 satırda yaz.', timebox: '15 dakika' },
    ],
    study: [
      { title: 'Ücretsiz bir ilk dersi al', how: 'Alanda ücretsiz bir giriş dersi ya da konuşma bul ve enerjine dikkat et.', timebox: 'Bu hafta' },
      { title: 'Mezun biriyle konuş', how: 'Bu yolu bitirmiş birine keşke önceden bilseydim dediği şeyi sor.', timebox: '48 saat' },
      { title: 'Minik bir proje yap', how: 'Bu beceriyle küçük bir şey üret; asıl işten keyif alıp almadığını gör.', timebox: 'Hafta sonu' },
    ],
    move: [
      { title: 'Orada sıradan bir günü yaşa', how: 'Yeni yerde normal bir hafta içi gününü planla — ulaşım, market, akşamlar.', timebox: '1 saatlik araştırma' },
      { title: 'Taşınmış biriyle konuş', how: 'Neyi özlediğini ve neye asla geri dönmeyeceğini sor.', timebox: 'Bu hafta' },
      { title: 'Burada bir şeyi değiştir', how: 'Taşınmanın getirmesini umduğun bir değişikliği bulunduğun yerde dene.', timebox: '2 hafta' },
    ],
    health: [
      { title: 'Alışkanlığı küçült', how: 'Alışkanlığı atlanamayacak kadar küçült — günde iki dakika.', timebox: '7 gün' },
      { title: 'Bir tetikleyiciyi değiştir', how: 'Eski alışkanlığı tetikleyen ortamındaki tek bir şeyin yerini değiştir.', timebox: 'Bugün' },
      { title: 'Çabayı değil enerjiyi kaydet', how: 'Günde üç kez enerjini not et ve bir örüntü ara.', timebox: '5 gün' },
    ],
    creative: [
      { title: 'Kötü bir ilk taslak yap', how: 'Bilerek en kötü versiyonu üret, sonra içinden tek iyi parçayı tut.', timebox: '30 dakika' },
      { title: 'Bitmemiş bir şeyi paylaş', how: 'Kaba bir parçayı bir kişiye göster ve dikkatini neyin çektiğini sor.', timebox: '48 saat' },
      { title: 'Bir yapıyı ödünç al', how: 'Sevdiğin bir eserin iskeletini al ve kendi malzemenle doldur.', timebox: '1 saat' },
    ],
  },
  experimentFrom: (a) => ({
    title: 'En sallantılı varsayımını test et',
    how: `“${a}” doğru mu, ucuz bir yolla kontrol et — sor, dene ya da araştır.`,
    timebox: '48 saat',
  }),
  future: {
    labels: [
      ['2. hafta', '2. ay', '3. ay'],
      ['1. ay', '3. ay', '6. ay'],
      ['2. ay', '6. ay', '1 yıl'],
      ['1. yıl', '2. yıl', '3. yıl'],
    ],
    scenarios: {
      tailwind: [
        (g) => ({
          title: 'İvme kazanıyorsun',
          events: [
            `“${g}” işine başlıyorsun ve beklediğinden hızlı bir ritim buluyorsun.`,
            'Küçük bir erken sonuç, işine yarayacak birinin dikkatini çekiyor.',
            'Daha önce olmayan seçeneklerin var — ve verilecek yeni bir karar.',
          ],
          prompt: 'Biri sana, hazır hissetmeden önce daha büyük bir fırsat sunuyor.',
          options: ['Hemen kabul et', 'Önce daha küçük bir deneme iste', 'Reddet ve inşa etmeye devam et'],
        }),
        (g) => ({
          title: 'Taşlar yerine oturuyor',
          events: [
            `“${g}” için ilk adımlar korktuğundan kolay geçiyor.`,
            'Bunu seninle yapmak isteyen birini buluyorsun.',
            'İlerleme gerçek ve beklentiler — seninki de başkalarınınki de — yükseliyor.',
          ],
          prompt: 'İşler iyi giderken çıtayı yükseltmek istiyorsun.',
          options: ['Daha büyüğe git', 'Aynı tempoda devam et', 'Elindekini sağlama al'],
        }),
      ],
      obstacle: [
        (g) => ({
          title: 'Hayat araya giriyor',
          events: [
            `“${g}” için iyi başlıyorsun ama enerjin planladığından düşük.`,
            'Beklenmedik bir yük haftalarca zamanının çoğunu alıyor.',
            'Umduğun ilerlemenin yarısını yaptın — ve seni asıl neyin yavaşlattığını öğrendin.',
          ],
          prompt: 'Planın gerisindesin ve motivasyon düşüyor.',
          options: ['Hedefi yarıya indir', 'Seni takip edecek birini bul', 'Ara ver, sonra yeniden başla'],
        }),
        (g) => ({
          title: 'Plan duvara çarpıyor',
          events: [
            `“${g}” daha başlarda, öngörmediğin bir soruna takılıyor.`,
            'Önemli bir kaynak — para, zaman ya da bir kişi — ortadan kalkıyor.',
            'Hedefi hâlâ önemsiyorsun ama asıl plan artık işlemiyor.',
          ],
          prompt: 'Duvar gerçek. Onunla ne yaparsın?',
          options: ['Üstüne git', 'Etrafından dolaş', 'Yardım iste'],
        }),
      ],
      pivot: [
        (g) => ({
          title: 'Farklı bir yol beliriyor',
          events: [
            `“${g}” peşindeyken kimsenin çözmediği bağlantılı bir sorun fark ediyorsun.`,
            'Yan yol, asıl plandan daha canlı hissettirmeye başlıyor.',
            'Hedefin şekil değiştirdi — iyi ya da kötü yönde.',
          ],
          prompt: 'Yan yol umut verici ama belirsiz.',
          options: ['Tamamen geç', 'Zamanını böl', 'Asıl planda kal'],
        }),
        (g) => ({
          title: 'Başka bir şey istiyorsun',
          events: [
            `“${g}” yolunun yarısında, keyif aldığın kısmın planladığın kısım olmadığını fark ediyorsun.`,
            'Bir konuşma sana hedefin hiç düşünmediğin bir versiyonunu gösteriyor.',
            'Var olduğunu bilmediğin bir yol ayrımındasın.',
          ],
          prompt: 'İstediğin şey değişti.',
          options: ['Yeni ilgiyi takip et', 'Önce başladığını bitir', 'İkisini birleştir'],
        }),
      ],
    },
    narrative1: [
      (c) => `Seçimin: “${c}”. Birkaç hafta boyunca işe yarıyor gibi.`,
      (c) => `Seçimin: “${c}”. Beklediğinden fazla çaba istiyor ama işler ilerliyor.`,
      (c) => `Seçimin: “${c}”. Bazıları şaşırıyor; sen ise tuhaf biçimde sakinsin.`,
    ],
    twists: [
      {
        twist: 'Kıt sandığın şeyin — zaman, para ya da destek — düşündüğünden daha erişilebilir olduğunu öğreniyorsun, ama sadece istersen.',
        prompt: 'Bu yeni bilgiyi nasıl kullanırsın?',
        options: ['Açıkça yardım iste', 'Tek başına devam et', 'Hedefin kendisini yeniden düşün'],
      },
      {
        twist: 'Güvendiğin biri, nazikçe, yanlış yöne gittiğini düşündüğünü söylüyor.',
        prompt: 'Nasıl karşılık verirsin?',
        options: ['Açıklamasını iste', 'Teşekkür et ve devam et', 'Dur ve yeniden düşün'],
      },
      {
        twist: 'Dışarıdan bir değişiklik — yeni bir kural, piyasada bir kayma, hayatında bir olay — planının altındaki zemini oynatıyor.',
        prompt: 'Koşullar değişti. Şimdi ne olacak?',
        options: ['Planı uyarla', 'Ortalığın durulmasını bekle', 'Değişikliği bir fırsata çevir'],
      },
      {
        twist: 'İlerlemeyi yanlış bir ölçüyle takip ettiğini fark ediyorsun.',
        prompt: 'Onun yerine neye dikkat etmeye başlarsın?',
        options: ['Gündelik hissettirdiğine', 'Başkalarının fark ettiğine', 'Öğrendiklerine'],
      },
      {
        twist: 'Daha güvenli ama daha küçük ikinci bir seçenek beliriyor.',
        prompt: 'Güvenli yolu seçer misin?',
        options: ['Güvenli seçeneği al', 'Büyük bahiste kal', 'Bir süre ikisini birlikte dene'],
      },
      {
        twist: 'En zor kısmın iş değil, bırakman gereken şeyler olduğunu fark ediyorsun.',
        prompt: 'Neden vazgeçmeye hazırsın?',
        options: ['Rahat bir şeyden', 'Biraz boş zamandan', 'Henüz hiçbir şeyden — başka yol bul'],
      },
    ],
    narrative2: [
      (c) => `Seçimin: “${c}”. Hikâye yeni bir biçime oturuyor.`,
      (c) => `Seçimin: “${c}”. Her şey işlemiyor ama nedenini anlıyorsun.`,
      (c) => `Seçimin: “${c}”. Geriye bakınca asıl dönüm noktası buymuş.`,
    ],
    insights: {
      tailwind: [
        'İyi haberler kendi kararlarını da getirdi — başarının da bir plana ihtiyacı var.',
        'Dönüm noktaları şanstan değil, ivmeyi nasıl yönettiğinden geldi.',
        'Burada “evet” demek de “henüz değil” demek de gerçek birer seçimdi.',
      ],
      obstacle: [
        'Dönüm noktaları yetenekten değil, destek ve tempo ile ilgili seçimlerden geldi.',
        'Engel hikâyeyi bitirmedi; ilerlemeyi nasıl yeniden tanımladığın belirledi.',
        'Hedefi uyarlamak onu hayatta tuttu.',
      ],
      pivot: [
        'Hedefin bir sözleşme değil, bir başlangıç noktasıydı.',
        'Sana enerji veren şeye dikkat etmek yönü değiştirdi.',
        'En iyi seçeneklerin bazıları ancak hareket hâlindeyken ortaya çıktı.',
      ],
    },
    keyAssumptions: {
      tailwind: [
        'Erken bir kazanımın planın doğru olduğu anlamına geldiği.',
        'Her fırsata evet demek zorunda olduğun.',
        'Başarının hayal ettiğin gibi hissettireceği.',
      ],
      obstacle: [
        'Bunu tek başına ve tam hızla yapmak zorunda olduğun.',
        'Geride kalmanın başarısızlık demek olduğu.',
        'İlk planın tek plan olduğu.',
      ],
      pivot: [
        'Yön değiştirmenin vazgeçmek demek olduğu.',
        'Ne istediğini zaten bildiğin.',
        'İlk söylediğin hedefin asıl hedef olduğu.',
      ],
    },
  },
  train: {
    few: 'İyi başlangıç. İlk fikirlerin bariz olana yakın duruyor — bu normal. Hiçbirini yargılamadan önce en az beşe ulaşmayı dene.',
    some: 'Güzel bir çeşitlilik. Listene bak: seni en çok hangisi şaşırttı? Geliştirmeye değer olan genelde odur.',
    many: 'Bir sürü fikir — harika. Şimdi en tuhafını seç ve bir dakikanı onu uygulanabilir hâle getirmeye ayır.',
    short: 'Biraz daha yaz — kaba bir cümle bile düşüncene itecek bir şey verir.',
    push: {
      futures: ['Şimdi en az beklediğin geleceği yaz — sonra içinde gerçekten isteyeceğin bir şey bul.', 'Bir gelecek seç ve sor: bundan bir ay önce neyin doğru olması gerekirdi?'],
      invert: ['En kötü fikrini bir kez daha tersine çevir. Hangi işe yarar adım çıkıyor?', 'Bu “kötü” hamlelerin hangisini gizlice zaten yapıyorsun?'],
      connect: ['Listendeki en uzak iki fikri birleştir. Aralarında hangi yeni şey duruyor?', 'Bulunduğun odadan rastgele bir nesne seç ve onu çözümün parçası yap.'],
      perspectives: ['Şimdi sana kesinlikle katılmayan biri gibi cevap ver. O ne görüyor?', 'Bir çocuk bunu nasıl anlatırdı? Ona ne bariz gelirdi?'],
      partial: ['Eksik tek bir bilgi kararını en çok hangisi değiştirirdi? Onu ucuza nasıl elde edersin?', 'Şimdi karar ver, sonra fikrini değiştirecek tek sinyali yaz.'],
      failure: ['Bu başarısızlık, başarının saklayacağı neyi mümkün kıldı?', 'Başka kim bu şekilde başarısız oldu — ve sonra ne inşa etti?'],
      wrong: ['Görüşüne karşı en güçlü argümanı, ona inanıyormuş gibi yaz.', 'Yanılıyorsan, bunu en erken nasıl öğrenirdin?'],
    },
  },
};

export const PACKS: Record<AiLang, Pack> = { en, tr };
