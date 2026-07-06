import { de } from './de';
import { en } from './en';

export const T = { de, en } as const;
export type Lang = 'de' | 'en';
