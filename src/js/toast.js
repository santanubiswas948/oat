/**
 * LongTerm UI - Toast Component
 * Auto-dismissing notifications.
 *
 * Usage:
 * <lt-toast-container></lt-toast-container>
 *
 * // Programmatic:
 * const container = document.querySelector('lt-toast-container');
 * container.show({ message: 'Saved!', variant: 'success' });
 *
 * // Or declarative:
 * <lt-toast visible duration="5000">
 *   <span>Message here</span>
 *   <button data-close>×</button>
 * </lt-toast>
 */

class LTToast extends LTBase {
  #duration = 5000;
  #timeout = null;

  static get observedAttributes() {
    return ['duration', 'visible'];
  }

  init() {
    this.#duration = parseInt(this.getAttribute('duration') || '5000', 10);

    // Close button
    this.$$('[data-close]').forEach(el => {
      el.addEventListener('click', this);
    });

    // Show if visible
    if (this.hasAttribute('visible')) {
      this.show();
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'visible') {
      if (newValue !== null) {
        this.show();
      } else {
        this.close();
      }
    } else if (name === 'duration') {
      this.#duration = parseInt(newValue || '5000', 10);
    }
  }

  onclick(event) {
    if (event.target.closest('[data-close]')) {
      this.close();
    }
  }

  show() {
    this.setAttribute('data-state', 'open');
    this.hidden = false;
    this.emit('lt-toast-open');

    // Auto-dismiss
    if (this.#duration > 0) {
      this.#clearTimeout();
      this.#timeout = setTimeout(() => this.close(), this.#duration);
    }
  }

  close() {
    this.#clearTimeout();
    this.setAttribute('data-state', 'closed');
    this.removeAttribute('visible');
    this.emit('lt-toast-close');

    // Remove from DOM after animation
    setTimeout(() => {
      if (this.parentElement?.tagName === 'LT-TOAST-CONTAINER') {
        this.remove();
      } else {
        this.hidden = true;
      }
    }, 200);
  }

  #clearTimeout() {
    if (this.#timeout) {
      clearTimeout(this.#timeout);
      this.#timeout = null;
    }
  }

  cleanup() {
    this.#clearTimeout();
  }
}

customElements.define('lt-toast', LTToast);


/**
 * Toast Container - Manages multiple toasts
 */
class LTToastContainer extends LTBase {
  /**
   * Show a toast notification.
   * @param {Object} options
   * @param {string} options.message - Toast message
   * @param {string} [options.variant] - 'success' | 'error' | 'warning'
   * @param {number} [options.duration] - Duration in ms (0 = no auto-dismiss)
   * @returns {LTToast}
   */
  show({ message, variant = '', duration = 5000 }) {
    const toast = document.createElement('lt-toast');
    toast.setAttribute('duration', String(duration));
    if (variant) {
      toast.setAttribute('data-variant', variant);
    }

    toast.innerHTML = `
      <span>${message}</span>
      <button data-close aria-label="Close" style="background:none;border:none;cursor:pointer;padding:0;margin-left:auto;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    `;

    this.appendChild(toast);

    // Trigger show after append
    requestAnimationFrame(() => toast.show());

    return toast;
  }

  /**
   * Close all toasts.
   */
  clear() {
    this.$$('lt-toast').forEach(toast => toast.close());
  }
}

customElements.define('lt-toast-container', LTToastContainer);
