import { MoodState } from '../types';
import { normalizeText, hasNegation } from '../utils/text';
import { MOOD_KEYWORDS, MOOD_CONFIDENCE_THRESHOLD } from '../config';

export interface MoodDetectionResult {
  mood: MoodState;
  confidence: number;
  keywords: string[];
}

export class MoodEngine {
  private currentMood: MoodState = 'neutral';

  /** 🎯 #2 Fix: Detects mood with negation awareness
   * "I'm not happy" now correctly registers as negative/sad mood
   */
  detectMood(input: string, randomFn: () => number = Math.random): MoodDetectionResult {
    const normalized = normalizeText(input);
    const hasNeg = hasNegation(input);

    const scores: Record<MoodState, number> = {
      happy: 0,
      sad: 0,
      tired: 0,
      angry: 0,
      neutral: 0,
    };

    const matchedKeywords: string[] = [];

    (Object.keys(MOOD_KEYWORDS) as Array<Exclude<MoodState, 'neutral'>>).forEach((mood) => {
      for (const keyword of MOOD_KEYWORDS[mood]) {
        if (normalized.includes(keyword)) {
          scores[mood] += 1;
          matchedKeywords.push(keyword);
        }
      }
    });

    // If negation found, invert the mood detection
    if (hasNeg && (scores.happy > 0)) {
      // Flip happy → sad
      [scores.happy, scores.sad] = [scores.sad, scores.happy];
    }

    const ranked = (Object.entries(scores) as [MoodState, number][])
      .sort((a, b) => b[1] - a[1]);

    const [bestMood, bestScore] = ranked[0];
    const secondScore = ranked[1][1];

    if (bestScore === 0 || bestScore === secondScore) {
      this.currentMood = 'neutral';
      return { mood: 'neutral', confidence: 0, keywords: [] };
    }

    const confidence = Math.min(1, bestScore / 3);
    this.currentMood = confidence >= MOOD_CONFIDENCE_THRESHOLD ? bestMood : 'neutral';

    return {
      mood: this.currentMood,
      confidence,
      keywords: matchedKeywords,
    };
  }

  getCurrentMood(): MoodState {
    return this.currentMood;
  }

  setCurrentMood(mood: MoodState): void {
    this.currentMood = mood;
  }

  /**
   * Return a simple tone hint for response generation.
   */
  getTone(): 'cheerful' | 'gentle' | 'calm' {
    if (this.currentMood === 'happy') return 'cheerful';
    if (this.currentMood === 'sad' || this.currentMood === 'tired' || this.currentMood === 'angry') {
      return 'gentle';
    }
    return 'calm';
  }
}
