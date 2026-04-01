import { LanguageCode, LanguageOption } from '../language/LanguageManager';
import { TypingIndicator } from './TypingIndicator';
import { MAX_INPUT_LENGTH } from '../config';

export interface TerminalMessage {
  sender: 'user' | 'oscar';
  text: string;
  timestamp: string;
}

export interface TerminalLabels {
  title: string;
  subtitle: string;
  online: string;
  inputPlaceholder: string;
  send: string;
  typing: string;
}

export class TerminalUI {
  private readonly root: HTMLElement;
  private readonly messageLog: HTMLElement;
  private readonly input: HTMLInputElement;
  private readonly sendButton: HTMLButtonElement;
  private readonly languageSelect: HTMLSelectElement;
  private readonly clock: HTMLElement;
  private readonly charCount: HTMLElement;
  private readonly typingIndicator: TypingIndicator;
  private clockTimer: number | null = null;

  onSend: ((text: string) => void) | null = null;
  onLanguageChange: ((language: LanguageCode) => void) | null = null;

  constructor(rootSelector: string) {
    const root = document.querySelector(rootSelector);
    if (!root) {
      throw new Error(`Root container "${rootSelector}" not found`);
    }
    this.root = root as HTMLElement;

    this.root.innerHTML = `
      <section class="terminal-shell" aria-label="Oscar Terminal">
        <header class="terminal-header">
          <div class="header-left">
            <div class="status-dot" aria-hidden="true"></div>
            <div class="title-group">
              <h1 id="terminal-title">OSCAR TERMINAL</h1>
              <p id="terminal-subtitle">retro cyberpunk virtual friend</p>
            </div>
          </div>
          <div class="header-right">
            <span id="online-label" class="online-label">ONLINE</span>
            <label class="sr-only" for="language-select">Language</label>
            <select id="language-select" class="language-select"></select>
            <time id="clock" class="clock"></time>
          </div>
        </header>

        <main class="terminal-body">
          <div
            id="message-log"
            class="message-log"
            role="log"
            aria-live="polite"
            aria-relevant="additions text"
            tabindex="0"
          ></div>
        </main>

        <footer class="terminal-footer">
          <div class="input-row">
            <span class="prompt" aria-hidden="true">oscar@grid:~$</span>
            <input
              id="terminal-input"
              class="terminal-input"
              type="text"
              maxlength="${MAX_INPUT_LENGTH}"
              autocomplete="off"
              spellcheck="false"
              placeholder="type a message..."
              aria-label="Chat input"
            />
            <span id="char-count" class="char-count" aria-live="polite" role="status">${MAX_INPUT_LENGTH}</span>
            <button id="send-button" class="send-button" type="button" aria-label="Send">send</button>
          </div>
        </footer>

        <div class="scanline-overlay" aria-hidden="true"></div>
        <div class="crt-noise" aria-hidden="true"></div>
      </section>
    `;

    this.messageLog = this.getById('message-log');
    this.input = this.getById<HTMLInputElement>('terminal-input');
    this.sendButton = this.getById<HTMLButtonElement>('send-button');
    this.languageSelect = this.getById<HTMLSelectElement>('language-select');
    this.clock = this.getById('clock');
    this.charCount = this.getById('char-count');

    this.typingIndicator = new TypingIndicator('Oscar is typing');
    this.messageLog.appendChild(this.typingIndicator.getElement());

    this.setupEvents();
    this.startClock();
    this.focusInput();
  }

  setLanguages(options: LanguageOption[], selected: LanguageCode): void {
    this.languageSelect.innerHTML = '';
    for (const option of options) {
      const row = document.createElement('option');
      row.value = option.code;
      row.textContent = option.label;
      this.languageSelect.appendChild(row);
    }
    this.languageSelect.value = selected;
  }

  setLanguage(language: LanguageCode): void {
    this.languageSelect.value = language;
  }

  updateLabels(labels: TerminalLabels): void {
    this.getById('terminal-title').textContent = labels.title;
    this.getById('terminal-subtitle').textContent = labels.subtitle;
    this.getById('online-label').textContent = labels.online;
    this.input.placeholder = labels.inputPlaceholder;
    this.sendButton.textContent = labels.send;
    this.sendButton.setAttribute('aria-label', labels.send);
    this.typingIndicator.setLabel(labels.typing);
  }

  addMessage(message: TerminalMessage): void {
    const lines = message.text.split('\n');
    const timeLabel = this.formatTime(message.timestamp);
    const senderLabel = message.sender === 'oscar' ? 'OSCAR' : 'YOU';

    for (const rawLine of lines) {
      const line = document.createElement('article');
      line.className = `log-line ${message.sender}`;
      line.innerHTML = `
        <span class="line-time">[${timeLabel}]</span>
        <span class="line-sender">${senderLabel}&gt;</span>
        <span class="line-text"></span>
      `;
      const textEl = line.querySelector('.line-text') as HTMLElement;
      textEl.textContent = rawLine || ' ';
      this.messageLog.insertBefore(line, this.typingIndicator.getElement());
    }

    this.scrollToBottom();
  }

  showTyping(): void {
    this.typingIndicator.show();
    this.scrollToBottom();
  }

  hideTyping(): void {
    this.typingIndicator.hide();
  }

  focusInput(): void {
    this.input.focus();
  }

  clear(): void {
    const typingEl = this.typingIndicator.getElement();
    this.messageLog.innerHTML = '';
    this.messageLog.appendChild(typingEl);
  }

  /** 🎯 #4 Fix: Cleanup method to prevent memory leak by clearing clock interval */
  destroy(): void {
    if (this.clockTimer !== null) {
      clearInterval(this.clockTimer);
      this.clockTimer = null;
    }
  }

  private setupEvents(): void {
    this.sendButton.addEventListener('click', () => this.submitInput());

    this.input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        this.submitInput();
      }
    });

    /** 🎯 #10 Fix: Update character counter as user types */
    this.input.addEventListener('input', () => {
      this.updateCharCount();
    });

    this.languageSelect.addEventListener('change', () => {
      const value = this.languageSelect.value as LanguageCode;
      this.onLanguageChange?.(value);
      this.focusInput();
    });
  }

  private updateCharCount(): void {
    const remaining = MAX_INPUT_LENGTH - this.input.value.length;
    this.charCount.textContent = String(remaining);
    // Visual warning at 80% capacity
    if (remaining < MAX_INPUT_LENGTH * 0.2) {
      this.charCount.style.color = '#ff00ff'; // Magenta warning
    } else {
      this.charCount.style.color = '';
    }
  }

  private submitInput(): void {
    const text = this.input.value.trim();
    if (!text) {
      return;
    }
    this.onSend?.(text);
    this.input.value = '';
    this.updateCharCount();
    this.focusInput();
  }

  private startClock(): void {
    const renderClock = () => {
      this.clock.textContent = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    };
    renderClock();
    this.clockTimer = window.setInterval(renderClock, 1000);
  }

  private scrollToBottom(): void {
    requestAnimationFrame(() => {
      this.messageLog.scrollTop = this.messageLog.scrollHeight;
    });
  }

  private formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private getById<T extends HTMLElement = HTMLElement>(id: string): T {
    const el = this.root.querySelector(`#${id}`);
    if (!el) {
      throw new Error(`Element #${id} not found in terminal UI`);
    }
    return el as T;
  }
}
