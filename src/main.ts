import '@fontsource/share-tech-mono/400.css';
import '@fontsource/vt323/400.css';
import '@fontsource/orbitron/400.css';
import '@fontsource/orbitron/700.css';

import './styles/cyberpunk.css';

import { BootSequence } from './ui/BootSequence';
import { TerminalLabels, TerminalMessage, TerminalUI } from './ui/TerminalUI';
import { MemoryManager } from './memory/MemoryManager';
import { MoodState, LanguageCode } from './types';
import { LanguageManager } from './language/LanguageManager';
import { MoodEngine } from './personality/MoodEngine';
import { RandomEvents } from './personality/RandomEvents';
import { IntentMatcher, MatchResult } from './engine/IntentMatcher';
import { ResponseGenerator } from './engine/ResponseGenerator';

export class OscarApp {
  private readonly memory: MemoryManager;
  private readonly language: LanguageManager;
  private readonly mood: MoodEngine;
  private readonly randomEvents: RandomEvents;
  private readonly matcher: IntentMatcher;
  private readonly responses: ResponseGenerator;
  private readonly ui: TerminalUI;
  private isProcessing = false;

  constructor() {
    this.memory = new MemoryManager();
    this.language = new LanguageManager(this.memory);
    this.mood = new MoodEngine();
    this.mood.setCurrentMood(this.memory.getMood());
    this.randomEvents = new RandomEvents();
    this.matcher = new IntentMatcher();
    this.responses = new ResponseGenerator(this.matcher, this.memory);
    this.ui = new TerminalUI('#app');

    this.ui.setLanguages(this.language.getSupportedLanguages(), this.language.getCurrentLanguage());
    this.ui.updateLabels(this.currentLabels());
    this.bindEvents();
  }

  async start(): Promise<void> {
    // 🎯 #14 Fix: Boot sequence error handling - show UI if boot fails
    try {
      const boot = new BootSequence();
      await boot.play();
    } catch (error) {
      console.warn('Boot sequence failed, continuing anyway:', error);
      // Continue with main UI even if boot fails
    }

    this.restoreConversation();
    if (this.memory.getRecentMessages().length === 0) {
      this.showInitialWelcome();
    }
  }

  /** 🎯 #4 Fix: Cleanup to prevent memory leaks (clear timers, etc.) */
  destroy(): void {
    this.ui.destroy();
  }

  private bindEvents(): void {
    this.ui.onSend = (text) => {
      this.handleUserMessage(text);
    };

    this.ui.onLanguageChange = (language) => {
      this.language.setLanguage(language);
      this.ui.updateLabels(this.currentLabels());
      this.appendOscarMessage(this.language.getLabel('languageChanged'));
    };
  }

  private restoreConversation(): void {
    const history = this.memory.getRecentMessages();
    for (const row of history) {
      this.ui.addMessage({
        sender: row.sender,
        text: row.text,
        timestamp: row.timestamp,
      });
    }
  }

  private showInitialWelcome(): void {
    const lang = this.language.getCurrentLanguage();
    const name = this.memory.getUserName();
    const prefix = this.timeGreeting(lang);
    let text = '';

    if (name) {
      text = this.language.getLabel('welcomeBack').replace('{{name}}', name);
    } else {
      text = this.language.getLabel('welcome');
    }

    this.appendOscarMessage(`${prefix} ${text}`);
  }

  private async handleUserMessage(text: string): Promise<void> {
    if (this.isProcessing) {
      return;
    }
    this.isProcessing = true;

    try {
      const userMessage = this.createMessage('user', text);
      this.ui.addMessage(userMessage);
      this.memory.addMessage(userMessage);

      // Optional auto language detection from user text.
      const autoLang = this.language.detectLanguageFromText(text);
      if (autoLang && autoLang !== this.language.getCurrentLanguage()) {
        this.language.setLanguage(autoLang);
        this.ui.setLanguage(autoLang);
        this.ui.updateLabels(this.currentLabels());
        this.appendOscarMessage(this.language.getLabel('autoLanguage'));
      }

      const detectedMood = this.mood.detectMood(text);
      this.memory.setMood(detectedMood.mood);

      this.ui.showTyping();

      let match: MatchResult | null = null;
      try {
        match = this.matcher.match(text);
      } catch {
        match = null;
      }

      const lang = this.language.getCurrentLanguage();
      const reply = this.responses.generate(match, lang, detectedMood.mood);
      await this.delay(this.typingDelay(reply.length));
      this.ui.hideTyping();

      const botMessage = this.createMessage('oscar', reply, match?.intentId);
      this.ui.addMessage(botMessage);
      this.memory.addMessage(botMessage);

      const randomEvent = this.randomEvents.maybeGetEvent(lang, detectedMood.mood);
      if (randomEvent) {
        this.ui.showTyping();
        await this.delay(500 + Math.floor(Math.random() * 300));
        this.ui.hideTyping();
        this.appendOscarMessage(randomEvent);
      }
    } catch {
      this.ui.hideTyping();
      const safe = this.responses.generate(null, this.language.getCurrentLanguage(), this.mood.getCurrentMood());
      this.appendOscarMessage(safe);
    } finally {
      this.ui.hideTyping();
      this.ui.focusInput();
      this.isProcessing = false;
    }
  }

  private appendOscarMessage(text: string): void {
    const row = this.createMessage('oscar', text);
    this.ui.addMessage(row);
    this.memory.addMessage(row);
  }

  private createMessage(
    sender: 'user' | 'oscar',
    text: string,
    intentId?: string,
  ): TerminalMessage & { intentId?: string } {
    return {
      sender,
      text,
      timestamp: new Date().toISOString(),
      intentId,
    };
  }

  private currentLabels(): TerminalLabels {
    return {
      title: this.language.getLabel('appTitle'),
      subtitle: this.language.getLabel('appSubtitle'),
      online: this.language.getLabel('online'),
      inputPlaceholder: this.language.getLabel('inputPlaceholder'),
      send: this.language.getLabel('send'),
      typing: this.language.getLabel('typing'),
    };
  }

  private typingDelay(length: number): number {
    const base = 320;
    const perChar = Math.min(1600, length * 18);
    const jitter = Math.random() * 260;
    return base + perChar + jitter;
  }

  private timeGreeting(language: LanguageCode): string {
    const hour = new Date().getHours();
    if (language === 'es') {
      if (hour < 12) return 'Buenos dias.';
      if (hour < 19) return 'Buenas tardes.';
      return 'Buenas noches.';
    }
    if (language === 'it') {
      if (hour < 12) return 'Buongiorno.';
      if (hour < 19) return 'Buon pomeriggio.';
      return 'Buonasera.';
    }
    if (hour < 12) return 'Good morning.';
    if (hour < 19) return 'Good afternoon.';
    return 'Good evening.';
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const app = new OscarApp();
  await app.start();

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    app.destroy();
  });
});
