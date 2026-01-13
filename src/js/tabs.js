/**
 * LongTerm UI - Tabs Component
 * Provides keyboard navigation and ARIA state management.
 *
 * Usage:
 * <lt-tabs>
 *   <div role="tablist">
 *     <button role="tab">Tab 1</button>
 *     <button role="tab">Tab 2</button>
 *   </div>
 *   <div role="tabpanel">Content 1</div>
 *   <div role="tabpanel">Content 2</div>
 * </lt-tabs>
 */

class LTTabs extends LTBase {
  #tabs = [];
  #panels = [];
  #activeIndex = 0;

  init() {
    this.#tabs = this.$$('[role="tab"]');
    this.#panels = this.$$('[role="tabpanel"]');

    if (this.#tabs.length === 0 || this.#panels.length === 0) {
      console.warn('lt-tabs: Missing tab or tabpanel elements');
      return;
    }

    // Generate IDs and set up ARIA
    this.#tabs.forEach((tab, i) => {
      const panel = this.#panels[i];
      if (!panel) return;

      const tabId = tab.id || `lt-tab-${this.#uid()}`;
      const panelId = panel.id || `lt-panel-${this.#uid()}`;

      tab.id = tabId;
      panel.id = panelId;
      tab.setAttribute('aria-controls', panelId);
      panel.setAttribute('aria-labelledby', tabId);

      tab.addEventListener('click', this);
      tab.addEventListener('keydown', this);
    });

    // Find initially active tab
    const activeTab = this.#tabs.findIndex(t =>
      t.getAttribute('aria-selected') === 'true'
    );
    this.#activate(activeTab >= 0 ? activeTab : 0);
  }

  #uid() {
    return Math.random().toString(36).slice(2, 10);
  }

  onclick(event) {
    const tab = event.target.closest('[role="tab"]');
    if (tab) {
      const index = this.#tabs.indexOf(tab);
      if (index >= 0) {
        this.#activate(index);
      }
    }
  }

  onkeydown(event) {
    const { key } = event;
    let newIndex = this.#activeIndex;

    switch (key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        newIndex = this.#activeIndex - 1;
        if (newIndex < 0) newIndex = this.#tabs.length - 1;
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        newIndex = (this.#activeIndex + 1) % this.#tabs.length;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = this.#tabs.length - 1;
        break;
      default:
        return;
    }

    this.#activate(newIndex);
    this.#tabs[newIndex].focus();
  }

  #activate(index) {
    // Update tabs
    this.#tabs.forEach((tab, i) => {
      const isActive = i === index;
      tab.setAttribute('aria-selected', String(isActive));
      tab.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    // Update panels
    this.#panels.forEach((panel, i) => {
      panel.hidden = i !== index;
    });

    this.#activeIndex = index;
    this.emit('lt-tab-change', { index, tab: this.#tabs[index] });
  }

  get activeIndex() {
    return this.#activeIndex;
  }

  set activeIndex(value) {
    if (value >= 0 && value < this.#tabs.length) {
      this.#activate(value);
    }
  }
}

customElements.define('lt-tabs', LTTabs);
