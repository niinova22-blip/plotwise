import { deviceLang, dictionaries, type Dict, type Lang } from '@/i18n';
import { useStore } from '@/store/app-store';

export function useI18n(): { s: Dict; lang: Lang } {
  const pref = useStore().data.profile.lang;
  const lang = pref ?? deviceLang();
  return { s: dictionaries[lang], lang };
}
