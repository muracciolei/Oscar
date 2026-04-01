import { describe, expect, it } from 'vitest';
import { IntentMatcher } from '../src/engine/IntentMatcher';

describe('IntentMatcher', () => {
  it('matches explicit name statements with high priority', () => {
    const matcher = new IntentMatcher();
    const result = matcher.match('hello, my name is Ivan');

    expect(result).not.toBeNull();
    expect(result?.intentId).toBe('name_statement');
    expect(result?.captures[0]).toBe('Ivan');
    expect(result?.priority).toBeGreaterThan(80);
  });

  it('supports typo-tolerant fuzzy keyword matching', () => {
    const matcher = new IntentMatcher();
    const result = matcher.match('helllo');

    expect(result).not.toBeNull();
    expect(result?.intentId).toBe('greeting');
    expect(result?.isFuzzy).toBe(true);
  });
});
