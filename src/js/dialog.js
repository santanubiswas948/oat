/**
 * LongTerm UI - Dialog Component
 * Wraps native <dialog> with trigger/close handling.
 *
 * Usage:
 * <lt-dialog>
 *   <button data-trigger>Open</button>
 *   <dialog>
 *     <header><h2>Title</h2></header>
 *     <p>Content</p>
 *     <footer>
 *       <button data-close>Close</button>
 *     </footer>
 *   </dialog>
 * </lt-dialog>
 */

class LTDialog extends LTBase {
  #dialog = null;

  static get observedAttributes() {
    return ['open'];
  }

  init() {
    this.#dialog = this.$('dialog');
    if (!this.#dialog) {
      console.warn('lt-dialog: No <dialog> element found');
      return;
    }

    // Trigger buttons
    this.$$('[data-trigger]').forEach(el => {
      el.addEventListener('click', this);
    });

    // Close buttons
    this.$$('[data-close]').forEach(el => {
      el.addEventListener('click', this);
    });

    // Close on backdrop click
    this.#dialog.addEventListener('click', this);

    // Close on Escape
    this.#dialog.addEventListener('keydown', this);

    // Close event from dialog
    this.#dialog.addEventListener('close', this);

    // Initial state
    if (this.hasAttribute('open')) {
      this.show();
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'open' && this.#dialog) {
      if (newValue !== null) {
        this.show();
      } else {
        this.close();
      }
    }
  }

  onclick(event) {
    const target = event.target;

    // Trigger button
    if (target.closest('[data-trigger]')) {
      event.preventDefault();
      this.show();
      return;
    }

    // Close button
    if (target.closest('[data-close]')) {
      event.preventDefault();
      this.close();
      return;
    }

    // Backdrop click (click on dialog element itself)
    if (target === this.#dialog) {
      this.close();
    }
  }

  onkeydown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  onclose() {
    this.removeAttribute('open');
    this.emit('lt-dialog-close');
  }

  show() {
    if (this.#dialog && !this.#dialog.open) {
      this.#dialog.showModal();
      this.emit('lt-dialog-open');
    }
  }

  close() {
    if (this.#dialog && this.#dialog.open) {
      this.#dialog.close();
    }
  }

  get open() {
    return this.#dialog?.open ?? false;
  }

  set open(value) {
    this.setBool('open', value);
  }
}

customElements.define('lt-dialog', LTDialog);
