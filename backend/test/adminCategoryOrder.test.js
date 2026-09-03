const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', '..');
const adminPage = fs.readFileSync(path.join(root, 'backend', 'public', 'index.html'), 'utf8');
const expectedCategories = [
  'Bags',
  'Drinkware',
  'Games & Activities',
  'Gifts & Seasonal',
  'Keychains & Accessories',
  'Office & Stationery',
  'Outdoor & Leisure',
  'Plush & Mascots',
  'Technology',
  'Trade Show',
  'Wearables'
];

function optionLabels(selectId) {
  const select = adminPage.match(new RegExp(`<select[^>]*id="${selectId}"[^>]*>[\\s\\S]*?<\\/select>`));
  assert.ok(select, `${selectId} should exist`);
  return [...select[0].matchAll(/<option(?: [^>]*)?>([^<]+)<\/option>/g)]
    .map((match) => match[1].replaceAll('&amp;', '&'));
}

test('admin website category selectors list every category alphabetically', () => {
  assert.deepEqual(optionLabels('categoryFilter').slice(1), expectedCategories);
  assert.deepEqual(optionLabels('editorWebsiteCategory').slice(1), expectedCategories);
});
