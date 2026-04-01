import { describe, expect, it } from 'vitest';
import { MAX_MESSAGES, MemoryManager } from '../src/memory/MemoryManager';

describe('MemoryManager', () => {
  it('keeps a rolling message window capped at MAX_MESSAGES', () => {
    const key = 'oscar_test_memory_window';
    const memory = new MemoryManager(key);
    memory.reset();

    for (let i = 0; i < MAX_MESSAGES + 7; i++) {
      memory.addMessage({
        sender: 'user',
        text: `msg-${i}`,
        timestamp: new Date(2026, 0, 1, 0, 0, i).toISOString(),
      });
    }

    const messages = memory.getRecentMessages();
    expect(messages.length).toBe(MAX_MESSAGES);
    expect(messages[0].text).toBe('msg-7');
    expect(messages[messages.length - 1].text).toBe(`msg-${MAX_MESSAGES + 6}`);
  });

  it('safely resets when stored JSON is corrupted', () => {
    const key = 'oscar_test_corrupted';
    localStorage.setItem(key, '{bad-json');

    const memory = new MemoryManager(key);
    expect(memory.getUserName()).toBeNull();
    expect(memory.getLanguage()).toBe('en');
    expect(memory.getRecentMessages()).toEqual([]);
  });
});
