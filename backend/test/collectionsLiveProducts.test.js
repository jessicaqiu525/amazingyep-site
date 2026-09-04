const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const collectionsPage = fs.readFileSync(
  path.join(__dirname, '..', '..', 'collections', 'index.html'),
  'utf8'
);

test('all collections loads featured and recommended cards from published products', () => {
  assert.match(collectionsPage, /fetch\(window\.API_CONFIG\.BASE_URL \+ '\/api\/products'\)/);
  assert.match(collectionsPage, /chooseFeaturedProducts\(products, 12\)/);
  assert.match(collectionsPage, /featured\.map\(renderCollectionProduct\)/);
  assert.match(collectionsPage, /recommendations\.map\(renderRecommendedProduct\)/);
  assert.match(collectionsPage, /filter\(function\(product\) \{\s*return Boolean\(productImage\(product\)\)/);
});

test('all collections inline scripts remain valid JavaScript', () => {
  const scripts = Array.from(collectionsPage.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))
    .map((match) => match[1])
    .filter(Boolean);
  scripts.forEach((source) => assert.doesNotThrow(() => new Function(source)));
});
