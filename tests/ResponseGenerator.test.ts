import { describe, expect, it } from 'vitest';
import { IntentMatcher } from '../src/engine/IntentMatcher';
import { ResponseGenerator } from '../src/engine/ResponseGenerator';
import { MemoryManager } from '../src/memory/MemoryManager';

describe('ResponseGenerator', () => {
  it('stores the user name and recalls it later', () => {
    const matcher = new IntentMatcher();
    const memory = new MemoryManager('oscar_test_response_memory_1');
    memory.reset();
    const generator = new ResponseGenerator(matcher, memory, () => 0);

    const nameMatch = matcher.match('my name is Ivan');
    const nameReply = generator.generate(nameMatch, 'en', 'neutral');
    expect(memory.getUserName()).toBe('Ivan');
    expect(nameReply).toContain('Ivan');

    const queryMatch = matcher.match('what is my name');
    const queryReply = generator.generate(queryMatch, 'en', 'neutral');
    expect(queryReply).toContain('Ivan');
  });

  it('returns a guidance response when name is unknown', () => {
    const matcher = new IntentMatcher();
    const memory = new MemoryManager('oscar_test_response_memory_2');
    memory.reset();
    const generator = new ResponseGenerator(matcher, memory, () => 0);

    const queryMatch = matcher.match('what is my name');
    const reply = generator.generate(queryMatch, 'en', 'neutral');
    expect(reply.toLowerCase()).toContain('name');
  });

  it('applies gentle tone for sad mood fallback', () => {
    const matcher = new IntentMatcher();
    const memory = new MemoryManager('oscar_test_response_memory_3');
    memory.reset();
    const generator = new ResponseGenerator(matcher, memory, () => 0);

    const reply = generator.generate(null, 'en', 'sad');
    expect(reply.startsWith('Gentle mode on.')).toBe(true);
  });
});
