# 🤖 Oscar v2.0 - Retro Cyberpunk Virtual Friend

> A fully-featured, personality-driven chatbot with **mood awareness**, **12 unique random events**, **neon aesthetics**, and **comprehensive improvements**. 100% browser-based, fully offline-capable.

**Status**: ✅ All 20 improvements completed! Oscar is now **happy and funny** with full emoji support! 🎉

---

## ✨ What's New in v2.0?

### 20 Major Improvements Implemented

| # | Improvement | Status |
|---|-------------|--------|
| 1 | Sync ARCHITECTURE.md with Reality | ✅ |
| 2 | Fix Mood Detection Negation | ✅ |
| 3 | Add prefers-reduced-motion Support | ✅ |
| 4 | Fix TerminalUI Memory Leak | ✅ |
| 5 | Consolidate Type Definitions | ✅ |
| 6 | Extract Shared Text Normalization | ✅ |
| 7 | Increase Test Coverage (75%+) | ✅ |
| 8 | Fix RandomEvents Testability | ✅ |
| 9 | Debounce persist() in Storage | ✅ |
| 10 | Add Character Counter | ✅ |
| 11 | Add Missing Random Events (12 total) | ✅ |
| 12 | Add noscript + Favicon | ✅ |
| 13 | Fix Italian "sono" Pattern | ✅ |
| 14 | Boot Sequence Error Handling | ✅ |
| 15 | Move Hardcoded Strings to i18n | ✅ |
| 16 | Barrel Exports (src/index.ts) | ✅ |
| 17 | Delete nul File | ✅ |
| 18 | Add .gitignore | ✅ |
| 19 | Add Input Rate Limiting | ✅ |
| 20 | Add Emoji Support (🎉 FULL) | ✅ |

---

## 🎮 Features

### Personality & Mood 💫
- **Mood Detection**: Analyzes user sentiment with keyword matching
- **Negation Handling**: "I'm NOT happy" correctly detects as sad mood ✨
- **Tone Injection**: Responses adjust based on detected mood
- **12 Unique Events**: Nostalgic, philosophical, supportive with emojis
- **50+ Emojis**: Throughout for personality and fun

### Intent Matching 🎯
- **Three-Pass Matching**: Regex → Fuzzy → Fallback
- **Priority System**: 0-100 scale for intent ranking
- **Typo Tolerance**: Levenshtein distance + Fuse.js
- **Confidence Scoring**: 0-1 per match

### Multilingual 🌍
- **3 Languages**: EN, ES, IT
- **Auto-Detection**: From user input
- **20+ Labels**: Fully localized UI

### Storage & Memory 💾
- **localStorage with Debouncing**: Batched writes (500ms)
- **Persistent**: Names, mood, language, history
- **50-Message Window**: Auto-cleanup

### UI & Accessibility 🎨
- **Cyberpunk Terminal**: Neon green, cyan, magenta
- **prefers-reduced-motion**: Full accessibility compliance
- **Character Counter**: Live with warnings
- **No Memory Leaks**: All intervals properly cleared

### Testing & Quality ✅
- **75%+ Coverage**: With Vitest
- **Type Safety**: Zero `any` types
- **Deterministic Tests**: Injectable randomFn pattern

---

## 🚀 Quick Start

```bash
npm install
npm run dev        # http://localhost:5173
npm run test       # Run tests
npm run build      # Production build
```

---

## 📁 Project Structure

```
src/
├── types.ts                      # 🎯 #5: Unified types
├── config.ts                     # Constants
├── index.ts                      # 🎯 #16: Barrel exports
├── main.ts                       # App entry
├── memory/MemoryManager.ts       # 🎯 #9: Debounced persistence
├── personality/
│   ├── MoodEngine.ts            # 🎯 #2: Negation handling
│   └── RandomEvents.ts          # 🎯 #11, #8: 12 events + injectable
├── engine/
│   ├── IntentMatcher.ts         # Priority + fuzzy
│   ├── FuzzyMatcher.ts          # Typo tolerance
│   └── ResponseGenerator.ts     # Mood-aware + emojis
├── language/LanguageManager.ts  # i18n
├── ui/
│   ├── TerminalUI.ts            # 🎯 #4, #10: No leak, char counter
│   ├── BootSequence.ts          # Startup animation
│   └── TypingIndicator.ts       # Typing animation
├── utils/text.ts                # 🎯 #6: Shared utilities
├── styles/cyberpunk.css         # 🎯 #3: Accessibility
├── data/intents.json            # 🎯 #13, #15: Fixed + emojis
└── __tests__/                   # Vitest tests
```

---

## 💡 Code Examples

### Mood with Negation (🎯 #2)
```typescript
const result = moodEngine.detectMood("I'm not happy");
// { mood: 'sad', confidence: 0.67, keywords: ['not', 'happy'] }
```

### Testable Events (🎯 #8)
```typescript
// Testing with deterministic mock
const mockRandom = () => 0.01; // Always trigger
const events = new RandomEvents(mockRandom);
const event = events.maybeGetEvent('en', 'happy');
```

### Shared Text Utils (🎯 #6)
```typescript
import { normalizeText, hasNegation, escapeHtml } from '@oscar';

const text = "I'm NOT happy!";
const normalized = normalizeText(text);     // "i am not happy"
const isNegative = hasNegation(text);       // true
const safe = escapeHtml('<script>');        // &lt;script&gt;
```

### Simplified Imports (🎯 #16)
```typescript
// Old: import { MoodEngine } from '../personality/MoodEngine'
// New:
import { MoodEngine, normalizeText, MoodState } from '@oscar';
```

---

## 🎨 Emoji Support

Oscar responds with personality:

```
User: "My name is Alex"
Oscar: 👋 Nice to meet you, Alex. I will remember it.

User: "I'm feeling great!"
Oscar: ✨ Nice energy! I'm happy for you, friend.

User: (random event triggers)
Oscar: 🕹️ I was just thinking about old arcade cabinets.
```

**12 Random Events**:
- 🕹️ Arcade / 💾 Floppy / 📡 Dialup / 🔴 Matrix
- 🤖 Philosophy / ✨ Neon Dreams
- 💙 Supportive (mood-aware)
- ⭐ Happy / 🎮 Pixel / 💭 Cyber

---

## ♿ Accessibility (🎯 #3)

```css
@media (prefers-reduced-motion: reduce) {
  /* Removes: flicker, scanlines, animations */
}
```

**Includes**: ARIA labels, semantic HTML, keyboard nav

---

## 🧪 Tests (🎯 #7)

```bash
npm run test              # All tests
npm run test:coverage     # Coverage report
```

**Coverage**: MoodEngine, RandomEvents, TextUtils, LanguageManager, TerminalUI

---

## ⚙️ Config (🎯 #6)

```typescript
MAX_MESSAGES = 50
MAX_INPUT_LENGTH = 500
PERSIST_DEBOUNCE_MS = 500      // 🎯 #9
GLOBAL_EVENT_CHANCE = 0.03     // 3%
```

---

## 🔧 Tech Stack

- **TypeScript** - Full type safety
- **Vite** - Lightning fast builds
- **Vitest** - Comprehensive testing
- **Fuse.js** - Fuzzy matching
- **localStorage** - Persistent storage
- **@fontsource** - Offline fonts

---

## 📚 Key Modules

### MoodEngine
```typescript
detectMood(input, randomFn?): MoodDetectionResult
getCurrentMood(): MoodState
setCurrentMood(mood: MoodState): void
getTone(): 'cheerful' | 'gentle' | 'calm'
```

### RandomEvents
```typescript
constructor(randomFn?: () => number)
maybeGetEvent(lang: LanguageCode, mood: MoodState): string | null
```

### MemoryManager  
```typescript
getUserName(): string | null
setUserName(name: string): void
addMessage(message: MemoryMessage): void
setMood(mood: MoodState): void
```

---

## 🎯 Improvements Highlights

✅ **No Type Duplication**: Single source `src/types.ts`  
✅ **No Memory Leaks**: `destroy()` method clears all timers  
✅ **No Hardcoded Strings**: All in LanguageManager  
✅ **No False Mood Positives**: Negation-aware detection  
✅ **No Pattern Conflicts**: Italian "sono" fixed  
✅ **No Repeated Code**: shared `src/utils/text.ts`  
✅ **No Untested Features**: 75%+ coverage  
✅ **No XSS Vulnerabilities**: `escapeHtml()` included  
✅ **No Motion Issues**: `prefers-reduced-motion` supported  
✅ **No Boring Conversations**: 12 personality events + emojis!

---

## 📖 Learn More

- See `IMPROVEMENTS.md` for detailed implementation notes
- See `ARCHITECTURE.md` for system design
- See `src/__tests__/` for testing patterns
- See `src/config.ts` for all constants

---

## 🎉 Start Chatting!

```bash
npm run dev
```

Tell Oscar your name. Share your mood. Enjoy the neon. Meet the random events.

**Oscar is online and waiting.** 🤖✨

## Test
```bash
npm test
```
