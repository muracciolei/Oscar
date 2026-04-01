/** ⚙️ Configuration Constants for Oscar v2.0 */

// Storage
export const MAX_MESSAGES = 50;
export const STORAGE_KEY = 'oscar_terminal_memory_v1';
export const MAX_INPUT_LENGTH = 500;
export const LOCAL_STORAGE_QUOTA_WARNING = 4 * 1024 * 1024; // 4MB warning threshold

// Memory & Performance
export const PERSIST_DEBOUNCE_MS = 500; // Batch localStorage writes
export const EVENT_COOLDOWN_MS = 60_000; // Can't show same event twice in 1 minute
export const GLOBAL_EVENT_CHANCE = 0.03; // 3% chance per message for random event

// Response Generation
export const FOLLOW_UP_PROBABILITY = 0.35; // 35% chance to append a follow-up question
export const MOOD_CONFIDENCE_THRESHOLD = 0.34; // Minimum confidence to register mood

// UI
export const BOOT_SEQUENCE_DURATION_MS = 3000; // Startup animation duration
export const CLOCK_UPDATE_INTERVAL_MS = 1000; // Update clock every second
export const CRT_FLICKER_DURATION_MS = 150; // CRT flicker animation speed

// Mood Detection
export const MOOD_KEYWORDS = {
  happy: [
    'happy', 'great', 'awesome', 'amazing', 'good', 'excited',
    'feliz', 'genial', 'contento', 'contenta',
    'felice', 'bene', 'benissimo',
  ],
  sad: [
    'sad', 'down', 'depressed', 'lonely',
    'triste', 'mal', 'deprimido', 'deprimida',
    'triste', 'male', 'giu',
  ],
  tired: [
    'tired', 'exhausted', 'sleepy',
    'cansado', 'agotado', 'sueno',
    'stanco', 'esausto', 'assonnato',
  ],
  angry: [
    'angry', 'mad', 'furious', 'annoyed',
    'enfadado', 'enojado', 'furioso',
    'arrabbiato', 'furioso', 'nervoso',
  ],
};

// Accessibility
export const SUPPORTS_REDUCED_MOTION = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
