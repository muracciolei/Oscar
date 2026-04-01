const BOOT_LINES = [
  'Initializing memory module...',
  'Loading multilingual packs: EN / ES / IT...',
  'Compiling pattern engine...',
  'Syncing mood monitor...',
  'Mounting nostalgia archive...',
  'Oscar terminal online.',
];

export class BootSequence {
  async play(): Promise<void> {
    const overlay = document.createElement('div');
    overlay.className = 'boot-overlay';
    overlay.innerHTML = `
      <pre class="boot-ascii" aria-hidden="true">
 ██████  ███████  ██████   █████  ██████
██    ██ ██      ██      ██   ██ ██   ██
██    ██ ███████ ██      ███████ ██████
██    ██      ██ ██      ██   ██ ██   ██
 ██████  ███████  ██████ ██   ██ ██   ██
      </pre>
      <div class="boot-lines" role="status" aria-live="polite"></div>
    `;
    document.body.appendChild(overlay);

    const linesContainer = overlay.querySelector('.boot-lines') as HTMLElement;
    const stepDelay = 220;

    for (const line of BOOT_LINES) {
      const row = document.createElement('div');
      row.className = 'boot-line';
      row.textContent = `> ${line}`;
      linesContainer.appendChild(row);
      await this.delay(stepDelay);
    }

    await this.delay(380);
    overlay.classList.add('fade-out');
    await this.delay(320);
    overlay.remove();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
