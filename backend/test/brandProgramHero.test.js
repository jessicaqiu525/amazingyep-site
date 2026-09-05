const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const page = fs.readFileSync(path.join(__dirname, '..', '..', 'solutions', 'brand-program.html'), 'utf8');
const brandIndex = fs.readFileSync(path.join(__dirname, '..', '..', 'solutions', 'index.html'), 'utf8');

test('brand program hero chooses one live product and shows all of its images', () => {
  assert.match(page, /id="brandProductHero"/);
  assert.match(page, /function productImages\(product\)/);
  assert.match(page, /product\.images \|\| \[\], product\.gallery \|\| \[\]/);
  assert.match(page, /const heroProducts = products\.filter/);
  assert.match(page, /const product = choices\[Math\.floor\(Math\.random\(\) \* choices\.length\)\]/);
  assert.match(page, /new Set\(productImages\(product\)\)/);
  assert.match(page, /initBrandHero\(products\)/);
  assert.match(page, /collections\/product\.html\?id=/);
});

test('brand hero avoids repeating the previously selected product', () => {
  assert.match(page, /amazingyepBrandHero:/);
  assert.match(page, /window\.sessionStorage\.getItem\(storageKey\)/);
  assert.match(page, /heroProducts\.filter\(product => String\(product\.id \|\| product\.sku\) !== previousId\)/);
  assert.match(page, /window\.sessionStorage\.setItem\(storageKey/);
});

test('brand breadcrumb follows the product hero', () => {
  const heroPosition = page.indexOf('id="brandProductHero"');
  const breadcrumbPosition = page.indexOf('aria-label="Breadcrumb"');
  assert.ok(heroPosition >= 0 && breadcrumbPosition > heroPosition);
});

test('multi-image brand hero has accessible automatic and manual controls', () => {
  assert.match(page, /aria-label="Previous product image"/);
  assert.match(page, /aria-label="Next product image"/);
  assert.match(page, /transition: opacity \.25s ease/);
  assert.match(page, /setInterval\(\(\) => show\(current \+ 1\), 1000\)/);
  assert.match(page, /setTimeout\(start, 3000\)/);
  assert.match(page, /pauseAfterManualChange/);
  assert.match(page, /prefers-reduced-motion: reduce/);
  assert.match(page, /hero\.addEventListener\('mouseenter', stop\)/);
});

test('brand hero product information sits outside and never covers the image', () => {
  assert.match(page, /id="brandHeroInfo"/);
  assert.match(page, /\.brand-hero-info \{[^}]*display: none[^}]*background: var\(--navy\)/);
  assert.match(page, /info\.innerHTML = '<div class="container">/);
  assert.doesNotMatch(page, /brand-hero-caption/);
});

test('brand projects label leads the section heading hierarchy', () => {
  assert.match(page, /\.brand-products \.section-label \{[^}]*font-size: clamp\(25px, 2\.6vw, 34px\)/);
  assert.match(page, /\.brand-products \.section-title \{[^}]*font-size: clamp\(17px, 1\.6vw, 22px\)/);
});

test('brand product cards fill a balanced four-column content grid', () => {
  assert.match(page, /\.brand-product-grid \{[^}]*grid-template-columns: repeat\(4, minmax\(0, 1fr\)\)[^}]*gap: 24px[^}]*width: 100%/);
  assert.match(page, /@media \(max-width: 1100px\)[\s\S]*repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(page, /@media \(max-width: 820px\)[\s\S]*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.doesNotMatch(page, /repeat\(auto-fit, minmax\(240px, 300px\)\)/);
});

test('brand products paginate in two four-card rows', () => {
  assert.match(page, /id="brandProductPagination"/);
  assert.match(page, /function initBrandProductGrid\(products\)/);
  assert.match(page, /const pageSize = 8/);
  assert.match(page, /products\.slice\(currentPage \* pageSize, \(currentPage \+ 1\) \* pageSize\)/);
  assert.match(page, /data-page-prev/);
  assert.match(page, /data-page-next/);
  assert.match(page, /aria-current="page"/);
});

test('brand program inline scripts remain valid JavaScript', () => {
  const scripts = Array.from(page.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))
    .map(match => match[1]).filter(Boolean);
  scripts.forEach(source => assert.doesNotThrow(() => new Function(source)));
});

test('brand category buttons are sorted alphabetically, including dynamic categories', () => {
  const labels = Array.from(brandIndex.matchAll(/class="bp-type-item(?: active)?"[^>]*>([^<]+)<\/button>/g))
    .map(match => match[1].replace(/&amp;/g, '&'));
  assert.deepEqual(labels, [...labels].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' })));
  assert.match(brandIndex, /function sortBrandCategoryButtons\(\)/);
  assert.match(brandIndex, /sortBrandCategoryButtons\(\);\s*renderBrandPage\(\)/);
});
