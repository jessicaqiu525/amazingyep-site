const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', '..');

function htmlFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
      return htmlFiles(fullPath);
    }
    return entry.isFile() && entry.name.endsWith('.html') ? [fullPath] : [];
  });
}

test('gifts and seasonal has a collection page and catalog card', () => {
  const seasonalPage = fs.readFileSync(path.join(root, 'collections', 'gifts-seasonal.html'), 'utf8');
  const catalogPage = fs.readFileSync(path.join(root, 'collections', 'index.html'), 'utf8');

  assert.match(seasonalPage, /initPage\('Gifts & Seasonal', 'featuredGrid', 'seasonal'\)/);
  assert.match(seasonalPage, />Holiday Decorations</);
  assert.match(seasonalPage, />Gift Wrap &amp; Packaging</);
  assert.match(catalogPage, /href="gifts-seasonal\.html" data-category="seasonal"/);
  assert.match(catalogPage, /data-category="seasonal">Gifts &amp; Seasonal</);
});

test('every collections dropdown includes gifts and seasonal', () => {
  const dropdownPages = htmlFiles(root).filter((file) => {
    const page = fs.readFileSync(file, 'utf8');
    return page.includes('class="nav-dropdown"') && page.includes('Trade Show</a>');
  });

  assert.ok(dropdownPages.length > 20);
  for (const file of dropdownPages) {
    const page = fs.readFileSync(file, 'utf8');
    assert.match(page, /gifts-seasonal\.html"[^>]*>Gifts &amp; Seasonal</, path.relative(root, file));
  }
});
