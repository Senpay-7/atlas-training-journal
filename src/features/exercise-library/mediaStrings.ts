import { localize, type Language } from '../../domain/models';

const strings = {
  illustration: { en: 'Exercise illustration', uk: 'Ілюстрація вправи', ru: 'Иллюстрация упражнения' },
  missing: { en: 'Illustration coming later', uk: 'Ілюстрація з’явиться пізніше', ru: 'Иллюстрация появится позже' },
  source: { en: 'Artwork source', uk: 'Джерело ілюстрацій', ru: 'Источник иллюстраций' },
  license: { en: 'Artwork license', uk: 'Ліцензія ілюстрацій', ru: 'Лицензия иллюстраций' },
  creditNote: { en: 'Illustrations by Bryl Lim; original poses by Everkinetic. Unmodified PNG artwork, scaled to fit.', uk: 'Ілюстрації: Bryl Lim; оригінальні пози: Everkinetic. PNG без змін, масштабовані для показу.', ru: 'Иллюстрации: Bryl Lim; исходные позы: Everkinetic. PNG без изменений, масштабированы для показа.' },
  technique: { en: 'Movement notes', uk: 'Про рух', ru: 'О движении' },
  preview: { en: 'In your workout', uk: 'У твоєму тренуванні', ru: 'В твоей тренировке' },
  discover: { en: 'Explore the movements', uk: 'Познайомся з рухами', ru: 'Познакомься с движениями' },
  open: { en: 'View exercise', uk: 'Відкрити вправу', ru: 'Открыть упражнение' },
  muscles: { en: 'Muscle groups', uk: 'Групи м’язів', ru: 'Группы мышц' },
} as const;
export const mediaText = (language: Language, key: keyof typeof strings) => localize(strings[key], language);
