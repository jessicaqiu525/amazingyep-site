const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(__dirname, '..', 'public', 'app.js'), 'utf8');

test('product search stays read-only until the administrator uses it', () => {
  assert.match(html, /id="searchInput"[^>]*autocomplete="off"[^>]*readonly/);
  assert.match(app, /function enableProductSearch\(\)[\s\S]*clearSearchAutofill\(\);[\s\S]*readOnly = false;/);
  assert.match(app, /addEventListener\('pointerdown', enableProductSearch/);
  assert.match(app, /addEventListener\('focus', enableProductSearch/);
});
