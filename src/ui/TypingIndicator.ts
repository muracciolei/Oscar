export class TypingIndicator {
  private readonly element: HTMLElement;
  private readonly labelElement: HTMLElement;

  constructor(initialLabel: string) {
    this.element = document.createElement('div');
    this.element.className = 'typing-indicator';
    this.element.setAttribute('aria-live', 'polite');
    this.element.hidden = true;

    this.labelElement = document.createElement('span');
    this.labelElement.className = 'typing-label';
    this.labelElement.textContent = initialLabel;

    const dots = document.createElement('span');
    dots.className = 'typing-dots';
    dots.innerHTML = '<span>.</span><span>.</span><span>.</span>';

    this.element.appendChild(this.labelElement);
    this.element.appendChild(dots);
  }

  getElement(): HTMLElement {
    return this.element;
  }

  setLabel(label: string): void {
    this.labelElement.textContent = label;
  }

  show(): void {
    this.element.hidden = false;
  }

  hide(): void {
    this.element.hidden = true;
  }
}
