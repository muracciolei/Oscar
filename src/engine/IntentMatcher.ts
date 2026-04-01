import rawIntents from '../data/intents.json';
import { FuzzyMatcher, FuzzyKeywordEntry } from './FuzzyMatcher';
import {
  assertValidIntentDataset,
  IntentDataset,
  IntentDefinition,
} from './IntentSchema';

export interface MatchResult {
  intentId: string;
  captures: string[];
  confidence: number;
  priority: number;
  isFuzzy: boolean;
  matchedKeyword?: string;
}

export class IntentMatcher {
  private readonly dataset: IntentDataset;
  private readonly intents: IntentDefinition[];
  private readonly compiledPatterns: Map<string, RegExp[]>;
  private readonly fuzzyMatcher: FuzzyMatcher;
  private readonly invalidNameWords: Set<string>;

  constructor() {
    this.dataset = assertValidIntentDataset(rawIntents);
    this.intents = [...this.dataset.intents].sort((a, b) => b.priority - a.priority);
    this.compiledPatterns = new Map();
    this.invalidNameWords = this.createInvalidNameWords();

    for (const intent of this.intents) {
      const patterns = intent.patterns
        .map((pattern) => this.tryCompilePattern(pattern))
        .filter((pattern): pattern is RegExp => pattern !== null);
      this.compiledPatterns.set(intent.id, patterns);
    }

    const keywordEntries: FuzzyKeywordEntry[] = [];
    for (const intent of this.intents) {
      for (const keyword of intent.keywords) {
        keywordEntries.push({ intentId: intent.id, keyword: keyword.toLowerCase() });
      }
    }
    this.fuzzyMatcher = new FuzzyMatcher(keywordEntries);
  }

  match(input: string): MatchResult | null {
    const normalized = input.trim();
    if (!normalized) {
      return null;
    }

    const regexMatches: MatchResult[] = [];

    for (const intent of this.intents) {
      const patterns = this.compiledPatterns.get(intent.id) ?? [];
      for (const pattern of patterns) {
        const match = normalized.match(pattern);
        if (!match) {
          continue;
        }

        const captures = match.slice(1).map((part) => part.trim()).filter(Boolean);
        if (intent.id === 'name_statement' && captures[0] && !this.isLikelyName(captures[0])) {
          continue;
        }

        regexMatches.push({
          intentId: intent.id,
          captures,
          confidence: captures.length > 0 ? 0.95 : 0.88,
          priority: intent.priority,
          isFuzzy: false,
        });
        break;
      }
    }

    if (regexMatches.length > 0) {
      regexMatches.sort((a, b) => {
        if (b.priority !== a.priority) return b.priority - a.priority;
        return b.confidence - a.confidence;
      });
      return regexMatches[0];
    }

    const fuzzy = this.fuzzyMatcher.match(normalized);
    if (!fuzzy) {
      return null;
    }

    const intent = this.getIntentById(fuzzy.intentId);
    if (!intent) {
      return null;
    }

    return {
      intentId: intent.id,
      captures: [],
      confidence: Math.min(0.75, fuzzy.confidence),
      priority: intent.priority,
      isFuzzy: true,
      matchedKeyword: fuzzy.keyword,
    };
  }

  getIntentById(intentId: string): IntentDefinition | null {
    return this.intents.find((intent) => intent.id === intentId) ?? null;
  }

  getDataset(): IntentDataset {
    return this.dataset;
  }

  private tryCompilePattern(pattern: string): RegExp | null {
    try {
      return new RegExp(pattern, 'iu');
    } catch {
      return null;
    }
  }

  private isLikelyName(raw: string): boolean {
    const cleaned = raw
      .trim()
      .replace(/[.!?,;:]+$/g, '')
      .replace(/\s+/g, ' ');

    if (!cleaned || cleaned.length < 2 || cleaned.length > 40) {
      return false;
    }

    if (!/^[\p{L}' -]+$/u.test(cleaned) || /\d/.test(cleaned)) {
      return false;
    }

    const words = cleaned.split(' ');
    if (words.length > 3) {
      return false;
    }

    const normalizedWords = words.map((word) =>
      word
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''),
    );

    return normalizedWords.some((word) => !this.invalidNameWords.has(word));
  }

  private createInvalidNameWords(): Set<string> {
    return new Set([
      'good', 'great', 'fine', 'okay', 'ok', 'awesome', 'happy',
      'sad', 'down', 'bad', 'angry', 'mad', 'tired', 'sleepy',
      'bien', 'genial', 'feliz', 'triste', 'mal', 'cansado', 'enfadado',
      'bene', 'felice', 'triste', 'male', 'stanco', 'arrabbiato',
    ]);
  }
}
