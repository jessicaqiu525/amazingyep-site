const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const page = fs.readFileSync(
  path.join(__dirname, '..', '..', 'case-studies', 'index.html'),
  'utf8'
);

test('each use-case chip keeps its own destination', () => {
  const expected = {
    'Conference &amp; Event Swag': '../conference-swag.html',
    'Employee Engagement Kits': '../use-case-products.html?case=employee',
    'Character &amp; Mascot Programs': '../use-case-products.html?case=mascot',
    'Schools, Teams &amp; Communities': '../use-case-products.html?case=schools',
    'Brand Loyalty Programs': '../use-case-products.html?case=loyalty',
    'Travel &amp; Adventure Collection': '../use-case-products.html?case=travel',
    'Golf &amp; Sports Events': '../use-case-products.html?case=golf'
  };

  for (const [label, href] of Object.entries(expected)) {
    assert.match(page, new RegExp(
      `class="iu-type-item" data-href="${href.replace(/[?&]/g, '\\$&')}">${label}`
    ));
  }
});

test('the page has no broad conference-only navigation override', () => {
  assert.doesNotMatch(page, /label\.includes\('conference & event swag'\)/);
  assert.doesNotMatch(page, /window\.location\.assign\('\/conference-swag\.html'\)/);
});
