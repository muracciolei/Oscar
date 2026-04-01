/** 🎨 Unified Type Definitions for Oscar v2.0 */

export type SupportedLanguage = 'en' | 'es' | 'it';
export type LanguageCode = SupportedLanguage; // Alias for backward compatibility

export type MoodState = 'happy' | 'sad' | 'tired' | 'angry' | 'neutral';
export type MessageSender = 'user' | 'oscar';

export interface MemoryMessage {
  sender: MessageSender;
  text: string;
  timestamp: string;
  intentId?: string;
}

export interface MemoryState {
  userName: string | null;
  language: SupportedLanguage;
  recentMessages: MemoryMessage[];
  userPreferences: Record<string, string>;
  mood: MoodState;
  lastIntent: string | null;
}

export interface TerminalMessage {
  sender: MessageSender;
  text: string;
  timestamp: string;
}

export interface LanguageOption {
  code: LanguageCode;
  label: string;
}
