"use client";

import { en } from './dictionaries/en';

// For a lightweight approach with just English, we can simply return the dictionary.
// If multiple languages are added later, this can be refactored to use a React Context
// without needing to change any component that consumes it.
export const useTranslation = () => {
  return { t: en };
};
