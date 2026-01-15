/**
 * Demo page utilities
 */

class LMDemo extends LMBase {
  init() {
    // Get pristine HTML from template (before any JS modifies it)
    const template = this.$('template');
    const rawHTML = template.innerHTML;
    const formattedHTML = this.formatHTML(rawHTML);

    // Build tabs structure using lm-tabs
    this.innerHTML = `
      <lm-tabs>
        <div role="tablist">
          <button role="tab">Demo</button>
          <button role="tab">Code</button>
        </div>
        <div role="tabpanel"></div>
        <div role="tabpanel"><pre><code>${this.highlightHTML(formattedHTML)}</code></pre></div>
      </lm-tabs>
    `;

    // Clone template content into Demo panel (now components initialize fresh)
    this.$('[role="tabpanel"]').appendChild(template.content.cloneNode(true));
  }

  highlightHTML(str) {
    // Super-hacky syntax highlighter for HTML.
    const hl = (c, s) => `<span style="color:${c}">${s}</span>`;
    return str.replace(
      /(<\/?)(\w+)([^>]*)(\/?>)|([^<]+)/g,
      (_, open, tag, attrs, close, text) => {
        if (text) return text;
        const a = attrs.replace(
          /([\w-]+)="([^"]*)"/g,
          (_, n, v) => hl('var(--lm-muted-foreground)', n) + '=' + hl('var(--lm-success)', `"${v}"`)
        );

        return hl('var(--lm-faint-foreground)', open.replace('<', '&lt;')) +
          hl('var(--lm-foreground)', tag) + a +
          hl('var(--lm-faint-foreground)', close.replace('>', '&gt;'));
      }
    );
  }

  formatHTML(html) {
    // Split into lines and find minimum indentation
    const lines = html.split('\n');

    // Remove empty first/last lines
    while (lines.length && !lines[0].trim()) lines.shift();
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();

    if (!lines.length) return '';

    // Find minimum indentation (ignoring empty lines)
    const minIndent = lines
      .filter(line => line.trim())
      .reduce((min, line) => {
        const indent = line.match(/^(\s*)/)[1].length;
        return Math.min(min, indent);
      }, Infinity);

    // Remove that indentation from all lines
    return lines
      .map(line => line.slice(minIndent))
      .join('\n').replaceAll('=""', '');
  }
}

customElements.define('lm-demo', LMDemo);
