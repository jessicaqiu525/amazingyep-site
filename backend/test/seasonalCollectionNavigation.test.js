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

    const dropdown = page.match(/<ul class="nav-dropdown">([\s\S]*?)<\/ul>/)[1];
    const expectedOrder = [
      '>Bags</a>',
      '>Drinkware</a>',
      '>Gifts &amp; Seasonal</a>',
      '>Keychains &amp; Accessories</a>',
      '>Office &amp; Stationery</a>',
      '>Outdoor &amp; Leisure</a>',
      '>Plush &amp; Mascots</a>',
      '>Technology</a>',
      '>Trade Show</a>',
      '>Wearables</a>'
    ];
    const positions = expectedOrder.map((label) => dropdown.indexOf(label));
    assert.ok(positions.every((position) => position >= 0), path.relative(root, file));
    assert.deepEqual(positions, [...positions].sort((a, b) => a - b), path.relative(root, file));
  }
});

test('collections filters and cards use the same alphabetical order', () => {
  const page = fs.readFileSync(path.join(root, 'collections', 'index.html'), 'utf8');
  const categories = ['bags', 'drinkware', 'seasonal', 'keychains', 'office', 'outdoor', 'plush', 'technology', 'trade-show', 'wearables'];
  const filter = page.match(/<div class="collections-type-grid">([\s\S]*?)<\/div>/)[1];
  const grid = page.match(/<div class="collections-grid">([\s\S]*?)\n\s*<\/div>\n\n\s*<\/main>/)[1];

  for (const section of [filter, grid]) {
    const positions = categories.map((category) => section.indexOf(`data-category="${category}"`));
    assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
  }
});

test('keychains page title reflects the full category scope', () => {
  const page = fs.readFileSync(path.join(root, 'collections', 'keychains.html'), 'utf8');
  assert.match(page, /ALL KEYCHAINS &amp; ACCESSORIES/);
  assert.match(page, /<span>Keychains &amp; Accessories<\/span>/);
});

test('office page title reflects the full category scope', () => {
  const page = fs.readFileSync(path.join(root, 'collections', 'office.html'), 'utf8');
  assert.match(page, /ALL OFFICE &amp; STATIONERY/);
  assert.match(page, /<span>Office &amp; Stationery<\/span>/);
});
