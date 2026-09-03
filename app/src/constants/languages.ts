export interface Language {
  id: string;
  name: string;
  nativeName: string;
}

export const LANGUAGES: Language[] = [
  { id: 'en', name: 'English', nativeName: 'Default' },
  { id: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { id: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { id: 'ur', name: 'Urdu', nativeName: 'اردو' },
];

export function getLanguageCode(id: string): string {
  const lang = LANGUAGES.find((l) => l.id === id);
  if (!lang) return 'EN';
  return lang.name.slice(0, 2).toUpperCase();
}
