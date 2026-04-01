import { LanguageCode } from '../language/LanguageManager';
import { MemoryManager } from '../memory/MemoryManager';
import { MoodState } from '../types';
import { FOLLOW_UP_PROBABILITY } from '../config';
import { MatchResult, IntentMatcher } from './IntentMatcher';

/** 🎮 Oscar adds emojis to his responses for personality! */
const TONE_EMOJIS: Record<MoodState, string> = {
  happy: '✨',
  sad: '💙',
  tired: '😴',
  angry: '🔥',
  neutral: '🤖',
};

const FRIEND_WORD: Record<LanguageCode, string> = {
  en: 'friend',
  es: 'amigo',
  it: 'amico',
};

export class ResponseGenerator {
  private readonly matcher: IntentMatcher;
  private readonly memory: MemoryManager;
  private readonly random: () => number;
  private readonly lastResponseByIntent: Map<string, string>;

  constructor(matcher: IntentMatcher, memory: MemoryManager, randomFn: () => number = Math.random) {
    this.matcher = matcher;
    this.memory = memory;
    this.random = randomFn;
    this.lastResponseByIntent = new Map();
  }

  generate(match: MatchResult | null, language: LanguageCode, mood: MoodState): string {
    const dataset = this.matcher.getDataset();

    if (!match) {
      return this.injectTone(this.pickRandom(dataset.fallback[language], 'fallback'), mood, language);
    }

    const intent = this.matcher.getIntentById(match.intentId);
    if (!intent) {
      return this.injectTone(this.pickRandom(dataset.fallback[language], 'fallback'), mood, language);
    }

    this.memory.setLastIntent(intent.id);

    if (intent.id === 'name_statement' && match.captures[0]) {
      this.memory.setUserName(match.captures[0]);
    }

    if (intent.id === 'name_query' && !this.memory.getUserName()) {
      return this.injectTone(this.unknownName(language), mood, language);
    }

    const base = this.pickRandom(intent.responses[language], intent.id);
    const replaced = this.replacePlaceholders(base, language);
    const withTone = this.injectTone(replaced, mood, language);
    return this.maybeAppendFollowUp(withTone, intent.followUps[language]);
  }

  private maybeAppendFollowUp(response: string, followUps: string[]): string {
    if (!followUps.length) {
      return response;
    }
    if (this.random() > FOLLOW_UP_PROBABILITY) {
      return response;
    }
    return `${response} ${followUps[Math.floor(this.random() * followUps.length)]}`;
  }

  private pickRandom(candidates: string[], key: string): string {
    if (!candidates.length) {
      return '...';
    }

    if (candidates.length === 1) {
      this.lastResponseByIntent.set(key, candidates[0]);
      return candidates[0];
    }

    const previous = this.lastResponseByIntent.get(key);
    let selected = candidates[Math.floor(this.random() * candidates.length)];
    let guard = 0;

    while (selected === previous && guard < 8) {
      selected = candidates[Math.floor(this.random() * candidates.length)];
      guard += 1;
    }

    this.lastResponseByIntent.set(key, selected);
    return selected;
  }

  private replacePlaceholders(text: string, language: LanguageCode): string {
    const name = this.memory.getUserName() ?? FRIEND_WORD[language];
    return text.replace(/\{\{name\}\}/g, name);
  }

  private unknownName(language: LanguageCode): string {
    const messages: Record<LanguageCode, string[]> = {
      en: [
        "❓ I don't know your name yet. Tell me with 'my name is ...'.",
        "❓ You have not told me your name yet. I can remember it if you want.",
      ],
      es: [
        "❓ Todavia no se tu nombre. Dime 'me llamo ...'.",
        "❓ Aun no me dijiste tu nombre. Puedo recordarlo si quieres.",
      ],
      it: [
        "❓ Non conosco ancora il tuo nome. Dimmi 'mi chiamo ...'.",
        "❓ Non mi hai ancora detto il tuo nome. Posso ricordarlo se vuoi.",
      ],
    };

    return messages[language][Math.floor(this.random() * messages[language].length)];
  }

  private injectTone(text: string, mood: MoodState, language: LanguageCode): string {
    if (mood === 'neutral') {
      return text;
    }

    const prefixByMood: Record<MoodState, Record<LanguageCode, string>> = {
      happy: {
        en: 'Nice energy. ',
        es: 'Buena energia. ',
        it: 'Bella energia. ',
      },
      sad: {
        en: 'Gentle mode on. ',
        es: 'Modo suave activado. ',
        it: 'Modalita delicata attiva. ',
      },
      tired: {
        en: 'Slow pace mode. ',
        es: 'Modo ritmo lento. ',
        it: 'Modalita ritmo lento. ',
      },
      angry: {
        en: 'Breathing space. ',
        es: 'Espacio para respirar. ',
        it: 'Spazio per respirare. ',
      },
      neutral: {
        en: '',
        es: '',
        it: '',
      },
    };

    return `${prefixByMood[mood][language]}${text}`;
  }
}
