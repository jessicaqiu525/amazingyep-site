const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', '..');
const apiConfig = fs.readFileSync(path.join(root, 'api-config.js'), 'utf8');

test('category product grids paginate after twelve products', () => {
  assert.match(apiConfig, /const featuredPageSize = 12/);
  assert.match(apiConfig, /function drawJumpPagination/);
  assert.match(apiConfig, /data-' \+ key \+ '-jump/);
  assert.match(apiConfig, /data-' \+ key \+ '-page/);
  assert.match(apiConfig, /input\.onkeydown = function\(event\) \{ if \(event\.key === 'Enter'\) jump\(\); \}/);
  assert.match(apiConfig, /filteredProducts\.slice\(pageStart, pageStart \+ featuredPageSize\)/);
  assert.match(apiConfig, /function scrollFeaturedIntoView\(\)/);
  assert.match(apiConfig, /featuredSection = grid\.closest\('section'\) \|\| grid/);
  assert.match(apiConfig, /window\.scrollTo\(\{ top: Math\.max\(0, top\), behavior: 'smooth' \}\)/);
  assert.doesNotMatch(apiConfig, /grid\.scrollIntoView/);
});

test('recommended products support numbered pages and direct page entry', () => {
  assert.match(apiConfig, /drawJumpPagination\(recommendationPagination, recommendationPage, pageCount/);
  assert.match(apiConfig, /drawJumpPagination\(featuredPagination, featuredPage, pageCount/);
  assert.doesNotMatch(apiConfig, /recommendationPage \+= 1/);
});

test('featured search and product type filters reset pagination', () => {
  assert.match(apiConfig, /featuredSearchInput\.addEventListener\('input'/);
  assert.match(apiConfig, /featuredSearchQuery = String\(featuredSearchInput\.value/);
  assert.match(apiConfig, /selectedProductType = \/\^all products\$\/i/);
});

test('collection product types include a universal reset and support clearer display labels', () => {
  const apiConfig = fs.readFileSync(path.join(root, 'api-config.js'), 'utf8');
  const plushPage = fs.readFileSync(path.join(root, 'collections', 'plush-mascots.html'), 'utf8');

  assert.match(apiConfig, /allProductsItem\.textContent = 'All Products'/);
  assert.match(apiConfig, /item\.dataset\.productTypes \|\| item\.dataset\.productType/);
  assert.match(plushPage, /data-product-types="Custom Plush Toys\|Brand &amp; Team Mascots">Custom Plush &amp; Mascots/);
  assert.match(plushPage, /data-product-type="Holiday &amp; Seasonal Plush">Seasonal Plush/);
  assert.match(plushPage, />Wearable Mascot Costumes</);
});

test('shared product types can surface products across top-level collection categories', () => {
  assert.match(apiConfig, /const typeSourceProducts = selectedProductType \? allProducts : products/);
  assert.match(apiConfig, /typeSourceProducts\.filter\(function\(product\)/);
});

test('keychain product types merge overlapping functional keychain groups', () => {
  const keychainPage = fs.readFileSync(path.join(root, 'collections', 'keychains.html'), 'utf8');
  assert.match(keychainPage, /data-product-types="Bottle Opener Keychains\|Light-Up &amp; Functional Keychains">Functional Keychains/);
  assert.doesNotMatch(keychainPage, />Bottle Opener Keychains<|>Light-Up &amp; Functional Keychains</);
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
