/** 🎮 Barrel Exports - Centralized Module Access */

// Core Application
export { OscarApp } from './main';

// Memory & Storage
export { MemoryManager } from './memory/MemoryManager';

// Language & Localization
export { LanguageManager } from './language/LanguageManager';
export type { LanguageCode } from './types';

// Personality & Emotions
export { MoodEngine } from './personality/MoodEngine';
export { RandomEvents } from './personality/RandomEvents';
export type { MoodDetectionResult } from './personality/MoodEngine';

// Intent Matching & Response Generation
export { IntentMatcher } from './engine/IntentMatcher';
export { ResponseGenerator } from './engine/ResponseGenerator';
export type { MatchResult } from './engine/IntentMatcher';

// UI Components
export { TerminalUI } from './ui/TerminalUI';
export { BootSequence } from './ui/BootSequence';
export { TypingIndicator } from './ui/TypingIndicator';
export type { TerminalMessage, TerminalLabels } from './ui/TerminalUI';

// Type Definitions (🎯 #5)
export type { SupportedLanguage, MoodState, MessageSender, MemoryState, MemoryMessage } from './types';

// Configuration (🎯 #6 + #15)
export * from './config';

// Text Utilities (🎯 #6)
export { normalizeText, hasNegation, levenshteinDistance, escapeHtml } from './utils/text';
