import { en } from './dictionaries/en';

export type Dictionary = typeof en;

const dictionaries = {
  en: () => en,
};

export const getDictionary = async (locale: 'en' = 'en') => {
  return dictionaries[locale]();
};
