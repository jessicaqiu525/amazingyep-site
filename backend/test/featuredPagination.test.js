const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', '..');
const apiConfig = fs.readFileSync(path.join(root, 'api-config.js'), 'utf8');

test('category product grids paginate after twelve products', () => {
  assert.match(apiConfig, /const featuredPageSize = 12/);
  assert.match(apiConfig, /data-featured-prev/);
  assert.match(apiConfig, /data-featured-next/);
  assert.match(apiConfig, /filteredProducts\.slice\(pageStart, pageStart \+ featuredPageSize\)/);
  assert.match(apiConfig, /function scrollFeaturedIntoView\(\)/);
  assert.match(apiConfig, /featuredSection = grid\.closest\('section'\) \|\| grid/);
  assert.match(apiConfig, /window\.scrollTo\(\{ top: Math\.max\(0, top\), behavior: 'smooth' \}\)/);
  assert.doesNotMatch(apiConfig, /grid\.scrollIntoView/);
});

test('featured search and product type filters reset pagination', () => {
  assert.match(apiConfig, /featuredSearchInput\.addEventListener\('input'/);
  assert.match(apiConfig, /featuredSearchQuery = String\(featuredSearchInput\.value/);
  assert.match(apiConfig, /selectedProductType = \/\^all products\$\/i/);
});

test('every product collection page uses the shared grid initializer', () => {
  const pages = [
    'bags.html',
    'drinkware.html',
    'keychains.html',
    'plush-mascots.html',
    'office.html',
    'outdoor-leisure.html',
    'technology.html',
    'trade-show.html',
    'apparel.html',
    'gifts-seasonal.html',
    'games-activities.html'
  ];

  for (const pageName of pages) {
    const page = fs.readFileSync(path.join(root, 'collections', pageName), 'utf8');
    assert.match(page, /API_CONFIG\.initPage\(/, pageName);
  }
});

test('collections category controls navigate to dedicated pages', () => {
  const page = fs.readFileSync(path.join(root, 'collections', 'index.html'), 'utf8');
  assert.match(page, /href="bags\.html" class="collections-type-item" data-category="bags"/);
  assert.match(page, /href="plush-mascots\.html" class="collections-type-item" data-category="plush"/);
  assert.doesNotMatch(page, /showCollection\(this\.dataset\.category \|\| 'all'\)/);
});
