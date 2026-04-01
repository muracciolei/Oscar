import { MemoryManager } from '../memory/MemoryManager';
import { SupportedLanguage, LanguageOption } from '../types';

export type LanguageCode = SupportedLanguage;

const LABELS: Record<string, Record<LanguageCode, string>> = {
  appTitle: {
    en: 'OSCAR TERMINAL',
    es: 'TERMINAL OSCAR',
    it: 'TERMINALE OSCAR',
  },
  appSubtitle: {
    en: 'retro cyberpunk virtual friend',
    es: 'amigo virtual retro cyberpunk',
    it: 'amico virtuale retro cyberpunk',
  },
  online: {
    en: 'ONLINE',
    es: 'EN LINEA',
    it: 'ONLINE',
  },
  inputPlaceholder: {
    en: 'type a message...',
    es: 'escribe un mensaje...',
    it: 'scrivi un messaggio...',
  },
  send: {
    en: 'send',
    es: 'enviar',
    it: 'invia',
  },
  typing: {
    en: 'Oscar is typing',
    es: 'Oscar esta escribiendo',
    it: 'Oscar sta scrivendo',
  },
  languageChanged: {
    en: 'Language switched to English.',
    es: 'Idioma cambiado a Espanol.',
    it: 'Lingua cambiata in Italiano.',
  },
  autoLanguage: {
    en: 'Auto-detected English from your message.',
    es: 'Idioma Espanol detectado automaticamente.',
    it: 'Lingua Italiana rilevata automaticamente.',
  },
  welcome: {
    en: 'Signal locked. Oscar online. What should I call you?',
    es: 'Senal estable. Oscar en linea. Como te llamas?',
    it: 'Segnale stabile. Oscar online. Come ti chiami?',
  },
  welcomeBack: {
    en: 'Welcome back, {{name}}. The terminal missed you.',
    es: 'Bienvenido de nuevo, {{name}}. El terminal te extrano.',
    it: 'Bentornato, {{name}}. Il terminale sentiva la tua mancanza.',
  },
};

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
  { code: 'it', label: 'IT' },
];

export class LanguageManager {
  private currentLanguage: LanguageCode;
  private readonly memory: MemoryManager;

  constructor(memory: MemoryManager) {
    this.memory = memory;
    this.currentLanguage = this.memory.getLanguage();
  }

  getCurrentLanguage(): LanguageCode {
    return this.currentLanguage;
  }

  setLanguage(language: LanguageCode): void {
    this.currentLanguage = language;
    this.memory.setLanguage(language);
  }

  getLabel(key: string): string {
    const row = LABELS[key];
    if (!row) {
      return key;
    }
    return row[this.currentLanguage] ?? row.en ?? key;
  }

  getSupportedLanguages(): LanguageOption[] {
    return SUPPORTED_LANGUAGES;
  }

  /**
   * Optional language auto-detection from user input.
   */
  detectLanguageFromText(input: string): LanguageCode | null {
    const normalized = input
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\p{L}\s']/gu, ' ');

    const score = (terms: string[]): number =>
      terms.reduce((total, term) => total + (normalized.includes(term) ? 1 : 0), 0);

    const scores: Record<LanguageCode, number> = {
      en: score(['hello', 'my name is', 'thanks', 'friend', 'joke', 'weather']),
      es: score(['hola', 'me llamo', 'gracias', 'amigo', 'chiste', 'tiempo']),
      it: score(['ciao', 'mi chiamo', 'grazie', 'amico', 'barzelletta', 'meteo']),
    };

    const ranked = (Object.entries(scores) as [LanguageCode, number][])
      .sort((a, b) => b[1] - a[1]);

    const [best, bestScore] = ranked[0];
    const secondScore = ranked[1][1];

    if (bestScore < 2 || bestScore === secondScore) {
      return null;
    }

    return best;
  }
}
