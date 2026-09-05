const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const page = fs.readFileSync(path.join(__dirname, '..', '..', 'solutions', 'brand-program.html'), 'utf8');

test('brand program hero is built from live product and gallery images', () => {
  assert.match(page, /id="brandProductHero"/);
  assert.match(page, /function productImages\(product\)/);
  assert.match(page, /product\.images \|\| \[\], product\.gallery \|\| \[\]/);
  assert.match(page, /initBrandHero\(products\)/);
  assert.match(page, /collections\/product\.html\?id=/);
});

test('brand breadcrumb follows the product hero', () => {
  const heroPosition = page.indexOf('id="brandProductHero"');
  const breadcrumbPosition = page.indexOf('aria-label="Breadcrumb"');
  assert.ok(heroPosition >= 0 && breadcrumbPosition > heroPosition);
});

test('multi-image brand hero has accessible automatic and manual controls', () => {
  assert.match(page, /aria-label="Previous product image"/);
  assert.match(page, /aria-label="Next product image"/);
  assert.match(page, /setInterval\(\(\) => show\(current \+ 1\), 5000\)/);
  assert.match(page, /prefers-reduced-motion: reduce/);
  assert.match(page, /hero\.addEventListener\('mouseenter', stop\)/);
});

test('brand program inline scripts remain valid JavaScript', () => {
  const scripts = Array.from(page.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))
    .map(match => match[1]).filter(Boolean);
  scripts.forEach(source => assert.doesNotThrow(() => new Function(source)));
});
