# LongTerm UI - Build System
# Requires: Bun

.PHONY: all css js clean watch dev

CSS_FILES = src/css/00-layers.css \
            src/css/01-reset.css \
            src/css/02-theme.css \
            src/css/03-base.css \
            src/css/button.css \
            src/css/form.css \
            src/css/table.css \
            src/css/progress.css \
            src/css/grid.css \
            src/css/card.css \
            src/css/alert.css \
            src/css/badge.css \
            src/css/accordion.css \
            src/css/tabs.css \
            src/css/dialog.css \
            src/css/dropdown.css \
            src/css/toast.css \
            src/css/utilities.css

all: css js

css:
	@mkdir -p dist
	@cat $(CSS_FILES) > dist/longterm.css
	@bunx lightningcss --minify dist/longterm.css -o dist/longterm.min.css 2>/dev/null || \
		(echo "Installing lightningcss..." && bun add -d lightningcss-cli && bunx lightningcss --minify dist/longterm.css -o dist/longterm.min.css)
	@echo "CSS: $$(wc -c < dist/longterm.min.css | tr -d ' ') bytes (minified)"

js:
	@mkdir -p dist
	@cat src/js/base.js src/js/dialog.js src/js/tabs.js src/js/dropdown.js src/js/toast.js > dist/longterm.js
	@bun build dist/longterm.js --minify --outfile=dist/longterm.min.js 2>/dev/null
	@echo "JS: $$(wc -c < dist/longterm.min.js | tr -d ' ') bytes (minified)"

clean:
	@rm -rf dist
	@echo "Cleaned dist/"

watch:
	@echo "Watching for changes... (Ctrl+C to stop)"
	@while true; do \
		make all 2>/dev/null; \
		sleep 1; \
	done

dev:
	@echo "Starting dev server..."
	@bunx live-server examples --port=3000 --watch=dist,examples &
	@make watch

# Size check
size: all
	@echo ""
	@echo "=== Bundle Sizes ==="
	@echo "CSS (source):   $$(wc -c < dist/longterm.css | tr -d ' ') bytes"
	@echo "CSS (minified): $$(wc -c < dist/longterm.min.css | tr -d ' ') bytes"
	@echo "JS (source):    $$(wc -c < dist/longterm.js | tr -d ' ') bytes"
	@echo "JS (minified):  $$(wc -c < dist/longterm.min.js | tr -d ' ') bytes"
	@echo ""
	@echo "=== Gzipped Sizes ==="
	@gzip -c dist/longterm.min.css | wc -c | xargs -I {} echo "CSS (gzipped):  {} bytes"
	@gzip -c dist/longterm.min.js | wc -c | xargs -I {} echo "JS (gzipped):   {} bytes"
