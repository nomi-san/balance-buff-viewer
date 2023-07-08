import { fallback, translations } from './trans.json';

type Trans = typeof translations['en'];
type TransId = keyof Trans;

let current: Trans;

export function loadTranslation() {
  let lang = document.body.dataset['lang'] as string;
  if (lang === 'vn') lang = 'vi';
  if (lang === 'zh') lang = 'zh-CN';

  // @ts-ignore
  current = translations[lang] || translations[fallback];
}

export function _t(id: TransId, next?: any) {
  const text: string = current[id] || `{{${id}}}`;
  if (next) return `${text} ${next}`;
  return text;
}