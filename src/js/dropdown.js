/**
 * LongTerm UI - Dropdown Component
 * Menu with keyboard navigation.
 *
 * Usage:
 * <lt-dropdown>
 *   <button data-trigger>Options</button>
 *   <div data-dropdown-menu hidden>
 *     <button data-dropdown-item data-value="edit">Edit</button>
 *     <button data-dropdown-item data-value="delete">Delete</button>
 *   </div>
 * </lt-dropdown>
 */

class LTDropdown extends LTBase {
  #trigger = null;
  #menu = null;
  #items = [];
  #isOpen = false;

  init() {
    this.#trigger = this.$('[data-trigger]');
    this.#menu = this.$('[data-dropdown-menu]');

    if (!this.#trigger || !this.#menu) {
      console.warn('lt-dropdown: Missing trigger or menu element');
      return;
    }

    this.#items = this.$$('[data-dropdown-item]');

    // Set up ARIA
    const menuId = this.#menu.id || `lt-menu-${Math.random().toString(36).slice(2, 10)}`;
    this.#menu.id = menuId;
    this.#trigger.setAttribute('aria-haspopup', 'true');
    this.#trigger.setAttribute('aria-expanded', 'false');
    this.#trigger.setAttribute('aria-controls', menuId);
    this.#menu.setAttribute('role', 'menu');

    // Set up items
    this.#items.forEach(item => {
      item.setAttribute('role', 'menuitem');
      item.setAttribute('tabindex', '-1');
    });

    this.#trigger.addEventListener('click', this);
    this.#trigger.addEventListener('keydown', this);
    this.#menu.addEventListener('keydown', this);
    this.#menu.addEventListener('click', this);

    // Close on outside click
    document.addEventListener('click', this.#onDocumentClick.bind(this));
  }

  cleanup() {
    document.removeEventListener('click', this.#onDocumentClick.bind(this));
  }

  #onDocumentClick(event) {
    if (this.#isOpen && !this.contains(event.target)) {
      this.close();
    }
  }

  onclick(event) {
    const target = event.target;

    // Trigger click
    if (this.#trigger.contains(target)) {
      event.preventDefault();
      event.stopPropagation();
      this.toggle();
      return;
    }

    // Item click
    const item = target.closest('[data-dropdown-item]');
    if (item && this.#menu.contains(item)) {
      this.emit('lt-dropdown-select', {
        item,
        value: item.dataset.value
      });
      this.close();
      this.#trigger.focus();
    }
  }

  onkeydown(event) {
    const { key } = event;

    // Trigger keyboard
    if (event.target === this.#trigger) {
      if (key === 'ArrowDown' || key === 'Enter' || key === ' ') {
        event.preventDefault();
        this.open();
        this.#focusFirst();
      }
      return;
    }

    // Menu keyboard
    const currentIndex = this.#items.indexOf(document.activeElement);

    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        this.#focusAt((currentIndex + 1) % this.#items.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.#focusAt(currentIndex - 1 < 0 ? this.#items.length - 1 : currentIndex - 1);
        break;
      case 'Home':
        event.preventDefault();
        this.#focusFirst();
        break;
      case 'End':
        event.preventDefault();
        this.#focusAt(this.#items.length - 1);
        break;
      case 'Escape':
        event.preventDefault();
        this.close();
        this.#trigger.focus();
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (currentIndex >= 0) {
          this.#items[currentIndex].click();
        }
        break;
    }
  }

  #focusFirst() {
    this.#items[0]?.focus();
  }

  #focusAt(index) {
    this.#items[index]?.focus();
  }

  open() {
    if (this.#isOpen) return;
    this.#isOpen = true;
    this.#menu.hidden = false;
    this.#trigger.setAttribute('aria-expanded', 'true');
    this.setAttribute('data-state', 'open');
    this.emit('lt-dropdown-open');
  }

  close() {
    if (!this.#isOpen) return;
    this.#isOpen = false;
    this.#menu.hidden = true;
    this.#trigger.setAttribute('aria-expanded', 'false');
    this.setAttribute('data-state', 'closed');
    this.emit('lt-dropdown-close');
  }

  toggle() {
    if (this.#isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  get open() {
    return this.#isOpen;
  }
}

customElements.define('lt-dropdown', LTDropdown);
