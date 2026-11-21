import { programSchema, type Localized, type Program } from '../domain/models';

const l = (en: string, uk: string, ru: string): Localized => ({ en, uk, ru });
const acsm = 'https://acsm.org/resistance-training-guidelines-update-2026/';
const ace = 'https://www.acefitness.org/continuing-education/certified/may-2024/8630/mastering-the-art-of-the-split-routine/';
type Prescription = Program['days'][number]['exercises'][number];
const e = (exerciseId: string, sets = 2, reps = 10, restSeconds = 90): Prescription => ({ exerciseId, sets, reps, restSeconds });
const d = (id: string, name: Localized, exercises: Prescription[]): Program['days'][number] => ({ id, name, exercises });
const guidance = l(
  'Warm up; choose a load that leaves 2–3 controlled reps in reserve. These are editable starting targets, not a personalised prescription. For one-sided movements, reps are per side; complete both sides before marking a set.',
  'Розімніться; оберіть вагу із запасом 2–3 контрольованих повторень. Це змінювані початкові цілі, а не індивідуальні призначення. Для односторонніх рухів повторення вказані на сторону; відмічайте підхід після обох сторін.',
  'Разомнитесь; выберите вес с запасом 2–3 контролируемых повторений. Это изменяемые начальные цели, а не индивидуальные назначения. Для односторонних движений повторения указаны на сторону; отмечайте подход после обеих сторон.',
);
function p(id: string, name: Localized, category: Program['category'], description: Localized, days: Program['days'], cycle: Program['cycle'], url = acsm): Program {
  return programSchema.parse({
    id, version: 1, name, category,
    description: l(`${description.en} ${guidance.en}`, `${description.uk} ${guidance.uk}`, `${description.ru} ${guidance.ru}`),
    days, cycle, owner: 'catalog',
    source: { classification: 'inspired-community', author: 'ATLAS', rights: 'atlas-original', checkedOn: '2026-10-14', url },
  });
}

// Original ATLAS routines. References concern general training principles;
// they do not identify these combinations as ACSM/ACE-authored or validated plans.
export const additionalPrograms: Program[] = [
  p('home-bodyweight-3', l('Home · Bodyweight · 3 days', 'Вдома · Власна вага · 3 дні', 'Дома · Свой вес · 3 дня'), 'home', l(
    'No weights; use a stable support when needed. Three nonconsecutive sessions with a two-week A/B rotation. This limited-equipment starter has no pulling exercise; add suitable pulling equipment for a balanced long-term plan.',
    'Без обтяжень; за потреби використовуйте стійку опору. Три заняття через день із двотижневим чергуванням A/B. Цей початковий варіант не містить тяг; для збалансованого тривалого плану додайте відповідне обладнання.',
    'Без отягощений; при необходимости используйте устойчивую опору. Три занятия через день с двухнедельным чередованием A/B. Этот начальный вариант не содержит тяг; для сбалансированного длительного плана добавьте подходящее оборудование.',
  ), [
    d('home-a', l('Home A', 'Вдома A', 'Дома A'), [e('split-squat', 2, 8), e('pushup', 2, 8), e('bridge', 2, 12, 60), e('deadbug', 2, 6, 60)]),
    d('home-b', l('Home B', 'Вдома B', 'Дома B'), [e('pushup', 2, 8), e('split-squat', 2, 10), e('bridge', 2, 10, 60), e('calf', 2, 15, 60)]),
  ], ['home-a', null, 'home-b', null, 'home-a', null, null, 'home-b', null, 'home-a', null, 'home-b', null, null]),

  p('home-dumbbells-3', l('Home · Dumbbells · 3 days', 'Вдома · Гантелі · 3 дні', 'Дома · Гантели · 3 дня'), 'home', l(
    'Dumbbells and a stable support for rows; no machines. Three different sessions spread across the week, using push-ups in place of bench presses.',
    'Гантелі та стійка опора для тяг; без тренажерів. Три різні заняття протягом тижня, з віджиманнями замість жиму на лаві.',
    'Гантели и устойчивая опора для тяг; без тренажёров. Три разных занятия в течение недели, с отжиманиями вместо жима на скамье.',
  ), [
    d('home-db-a', l('Squat & push', 'Присідання та жим', 'Приседания и жим'), [e('goblet-squat', 2, 10, 120), e('pushup', 2, 8), e('row', 2, 10), e('rdl', 2, 10, 120)]),
    d('home-db-b', l('Hinge & shoulders', 'Нахил та плечі', 'Наклон и плечи'), [e('rdl', 2, 10, 120), e('ohp', 2, 8, 120), e('row', 2, 10), e('split-squat', 2, 8), e('deadbug', 2, 6, 60)]),
    d('home-db-c', l('Full-body practice', 'Практика для всього тіла', 'Практика для всего тела'), [e('goblet-squat', 2, 10, 120), e('pushup', 2, 8), e('row', 2, 12), e('bridge', 2, 12, 60), e('calf', 2, 15, 60)]),
  ], ['home-db-a', null, 'home-db-b', null, 'home-db-c', null, null]),

  p('full-body-compact-2', l('Full body · Compact · 2 days', 'Усе тіло · Коротко · 2 дні', 'Всё тело · Кратко · 2 дня'), 'full-body', l(
    'Four exercises per session for a busy week. Needs dumbbells and a bench. A small starting volume with a squat, hinge, push and pull each day; add work gradually if it suits your goals.',
    'Чотири вправи на заняття для зайнятого тижня. Потрібні гантелі та лава. Невеликий початковий обсяг: присідання, нахил, жим і тяга щодня; поступово додавайте роботу відповідно до цілей.',
    'Четыре упражнения на занятие для занятой недели. Нужны гантели и скамья. Небольшой начальный объём: приседания, наклон, жим и тяга каждый день; постепенно добавляйте работу под свои цели.',
  ), [
    d('compact-a', l('Compact A', 'Коротко A', 'Кратко A'), [e('goblet-squat', 2, 8, 120), e('db-press', 2, 8, 120), e('row', 2, 10), e('rdl', 2, 10, 120)]),
    d('compact-b', l('Compact B', 'Коротко B', 'Кратко B'), [e('split-squat', 2, 10), e('pushup', 2, 10), e('row', 2, 12), e('rdl', 2, 10, 120)]),
  ], ['compact-a', null, null, 'compact-b', null, null, null]),

  p('full-body-gym-3', l('Full body · Gym A/B/C', 'Усе тіло · Зал A/B/C', 'Всё тело · Зал A/B/C'), 'full-body', l(
    'Three gym sessions with different exercise priorities. Needs a squat rack, bench, dumbbells and pulldown/leg-curl machines. Start with manageable loads and use rack safeties.',
    'Три заняття в залі з різними пріоритетами. Потрібні стійка, лава, гантелі, верхній блок і тренажер для згинання ніг. Починайте з посильної ваги та використовуйте страхувальні упори.',
    'Три занятия в зале с разными приоритетами. Нужны стойка, скамья, гантели, верхний блок и тренажёр для сгибания ног. Начинайте с посильного веса и используйте страховочные упоры.',
  ), [
    d('gym-a', l('Squat priority', 'Пріоритет присідання', 'Приоритет приседаний'), [e('squat', 2, 8, 150), e('db-press', 2, 10, 120), e('pulldown', 2, 10), e('leg-curl', 2, 12), e('deadbug', 2, 6, 60)]),
    d('gym-b', l('Press priority', 'Пріоритет жиму', 'Приоритет жима'), [e('bench', 2, 8, 150), e('rdl', 2, 10, 120), e('row', 2, 10), e('split-squat', 2, 10), e('lateral', 2, 12, 60)]),
    d('gym-c', l('Pull priority', 'Пріоритет тяги', 'Приоритет тяги'), [e('pulldown', 2, 10, 120), e('goblet-squat', 2, 10, 120), e('ohp', 2, 10, 120), e('bridge', 2, 12, 60), e('calf', 2, 15, 60)]),
  ], ['gym-a', null, 'gym-b', null, 'gym-c', null, null]),

  p('upper-lower-2', l('Upper / Lower · 2 days', 'Верх / Низ · 2 дні', 'Верх / Низ · 2 дня'), 'upper-lower', l(
    'A schedule-limited split: one upper and one lower session each week. Each region is trained only once weekly; for a general two-day starting plan, prefer a full-body template. Needs gym equipment.',
    'Спліт для обмеженого розкладу: одне заняття для верху й одне для низу на тиждень. Кожна частина тіла тренується лише раз; для загального дводенного старту краще обрати шаблон на все тіло. Потрібен зал.',
    'Сплит для ограниченного расписания: одно занятие для верха и одно для низа в неделю. Каждая часть тела тренируется лишь раз; для общего двухдневного старта лучше выбрать шаблон на всё тело. Нужен зал.',
  ), [
    d('ul2-upper', l('Upper', 'Верх', 'Верх'), [e('db-press', 2, 10, 120), e('row', 2, 10), e('pulldown', 2, 10), e('ohp', 2, 8, 120), e('curl', 2, 12, 60), e('pushdown', 2, 12, 60)]),
    d('ul2-lower', l('Lower', 'Низ', 'Низ'), [e('goblet-squat', 2, 10, 120), e('rdl', 2, 10, 120), e('split-squat', 2, 8), e('leg-curl', 2, 12), e('calf', 2, 15, 60), e('deadbug', 2, 6, 60)]),
  ], ['ul2-upper', null, null, 'ul2-lower', null, null, null], ace),

  p('upper-lower-3-rotating', l('Upper / Lower · Alternating 3', 'Верх / Низ · Чергування 3', 'Верх / Низ · Чередование 3'), 'upper-lower', l(
    'Upper/lower/upper, then lower/upper/lower. The full rotation lasts 14 days, averaging 1.5 sessions per region per week. Use this when a three-day split fits your schedule; it is not a six-day week.',
    'Верх/низ/верх, потім низ/верх/низ. Повне чергування триває 14 днів: у середньому 1,5 заняття на частину тіла за тиждень. Варіант для триденного розкладу, а не шести занять за тиждень.',
    'Верх/низ/верх, затем низ/верх/низ. Полное чередование занимает 14 дней: в среднем 1,5 занятия на часть тела в неделю. Вариант для трёхдневного расписания, а не шести занятий за неделю.',
  ), [
    d('ul3-upper', l('Upper', 'Верх', 'Верх'), [e('bench', 2, 8, 150), e('row', 2, 10), e('pulldown', 2, 10), e('ohp', 2, 10, 120), e('curl', 2, 12, 60), e('pushdown', 2, 12, 60)]),
    d('ul3-lower', l('Lower', 'Низ', 'Низ'), [e('squat', 2, 8, 150), e('rdl', 2, 10, 120), e('leg-curl', 2, 12), e('calf', 2, 15, 60), e('deadbug', 2, 6, 60)]),
  ], ['ul3-upper', null, 'ul3-lower', null, 'ul3-upper', null, null, 'ul3-lower', null, 'ul3-upper', null, 'ul3-lower', null, null], ace),

  p('dumbbell-upper-lower-4', l('Dumbbells · Upper / Lower', 'Гантелі · Верх / Низ', 'Гантели · Верх / Низ'), 'upper-lower', l(
    'Four sessions using dumbbells, a stable bench and bodyweight. Each region has two weekly sessions with varied exercise order. For people already comfortable training several days a week.',
    'Чотири заняття з гантелями, стійкою лавою та власною вагою. Кожна частина тіла має два заняття на тиждень зі змінним порядком вправ. Для тих, хто вже звик тренуватися кілька днів на тиждень.',
    'Четыре занятия с гантелями, устойчивой скамьёй и своим весом. У каждой части тела два занятия в неделю с разным порядком упражнений. Для тех, кто уже привык тренироваться несколько дней в неделю.',
  ), [
    d('db-upper-a', l('Upper A', 'Верх A', 'Верх A'), [e('db-press', 2, 10, 120), e('row', 3, 10, 120), e('ohp', 2, 10, 120), e('curl', 2, 12, 60)]),
    d('db-lower-a', l('Lower A', 'Низ A', 'Низ A'), [e('goblet-squat', 3, 10, 120), e('rdl', 2, 10, 120), e('calf', 2, 15, 60), e('deadbug', 2, 6, 60)]),
    d('db-upper-b', l('Upper B', 'Верх B', 'Верх B'), [e('row', 3, 10, 120), e('pushup', 2, 10), e('lateral', 2, 12, 60), e('curl', 2, 12, 60)]),
    d('db-lower-b', l('Lower B', 'Низ B', 'Низ B'), [e('rdl', 2, 10, 120), e('split-squat', 2, 10), e('bridge', 2, 12, 60), e('calf', 2, 15, 60)]),
  ], ['db-upper-a', 'db-lower-a', null, 'db-upper-b', 'db-lower-b', null, null], ace),

  p('upper-lower-full-3', l('Upper / Lower / Full · 3 days', 'Верх / Низ / Усе тіло · 3 дні', 'Верх / Низ / Всё тело · 3 дня'), 'custom', l(
    'Two focused sessions plus one full-body session to revisit both regions within a three-day week. Needs dumbbells, a bench, a pulldown and a leg-curl machine.',
    'Два окремі заняття та одне на все тіло, щоб повторно навантажити верх і низ у триденному тижні. Потрібні гантелі, лава, верхній блок і тренажер для згинання ніг.',
    'Два отдельных занятия и одно на всё тело, чтобы повторно нагрузить верх и низ в трёхдневной неделе. Нужны гантели, скамья, верхний блок и тренажёр для сгибания ног.',
  ), [
    d('hybrid-upper', l('Upper', 'Верх', 'Верх'), [e('db-press', 2, 10, 120), e('row', 2, 10), e('ohp', 2, 10, 120), e('pulldown', 2, 10), e('curl', 2, 12, 60)]),
    d('hybrid-lower', l('Lower', 'Низ', 'Низ'), [e('goblet-squat', 2, 10, 120), e('rdl', 2, 10, 120), e('leg-curl', 2, 12), e('calf', 2, 15, 60), e('deadbug', 2, 6, 60)]),
    d('hybrid-full', l('Full body', 'Усе тіло', 'Всё тело'), [e('split-squat', 2, 10), e('db-press', 2, 10, 120), e('pulldown', 2, 10), e('rdl', 2, 10, 120), e('lateral', 2, 12, 60)]),
  ], ['hybrid-upper', null, 'hybrid-lower', null, 'hybrid-full', null, null], ace),

  p('ppl-3-weekly', l('Push / Pull / Legs · 3 days', 'Жим / Тяга / Ноги · 3 дні', 'Жим / Тяга / Ноги · 3 дня'), 'ppl', l(
    'Three focused gym days with rest between sessions. Each group is directly trained once per week; choose a full-body or hybrid plan if you want more frequent exposure with the same three visits.',
    'Три окремі заняття в залі з відпочинком між ними. Кожна група тренується безпосередньо раз на тиждень; для частішої роботи за ті самі три відвідування оберіть усе тіло або комбінований план.',
    'Три отдельных занятия в зале с отдыхом между ними. Каждая группа тренируется напрямую раз в неделю; для более частой работы за те же три посещения выберите всё тело или комбинированный план.',
  ), [
    d('ppl3-push', l('Push', 'Жим', 'Жим'), [e('db-press', 3, 10, 120), e('ohp', 2, 10, 120), e('lateral', 2, 12, 60), e('pushdown', 2, 12, 60)]),
    d('ppl3-pull', l('Pull', 'Тяга', 'Тяга'), [e('pulldown', 3, 10, 120), e('row', 2, 10, 120), e('curl', 2, 12, 60)]),
    d('ppl3-legs', l('Legs & core', 'Ноги та корпус', 'Ноги и корпус'), [e('goblet-squat', 3, 10, 120), e('rdl', 2, 10, 120), e('leg-curl', 2, 12), e('calf', 2, 15, 60), e('deadbug', 2, 6, 60)]),
  ], ['ppl3-push', null, 'ppl3-pull', null, 'ppl3-legs', null, null], ace),

  p('ppl-6-eight-day', l('PPL · 6 sessions / 8 days', 'Жим / Тяга / Ноги · 6 за 8 днів', 'Жим / Тяга / Ноги · 6 за 8 дней'), 'ppl', l(
    'An eight-day rotation: push, pull, legs, rest, then a second variation and rest. Six sessions per eight days, not per calendar week. For experienced trainees who recover well; keep the modest starting volume and add rest when needed.',
    'Восьмиденне коло: жим, тяга, ноги, відпочинок, потім друга варіація та відпочинок. Шість занять за вісім днів, а не за календарний тиждень. Для досвідчених із достатнім відновленням; починайте з помірного обсягу та додавайте відпочинок за потреби.',
    'Восьмидневный круг: жим, тяга, ноги, отдых, затем вторая вариация и отдых. Шесть занятий за восемь дней, а не за календарную неделю. Для опытных с достаточным восстановлением; начинайте с умеренного объёма и добавляйте отдых по необходимости.',
  ), [
    d('ppl6-push-a', l('Push A', 'Жим A', 'Жим A'), [e('bench', 2, 8, 150), e('ohp', 2, 10, 120), e('lateral', 2, 12, 60), e('pushdown', 2, 12, 60)]),
    d('ppl6-pull-a', l('Pull A', 'Тяга A', 'Тяга A'), [e('pulldown', 2, 10, 120), e('row', 2, 10, 120), e('curl', 2, 12, 60)]),
    d('ppl6-legs-a', l('Legs A', 'Ноги A', 'Ноги A'), [e('squat', 2, 8, 150), e('rdl', 2, 10, 120), e('leg-curl', 2, 12), e('calf', 2, 15, 60)]),
    d('ppl6-push-b', l('Push B', 'Жим B', 'Жим B'), [e('db-press', 2, 10, 120), e('ohp', 2, 8, 120), e('lateral', 2, 12, 60), e('pushdown', 2, 12, 60)]),
    d('ppl6-pull-b', l('Pull B', 'Тяга B', 'Тяга B'), [e('row', 2, 10, 120), e('pulldown', 2, 12, 120), e('curl', 2, 12, 60)]),
    d('ppl6-legs-b', l('Legs B', 'Ноги B', 'Ноги B'), [e('goblet-squat', 2, 10, 120), e('split-squat', 2, 10), e('leg-curl', 2, 12), e('bridge', 2, 12, 60), e('calf', 2, 15, 60)]),
  ], ['ppl6-push-a', 'ppl6-pull-a', 'ppl6-legs-a', null, 'ppl6-push-b', 'ppl6-pull-b', 'ppl6-legs-b', null], ace),
];
