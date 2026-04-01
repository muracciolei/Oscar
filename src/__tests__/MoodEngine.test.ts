import { describe, it, expect, beforeEach } from 'vitest';
import { MoodEngine } from '../src/personality/MoodEngine';

describe('MoodEngine', () => {
  let engine: MoodEngine;

  beforeEach(() => {
    engine = new MoodEngine();
  });

  describe('Basic mood detection', () => {
    it('should detect happy mood from positive keywords', () => {
      const result = engine.detectMood('I feel great today!');
      expect(result.mood).toBe('happy');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.keywords).toContain('great');
    });

    it('should detect sad mood from negative keywords', () => {
      const result = engine.detectMood('I feel sad and lonely');
      expect(result.mood).toBe('sad');
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should detect neutral when no keywords match', () => {
      const result = engine.detectMood('The weather is nice outside');
      expect(result.mood).toBe('neutral');
      expect(result.confidence).toBe(0);
    });
  });

  describe('Negation handling (🎯 #2)', () => {
    it('should flip happy mood when negation is present', () => {
      const result = engine.detectMood("I'm not happy");
      expect(result.mood).toBe('sad');
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should handle "never happy" pattern', () => {
      const result = engine.detectMood('I never feel happy');
      expect(result.mood).toBe('sad');
    });

    it('should handle "dont" contraction', () => {
      const result = engine.detectMood("I dont feel great");
      expect(result.mood).toBe('sad');
    });

    it('should handle Spanish negation "no"', () => {
      const result = engine.detectMood('No estoy feliz');
      expect(result.mood).toBe('sad');
    });
  });

  describe('Multilingual support', () => {
    it('should detect Spanish mood keywords', () => {
      const result = engine.detectMood('Estoy muy feliz');
      expect(result.mood).toBe('happy');
    });

    it('should detect Italian mood keywords', () => {
      const result = engine.detectMood('Mi sento felice');
      expect(result.mood).toBe('happy');
    });

    it('should detect tired in Spanish', () => {
      const result = engine.detectMood('Estoy cansado');
      expect(result.mood).toBe('tired');
    });
  });

  describe('Confidence scoring', () => {
    it('should increase confidence with more matching keywords', () => {
      const singleResult = engine.detectMood('I am happy');
      const multipleResult = engine.detectMood('I am happy great and amazing');

      expect(multipleResult.confidence).toBeGreaterThan(singleResult.confidence);
    });

    it('should cap confidence at 1.0', () => {
      const result = engine.detectMood('happy happy happy happy happy happy');
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('getTone()', () => {
    it('should return cheerful tone for happy mood', () => {
      engine.setCurrentMood('happy');
      expect(engine.getTone()).toBe('cheerful');
    });

    it('should return gentle tone for sad/tired/angry', () => {
      engine.setCurrentMood('sad');
      expect(engine.getTone()).toBe('gentle');

      engine.setCurrentMood('tired');
      expect(engine.getTone()).toBe('gentle');

      engine.setCurrentMood('angry');
      expect(engine.getTone()).toBe('gentle');
    });

    it('should return calm tone for neutral', () => {
      engine.setCurrentMood('neutral');
      expect(engine.getTone()).toBe('calm');
    });
  });

  describe('getCurrentMood / setCurrentMood', () => {
    it('should persist mood state', () => {
      engine.setCurrentMood('happy');
      expect(engine.getCurrentMood()).toBe('happy');

      engine.setCurrentMood('sad');
      expect(engine.getCurrentMood()).toBe('sad');
    });
  });

  describe('Injectable randomFn for testing (🎯 #8)', () => {
    it('should accept injectable random function', () => {
      let callCount = 0;
      const mockRandom = () => {
        callCount++;
        return 0.5;
      };

      const result = engine.detectMood('I am happy', mockRandom);
      // The mock should be available if the function signature accepts it
      expect(result.mood).toBeDefined();
    });
  });
});
