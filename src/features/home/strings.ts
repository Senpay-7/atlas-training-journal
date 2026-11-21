import type { Language, Localized } from '../../domain/models';
const text = {
  morning: ['Good morning', 'Доброго ранку', 'Доброе утро'], afternoon: ['Good afternoon', 'Доброго дня', 'Добрый день'], evening: ['Good evening', 'Доброго вечора', 'Добрый вечер'],
  today: ['Today', 'Сьогодні', 'Сегодня'], training: ['TRAINING DAY', 'ТРЕНУВАЛЬНИЙ ДЕНЬ', 'ТРЕНИРОВОЧНЫЙ ДЕНЬ'],
  recovery: ['RECOVERY DAY', 'ДЕНЬ ВІДНОВЛЕННЯ', 'ДЕНЬ ВОССТАНОВЛЕНИЯ'], ready: ['YOUR TRAINING SPACE', 'ТВІЙ ТРЕНУВАЛЬНИЙ ПРОСТІР', 'ТВОЁ ТРЕНИРОВОЧНОЕ ПРОСТРАНСТВО'],
  running: ['IN PROGRESS', 'ТРИВАЄ ТРЕНУВАННЯ', 'ИДЁТ ТРЕНИРОВКА'], complete: ['RECORDED', 'ЗБЕРЕЖЕНО', 'СОХРАНЕНО'],
  startTitle: ['Start with a program.', 'Почни з програми.', 'Начни с программы.'],
  startBody: ['Choose a program or build your own. Your journal starts with the first session.', 'Обери програму або створи власну. Журнал почнеться з першого заняття.', 'Выбери программу или создай свою. Журнал начнётся с первого занятия.'],
  recoveryTitle: ['Room to recover.', 'Час відновитися.', 'Время восстановиться.'],
  recoveryBody: ['Your plan includes time off. The next workout stays in your schedule.', 'Твій план передбачає відпочинок. Наступне заняття залишається в розкладі.', 'Твой план предусматривает отдых. Следующее занятие остаётся в расписании.'],
  exercises: ['exercises', 'вправ', 'упражнений'], minutes: ['min · estimate', 'хв · орієнтовно', 'мин · примерно'],
  week: ['This week', 'Цього тижня', 'На этой неделе'], logged: ['logged', 'завершено', 'завершено'],
  upcoming: ['UP NEXT', 'НАСТУПНЕ ЗАНЯТТЯ', 'СЛЕДУЮЩЕЕ ЗАНЯТИЕ'], progress: ['Your progression', 'Твій розвиток', 'Твой прогресс'],
  history: ['Training journal', 'Журнал тренувань', 'Журнал тренировок'], open: ['View all', 'Уся історія', 'Вся история'],
  empty: ['Your first completed workout will appear here.', 'Тут з’явиться перше завершене тренування.', 'Здесь появится первая завершённая тренировка.'],
  planned: ['Planned', 'Заплановано', 'Запланировано'], rest: ['Recovery', 'Відновлення', 'Восстановление'],
  noPlan: ['No program', 'Без програми', 'Без программы'], allTime: ['All time', 'За весь час', 'За всё время'],
} as const;
export const homeText = (language: Language, key: keyof typeof text) => text[key][language === 'en' ? 0 : language === 'uk' ? 1 : 2];
export function exerciseCount(language: Language, count: number) {
  const form = count % 10 === 1 && count % 100 !== 11 ? 0 : [2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100) ? 1 : 2;
  const noun = language === 'en' ? count === 1 ? 'exercise' : 'exercises' : (language === 'uk' ? ['вправа', 'вправи', 'вправ'] : ['упражнение', 'упражнения', 'упражнений'])[form];
  return `${count} ${noun}`;
}
export const muscleNames: Record<string, Localized> = {
  quads:{en:'Quads',uk:'Квадрицепси',ru:'Квадрицепсы'}, glutes:{en:'Glutes',uk:'Сідниці',ru:'Ягодицы'},
  chest:{en:'Chest',uk:'Груди',ru:'Грудь'}, triceps:{en:'Triceps',uk:'Трицепси',ru:'Трицепсы'},
  back:{en:'Back',uk:'Спина',ru:'Спина'}, biceps:{en:'Biceps',uk:'Біцепси',ru:'Бицепсы'},
  hamstrings:{en:'Hamstrings',uk:'Задня поверхня стегна',ru:'Задняя поверхность бедра'},
  shoulders:{en:'Shoulders',uk:'Плечі',ru:'Плечи'}, calves:{en:'Calves',uk:'Литки',ru:'Икры'}, core:{en:'Core',uk:'Корпус',ru:'Корпус'},
  abs:{en:'Abs',uk:'Прес',ru:'Пресс'},
};
