import styles from './tooltip.css?inline';

/* 
  <div class=".bbv-tooltip">
    <div class=".bbv-tooltip-content">
      <div class=".bbv-tooltip-decoration"></div>  
      <div class=".bbv-tooltip-body">
        <div class=".bbv-tooltip-caption">
          BALANCE BUFFS
        </div>
        <div class=".bbv-tooltip-description">
          Some description here
        </div>
      </div>
    </div>
  </div>
*/

class TrackerElement extends HTMLElement {
  private _disconnect?: () => void;

  connectedCallback() {
  }

  disconnectedCallback() {
    if (this._disconnect) {
      this._disconnect();
    }
  }
}

class Tooltip {

  static $rootEl?: HTMLDivElement;
  _tooltipEl: HTMLDivElement;
  _captionEl: HTMLDivElement;
  _descriptionEl: HTMLDivElement;

  constructor(manager: HTMLElement, trackTarget?: HTMLElement) {

    if (!Tooltip.$rootEl) {
      // Create root element on first tooltip initialization
      const root = Tooltip.$rootEl = document.createElement('div');
      root.classList.add('bbv_root');

      // Inject tooltip styles
      const style = document.createElement('style');
      style.textContent = styles;
      root.appendChild(style);

      // Append root to the layers manager
      manager.appendChild(root);

      // Register tracker element
      customElements.define("bbv-tracker", TrackerElement);
    }

    // Create tooltip element
    const tooltip = this._tooltipEl = document.createElement('div');
    tooltip.classList.add('bbv_tooltip', 'hidden');
    tooltip.setAttribute('data-position', 'right');
    Tooltip.$rootEl.appendChild(tooltip);

    // Create content wrapper
    const content = document.createElement('div');
    content.classList.add('content');
    tooltip.appendChild(content);

    // Create decorative arrow element
    const decorator = document.createElement('div');
    decorator.classList.add('decorator');
    content.appendChild(decorator);

    // Create body, caption and description elements
    const body = document.createElement('div');
    body.classList.add('body');
    content.appendChild(body);

    const caption = this._captionEl = document.createElement('div');
    caption.classList.add('caption');
    body.appendChild(caption);

    const description = this._descriptionEl = document.createElement('div');
    description.classList.add('description');
    body.appendChild(description);

    if (trackTarget) {
      const tracker = document.createElement('bbv-tracker');
      // @ts-ignore
      tracker._disconnect = () => this.remove();
      trackTarget.appendChild(tracker);
    }
  }

  show(parent: Element, position: 'right' | 'bottom', caption: string, description: string) {
    this._tooltipEl.setAttribute('data-position', position);
    this._captionEl.textContent = caption;
    this._descriptionEl.innerHTML = description;

    let left: number, top: number;
    const tooltip = this._tooltipEl;
    const rect = parent.getBoundingClientRect();

    if (position === 'right') {
      left = rect.right + 5;
      top = rect.bottom - (rect.height + tooltip.offsetHeight) / 2;
    } else {
      top = rect.bottom + 40;
      left = rect.right - (rect.width + tooltip.offsetWidth) / 2;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.classList.remove('hidden');
  }

  hide() {
    this._tooltipEl.classList.add('hidden');
  }

  remove() {
    this._tooltipEl.remove();
  }
}

export { Tooltip };