import { useMemo } from 'react';
import { translateText } from './translateName';

export function useTranslatedNames(
  items: { id: string; name: string }[],
  lang: 'de' | 'en'
): Record<string, string> {
  return useMemo(() => {
    const result: Record<string, string> = {};
    (items ?? []).forEach((item) => {
      result[item.id] = translateText(item.name, lang);
    });
    return result;
  }, [lang, (items ?? []).map((i) => i.id + i.name).join(',')]);
}
