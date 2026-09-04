const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', '..');
const pages = ['conference-swag.html', 'use-case-products.html'];

test('use case pages use sourcing-oriented empty states', () => {
  for (const pageName of pages) {
    const page = fs.readFileSync(path.join(root, pageName), 'utf8');
    assert.doesNotMatch(page, /No matching products yet/);
    assert.doesNotMatch(page, /visible\.length\+' product'/);
    assert.match(page, /Looking for custom/);
    assert.match(page, /We can source it for you/);
    assert.match(page, /data-view-available/);
  }
});

test('use case pages use the concise featured heading', () => {
  ['conference-swag.html', 'use-case-products.html'].forEach((file) => {
    const page = fs.readFileSync(path.join(root, file), 'utf8');
    assert.match(page, /<span class="section-label">FEATURED<\/span>/);
    assert.doesNotMatch(page, /FEATURED PRODUCTS/);
  });
});
