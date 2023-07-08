export class Tooltip {

  #manager: HTMLElement;

  #root: HTMLElement;
  #container: HTMLElement;
  #tooltip: HTMLElement;
  #caption: HTMLElement;
  #content: HTMLElement;

  constructor(manager: HTMLElement) {
    this.#manager = manager;

    const root = this.#root = document.createElement('div');
    root.setAttribute('style', 'position: absolute; top: 0; left: 0; width: 0; height: 0; overflow: visible; z-index: 19001;');

    const container = this.#container = document.createElement('div');
    container.setAttribute('style', 'position: absolute; opacity: 0;');
    root.appendChild(container);

    const tooltip = this.#tooltip = document.createElement('lol-uikit-tooltip');
    tooltip.setAttribute('data-tooltip-position', 'right');
    container.appendChild(tooltip);

    const view = document.createElement('div');
    view.setAttribute('style', 'background: #1a1c21; direction: ltr; width: 300px; font-family: var(--font-body); -webkit-font-smoothing: subpixel-antialiased; color: #a09b8c; font-size: 12px; font-weight: 400; letter-spacing: .025em; line-height: 16px;');
    tooltip.appendChild(view);

    const body = document.createElement('div');
    body.setAttribute('style', 'min-width: 230px; padding: 18px;');
    view.appendChild(body);

    const caption = this.#caption = document.createElement('div');
    caption.setAttribute('style', 'margin-bottom: 8px; color: #f0e6d2; font-size: 14px; font-weight: 700; letter-spacing: .075em; line-height: 18px; text-transform: uppercase;');
    body.appendChild(caption);

    const content = this.#content = document.createElement('div');
    content.setAttribute('style', 'white-space: pre;');
    body.appendChild(content);
  }

  show(parent: Element, position: 'right' | 'bottom', caption: string, content: string) {
    this.#caption.textContent = caption;
    this.#content.textContent = content;
    this.#manager.appendChild(this.#root);
    this.#tooltip.setAttribute('data-tooltip-position', position);

    let left, top;
    const rect = parent.getBoundingClientRect();

    if (position === 'right') {
      left = rect.right + 5;
      top = rect.bottom - (rect.height + this.#container.offsetHeight) / 2;
    } else {
      top = rect.bottom + 40;
      left = rect.right - (rect.width + this.#container.offsetWidth) / 2;
    }

    this.#container.style.left = `${left}px`;
    this.#container.style.top = `${top}px`;
    this.#container.style.opacity = '1';
  }

  hide() {
    this.#caption.textContent = '';
    this.#content.textContent = '';
    this.#container.style.opacity = '0';
    this.#root.remove();
  }
}