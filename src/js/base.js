/**
 * LongTerm UI - Base Web Component Class
 * Provides lifecycle management, event handling, and utilities.
 */

class LTBase extends HTMLElement {
  #initialized = false;

  /**
   * Called when element is added to DOM.
   */
  connectedCallback() {
    if (this.#initialized) return;

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.#setup(), { once: true });
    } else {
      this.#setup();
    }
  }

  /**
   * Private setup - ensures init() is only called once.
   */
  #setup() {
    if (this.#initialized) return;
    this.#initialized = true;
    this.init();
  }

  /**
   * Override in subclass for initialization logic.
   */
  init() {}

  /**
   * Called when element is removed from DOM.
   */
  disconnectedCallback() {
    this.cleanup();
  }

  /**
   * Override in subclass for cleanup logic.
   */
  cleanup() {}

  /**
   * Central event handler - enables automatic cleanup.
   * Usage: element.addEventListener('click', this)
   * @param {Event} event
   */
  handleEvent(event) {
    const handler = this[`on${event.type}`];
    if (handler) handler.call(this, event);
  }

  /**
   * Emit a custom event.
   * @param {string} name - Event name
   * @param {any} detail - Event detail data
   * @returns {boolean} - Whether event was cancelled
   */
  emit(name, detail = null) {
    return this.dispatchEvent(new CustomEvent(name, {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail
    }));
  }

  /**
   * Get boolean attribute value.
   * @param {string} name
   * @returns {boolean}
   */
  getBool(name) {
    return this.hasAttribute(name);
  }

  /**
   * Set or remove boolean attribute.
   * @param {string} name
   * @param {boolean} value
   */
  setBool(name, value) {
    if (value) {
      this.setAttribute(name, '');
    } else {
      this.removeAttribute(name);
    }
  }

  /**
   * Query selector within this element.
   * @param {string} selector
   * @returns {Element|null}
   */
  $(selector) {
    return this.querySelector(selector);
  }

  /**
   * Query selector all within this element.
   * @param {string} selector
   * @returns {Element[]}
   */
  $$(selector) {
    return Array.from(this.querySelectorAll(selector));
  }
}

// Export for use in other files
if (typeof window !== 'undefined') {
  window.LTBase = LTBase;
}
