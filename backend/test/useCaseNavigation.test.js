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

test('brand loyalty is removed and golf is featured once', () => {
  assert.doesNotMatch(page, /Brand Loyalty Programs|case=loyalty/);
  const golfUseCaseLinks = page.match(/class="iu-type-item"[^>]+case=golf/g) || [];
  assert.equal(golfUseCaseLinks.length, 1);
});

test('golf use case includes a dedicated golf accessories filter', () => {
  const useCasePage = fs.readFileSync(
    path.join(__dirname, '..', '..', 'use-case-products.html'),
    'utf8'
  );
  assert.match(useCasePage, /\['Golf Accessories',\['golf headcover','golf head cover','golf ball','golf bag','golf club','golf tool','golf kit','golf plush','golf mascot'\]\]/);
  assert.match(useCasePage, /\['Team & Fan Gear',\['scarf','scarves','sports mascot','team mascot','school mascot','rally towel','team flag','pennant','fan banner','foam finger','pom-pom','cheer gear','fan gear','supporter gear','team merchandise'\]\]/);
  assert.match(useCasePage, /\['Jackets & Outerwear',\['jacket','outerwear','snowsuit','snow gear','ski wear','winter jumpsuit'\]\]/);
  assert.match(useCasePage, /if\(isGolfAccessory\)return activeType==='Golf Accessories'/);
  assert.match(useCasePage, /if\(websiteType\)return websiteType\.toLowerCase\(\)===activeType\.toLowerCase\(\)/);
  assert.match(useCasePage, /if\(activeType==='Team & Fan Gear'\)return activeTerms\.some/);
});

test('ideas page shows live products with direct pagination and recommendations', () => {
  assert.match(page, /fetch\(window\.API_CONFIG\.BASE_URL \+ '\/api\/products'\)/);
  assert.match(page, /const featuredPageSize = 12/);
  assert.match(page, /const recommendedPageSize = 6/);
  assert.match(page, /filtered\.slice\(featuredPage \* featuredPageSize/);
  assert.match(page, /recommendedProducts\.slice\(recommendedPage \* recommendedPageSize/);
  assert.match(page, /YOU MIGHT ALSO LIKE/);
  assert.match(page, /function drawDirectPagination/);
  assert.match(page, /data-' \+ key \+ '-jump/);
  assert.doesNotMatch(page, /conference-swag-hero\.jpg/);
});

test('ideas page inline scripts remain valid JavaScript', () => {
  const scripts = Array.from(page.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))
    .map((match) => match[1])
    .filter(Boolean);
  scripts.forEach((source) => assert.doesNotThrow(() => new Function(source)));
});

test('use case subtitles are normal style and use approved copy', () => {
  const useCasePage = fs.readFileSync(path.join(__dirname, '..', '..', 'use-case-products.html'), 'utf8');
  const conferencePage = fs.readFileSync(path.join(__dirname, '..', '..', 'conference-swag.html'), 'utf8');
  assert.match(page, /Ideas that inspire, products that make an impact/);
  assert.match(page, /\.iu-subtitle \{[^}]*font-style: normal/);
  assert.match(useCasePage, /\.swag-subtitle\{font-style:normal\}/);
  assert.match(conferencePage, /\.swag-subtitle\{font-style:normal\}/);
  assert.match(useCasePage, /Explore custom plush toys, mascot merchandise/);
  assert.match(useCasePage, /Products made for tournaments, teams, and fan experiences/);
  assert.match(useCasePage, /Explore golf accessories, sports merchandise, tournament kits, team and fan gear/);
});

test('every use case detail page has a functional collapsible filter', () => {
  ['conference-swag.html', 'use-case-products.html'].forEach((file) => {
    const source = fs.readFileSync(path.join(__dirname, '..', '..', file), 'utf8');
    assert.match(source, /id="filterToggle"[^>]+aria-expanded="true"/);
    assert.match(source, /id="filterSearch"/);
    assert.match(source, /filterSearch\.hidden=expanded;filterTypes\.hidden=expanded/);

    const scripts = [...source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
      .map((match) => match[1].trim())
      .filter(Boolean);
    scripts.forEach((code) => assert.doesNotThrow(() => new Function(code)));
  });
});

test('conference product types cover event merchandise without redundant booth categories', () => {
  const conferencePage = fs.readFileSync(path.join(__dirname, '..', '..', 'conference-swag.html'), 'utf8');
  const expected = [
    'Lanyards &amp; Badges',
    'Bags',
    'Drinkware',
    'Hats &amp; Apparel',
    'Notebooks &amp; Writing',
    'Mascots &amp; Plush',
    'Tech Accessories',
    'Event Displays'
  ];
  expected.forEach((label) => assert.match(conferencePage, new RegExp(`>${label}</button>`)));
  assert.match(conferencePage, /data-type="Event Displays"[^>]+booth accessory/);
  assert.doesNotMatch(conferencePage, /data-type="Booth Accessories"/);
  assert.doesNotMatch(conferencePage, /data-type="Power Banks"/);
});

test('employee product types use concise program-ready groups', () => {
  const useCasePage = fs.readFileSync(path.join(__dirname, '..', '..', 'use-case-products.html'), 'utf8');
  const employeeConfig = useCasePage.match(/employee:\{[\s\S]*?\},\n\s*mascot:/)?.[0] || '';
  [
    'Bags',
    'Drinkware',
    'Apparel & Wearables',
    'Office & Writing',
    'Mascots & Plush',
    'Tech Accessories',
    'Wellness & Lifestyle',
    'Awards & Recognition'
  ].forEach((label) => assert.match(employeeConfig, new RegExp(`\\['${label.replace('&', '\\&')}'`)));
  assert.doesNotMatch(employeeConfig, /'Tote & Shopping Bags'|'Backpacks & Drawstring Bags'|'Mugs & Cups'|'T-Shirts'|'Power Banks'|'Notebooks & Writing'|'Desk & Office'/);
});

test('character and mascot product types use clear non-overlapping groups', () => {
  const useCasePage = fs.readFileSync(path.join(__dirname, '..', '..', 'use-case-products.html'), 'utf8');
  const mascotConfig = useCasePage.match(/mascot:\{[\s\S]*?\},\n\s*schools:/)?.[0] || '';
  [
    'Custom Plush Toys',
    'Wearable Mascot Costumes',
    'Plush Pillows',
    'Keychains & Collectibles',
    'Character Wearables'
  ].forEach((label) => assert.match(mascotConfig, new RegExp(`\\['${label.replace('&', '\\&')}'`)));
  assert.doesNotMatch(mascotConfig, /'PVC & Rubber Keychains'|'Metal & Enamel Keychains'|'Brand & Team Mascots'|'Plush Keychains'|'Character Keychains'|'Pins, Patches & Collectibles'|'Character Apparel & Accessories'/);
});

test('school and community product types use broad non-duplicate groups', () => {
  const useCasePage = fs.readFileSync(path.join(__dirname, '..', '..', 'use-case-products.html'), 'utf8');
  const schoolsConfig = useCasePage.match(/schools:\{[\s\S]*?\},\n\s*travel:/)?.[0] || '';
  [
    'Apparel & Wearables',
    'Bags',
    'Drinkware',
    'Mascots & Plush',
    'Team & Fan Gear',
    'School & Office Supplies',
    'Tech Accessories',
    'Awards & Recognition'
  ].forEach((label) => assert.match(schoolsConfig, new RegExp(`\\['${label.replace('&', '\\&')}'`)));
  assert.doesNotMatch(schoolsConfig, /'T-Shirts'|'Hoodies & Sweatshirts'|'Hats & Caps'|'Backpacks & Drawstring Bags'|'Water Bottles'|'Brand & Team Mascots'|'Custom Plush Toys'|'Pins & Patches'|'Flags'/);
});

test('all use case detail templates paginate featured and recommended products consistently', () => {
  ['conference-swag.html', 'use-case-products.html'].forEach((file) => {
    const source = fs.readFileSync(path.join(__dirname, '..', '..', file), 'utf8');
    assert.match(source, /id="featuredPagination"/);
    assert.match(source, /id="recommendedPagination"/);
    assert.match(source, /const featuredPageSize=12/);
    assert.match(source, /const recommendedPageSize=6/);
    assert.match(source, /\.swag-recs-grid\{display:grid;grid-template-columns:repeat\(6,minmax\(0,1fr\)\)/);
    assert.match(source, /function drawDirectPagination/);
    assert.match(source, /data-'\+key\+'-jump/);
    assert.match(source, /filtered\.slice\(featuredPage\*featuredPageSize/);
    assert.match(source, /recommendedProducts\.slice\(recommendedPage\*recommendedPageSize/);
    assert.doesNotMatch(source, /\.slice\(0,5\)/);
  });
});
