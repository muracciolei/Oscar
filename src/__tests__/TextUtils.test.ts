import { describe, it, expect } from 'vitest';
import { normalizeText, hasNegation, levenshteinDistance, escapeHtml } from '../src/utils/text';

describe('Text Utilities (🎯 #6)', () => {
  describe('normalizeText()', () => {
    it('should convert to lowercase', () => {
      expect(normalizeText('HELLO').toLowerCase()).toBe('hello');
    });

    it('should remove diacritical marks (NFD)', () => {
      expect(normalizeText('café')).not.toContain('é');
      expect(normalizeText('niño')).not.toContain('ñ');
    });

    it('should remove special punctuation', () => {
      const result = normalizeText('Hello, world!');
      expect(result).not.toContain(',');
      expect(result).not.toContain('!');
    });

    it('should collapse multiple spaces', () => {
      expect(normalizeText('hello    world')).toBe('hello world');
    });

    it('should preserve apostrophes for contractions', () => {
      expect(normalizeText("don't")).toContain("'");
    });

    it('should trim whitespace', () => {
      expect(normalizeText('  hello  ')).toBe('hello');
    });
  });

  describe('hasNegation()', () => {
    it('should detect "not" negation', () => {
      expect(hasNegation('I am not happy')).toBe(true);
    });

    it('should detect "no" negation', () => {
      expect(hasNegation('No, I do not agree')).toBe(true);
    });

    it('should detect "never" negation', () => {
      expect(hasNegation('I never said that')).toBe(true);
    });

    it('should detect "dont" (no apostrophe)', () => {
      expect(hasNegation('I dont care')).toBe(true);
    });

    it('should detect "won\'t"', () => {
      expect(hasNegation("I won't do it")).toBe(true);
    });

    it('should detect "can\'t"', () => {
      expect(hasNegation("I can't believe it")).toBe(true);
    });

    it('should return false for positive text', () => {
      expect(hasNegation('I am very happy')).toBe(false);
      expect(hasNegation('This is fantastic')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(hasNegation('NOT HAPPY')).toBe(true);
      expect(hasNegation('NoT HAPPY')).toBe(true);
    });
  });

  describe('levenshteinDistance()', () => {
    it('should return 0 for identical strings', () => {
      expect(levenshteinDistance('hello', 'hello')).toBe(0);
    });

    it('should handle single character difference', () => {
      expect(levenshteinDistance('hello', 'hallo')).toBe(1);
    });

    it('should handle multiple differences', () => {
      expect(levenshteinDistance('sat', 'cat')).toBe(1); // 1 substitution
      expect(levenshteinDistance('kitten', 'sitting')).toBe(3); // 3 operations
    });

    it('should handle empty strings', () => {
      expect(levenshteinDistance('', 'hello')).toBe(5);
      expect(levenshteinDistance('hello', '')).toBe(5);
      expect(levenshteinDistance('', '')).toBe(0);
    });

    it('should be symmetric', () => {
      expect(levenshteinDistance('abc', 'def')).toBe(levenshteinDistance('def', 'abc'));
    });

    it('should detect typos (helo -> hello)', () => {
      const distance = levenshteinDistance('helo', 'hello');
      expect(distance).toBeLessThanOrEqual(1); // One insertion needed
    });
  });

  describe('escapeHtml() - XSS Prevention', () => {
    it('should escape ampersand', () => {
      expect(escapeHtml('a & b')).toBe('a &amp; b');
    });

    it('should escape less-than', () => {
      expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
    });

    it('should escape greater-than', () => {
      expect(escapeHtml('5 > 3')).toBe('5 &gt; 3');
    });

    it('should escape double quotes', () => {
      expect(escapeHtml('He said "hi"')).toBe('He said &quot;hi&quot;');
    });

    it('should escape single quotes', () => {
      expect(escapeHtml("It's fine")).toBe('It&#039;s fine');
    });

    it('should escape XSS attack', () => {
      const xss = '<img src=x onerror="alert(1)">';
      const escaped = escapeHtml(xss);
      expect(escaped).not.toContain('<');
      expect(escaped).not.toContain('>');
    });

    it('should preserve normal text', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World');
    });
  });

  describe('Integration - Mood Detection with normalization', () => {
    it('should normalize before detecting mood', () => {
      // Simulating normalizeText used in MoodEngine
      const text = normalizeText('I\'m so HAPPY!!!');
      expect(text.toLowerCase()).toContain('happy');
      expect(text).not.toContain('!');
    });

    it('should detect negation after normalization', () => {
      const text = 'I\'m NOT happy';
      expect(hasNegation(text)).toBe(true);
      const normalized = normalizeText(text);
      expect(hasNegation(normalized)).toBe(true);
    });
  });
});
