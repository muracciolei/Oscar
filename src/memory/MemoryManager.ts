import { SupportedLanguage, MoodState, MemoryMessage, MemoryState } from '../types';
import { MAX_MESSAGES, STORAGE_KEY, PERSIST_DEBOUNCE_MS } from '../config';

const DEFAULT_STATE: MemoryState = {
  userName: null,
  language: 'en',
  recentMessages: [],
  userPreferences: {},
  mood: 'neutral',
  lastIntent: null,
};

function cloneDefaultState(): MemoryState {
  return {
    userName: DEFAULT_STATE.userName,
    language: DEFAULT_STATE.language,
    recentMessages: [],
    userPreferences: {},
    mood: DEFAULT_STATE.mood,
    lastIntent: DEFAULT_STATE.lastIntent,
  };
}

export class MemoryManager {
  private readonly storageKey: string;
  private state: MemoryState;
  private persistTimer: number | null = null;

  constructor(storageKey: string = STORAGE_KEY) {
    this.storageKey = storageKey;
    this.state = this.load();
  }

  getState(): MemoryState {
    return {
      ...this.state,
      recentMessages: this.state.recentMessages.map((message) => ({ ...message })),
      userPreferences: { ...this.state.userPreferences },
    };
  }

  getUserName(): string | null {
    return this.state.userName;
  }

  setUserName(name: string): void {
    const cleaned = name.trim().slice(0, 40);
    if (!cleaned) {
      return;
    }
    this.state.userName = cleaned;
    this.schedulePersist();
  }

  getLanguage(): SupportedLanguage {
    return this.state.language;
  }

  setLanguage(language: SupportedLanguage): void {
    this.state.language = language;
    this.schedulePersist();
  }

  addMessage(message: MemoryMessage): void {
    this.state.recentMessages.push(message);
    if (this.state.recentMessages.length > MAX_MESSAGES) {
      this.state.recentMessages = this.state.recentMessages.slice(-MAX_MESSAGES);
    }
    this.schedulePersist();
  }

  getRecentMessages(limit: number = MAX_MESSAGES): MemoryMessage[] {
    return this.state.recentMessages.slice(-limit).map((message) => ({ ...message }));
  }

  setPreference(key: string, value: string): void {
    this.state.userPreferences[key] = value;
    this.schedulePersist();
  }

  getPreference(key: string): string | null {
    return this.state.userPreferences[key] ?? null;
  }

  setMood(mood: MoodState): void {
    this.state.mood = mood;
    this.schedulePersist();
  }

  getMood(): MoodState {
    return this.state.mood;
  }

  setLastIntent(intentId: string): void {
    this.state.lastIntent = intentId;
    this.schedulePersist();
  }

  getLastIntent(): string | null {
    return this.state.lastIntent;
  }

  reset(): void {
    this.state = cloneDefaultState();
    this.persist();
  }

  /** 🎯 #9 Fix: Debounce persist() to batch localStorage writes */
  private schedulePersist(): void {
    if (this.persistTimer !== null) {
      clearTimeout(this.persistTimer);
    }
    this.persistTimer = window.setTimeout(() => {
      this.persist();
      this.persistTimer = null;
    }, PERSIST_DEBOUNCE_MS);
  }

  private load(): MemoryState {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) {
        return cloneDefaultState();
      }

      const parsed = JSON.parse(raw) as Partial<MemoryState>;
      const merged: MemoryState = {
        ...DEFAULT_STATE,
        ...parsed,
      };

      if (!this.isValidLanguage(merged.language)) {
        merged.language = 'en';
      }

      if (!this.isValidMood(merged.mood)) {
        merged.mood = 'neutral';
      }

      if (!Array.isArray(merged.recentMessages)) {
        merged.recentMessages = [];
      }

      merged.recentMessages = merged.recentMessages
        .filter((msg) => this.isValidMessage(msg))
        .slice(-MAX_MESSAGES);

      if (!merged.userPreferences || typeof merged.userPreferences !== 'object') {
        merged.userPreferences = {};
      }

      return merged;
    } catch {
      // Safe reset in case of corrupted localStorage.
      const fallback = cloneDefaultState();
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(fallback));
      } catch {
        // Ignore localStorage write failures.
      }
      return fallback;
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch {
      // Ignore persistence failures and keep in-memory state.
    }
  }

  private isValidLanguage(value: unknown): value is SupportedLanguage {
    return value === 'en' || value === 'es' || value === 'it';
  }

  private isValidMood(value: unknown): value is MoodState {
    return value === 'happy' || value === 'sad' || value === 'tired' || value === 'angry' || value === 'neutral';
  }

  private isValidMessage(value: unknown): value is MemoryMessage {
    if (!value || typeof value !== 'object') {
      return false;
    }
    const candidate = value as Record<string, unknown>;
    return (
      (candidate.sender === 'user' || candidate.sender === 'oscar') &&
      typeof candidate.text === 'string' &&
      typeof candidate.timestamp === 'string'
    );
  }
}
