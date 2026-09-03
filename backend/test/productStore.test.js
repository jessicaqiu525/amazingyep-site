const test = require('node:test');
const assert = require('node:assert/strict');
const {
  derivedUseCases,
  derivedWebsiteSubcategory,
  productMatches,
  recommendWebsitePlacement
} = require('../lib/productStore');

test('classifies a beverage-shaped enamel pin as an accessory', () => {
  const placement = recommendWebsitePlacement({
    name: 'Custom 7-Eleven BigGulp Enamel Pin',
    category: 'Drinkware',
    sageCategory1: 'Pins',
    websiteProductType: 'Pins',
    keywords: ['Lapel Pin', 'Collectible Pin', 'Beverage Enamel Pin'],
    themes: ['Beverage', 'Drinking', 'Outdoors', 'Restaurant'],
    description: 'A collectible pin for retail promotions and brand merchandise programs.'
  });

  assert.equal(placement.category, 'Keychains & Accessories');
  assert.equal(placement.websiteProductType, 'Pins & Patches');
  assert.deepEqual(placement.useCases, []);
});

test('removes a stale travel use case from an imported enamel pin', () => {
  const useCases = derivedUseCases({
    name: 'Custom 7-Eleven BigGulp Enamel Pin',
    category: 'Drinkware',
    sageCategory1: 'Pins',
    keywords: ['Lapel Pin', 'Collectible Pin'],
    themes: ['Outdoors'],
    useCases: ['loyalty', 'travel']
  });

  assert.deepEqual(useCases, []);
});

test('keeps explicit travel evidence for an accessory', () => {
  const placement = recommendWebsitePlacement({
    name: 'Travel Souvenir Enamel Pin',
    sageCategory1: 'Pins',
    keywords: ['Travel Souvenir Pin'],
    themes: ['Outdoors']
  });

  assert.equal(placement.category, 'Keychains & Accessories');
  assert.ok(placement.useCases.includes('travel'));
});

test('removes a cooler subcategory from a tote bag', () => {
  const subcategory = derivedWebsiteSubcategory({
    name: 'Select Zippered Tote',
    category: 'Bags',
    subcategory: 'Cooler Bags',
    websiteProductType: 'Tote & Shopping Bags',
    sageCategory1: 'Bags'
  });

  assert.equal(subcategory, '');
});

test('classifies Christmas decorations as gifts and seasonal products', () => {
  for (const sku of ['AK770', 'AK771']) {
    const placement = recommendWebsitePlacement({
      sku,
      name: 'Custom Christmas Decoration',
      category: 'Wearables',
      sageCategory1: 'Decorations'
    });
    assert.equal(placement.category, 'Gifts & Seasonal');
    assert.equal(placement.websiteProductType, 'Holiday Decorations');
  }
});

test('merges ornaments into holiday decorations', () => {
  for (const websiteProductType of ['Ornaments', 'Holiday Ornaments']) {
    const placement = recommendWebsitePlacement({
      name: 'Custom Blown Glass Christmas Ornament',
      category: 'Gifts & Seasonal',
      websiteProductType
    });
    assert.equal(placement.websiteProductType, 'Holiday Decorations');
  }
});

test('classifies wrapping paper as gift packaging', () => {
  const placement = recommendWebsitePlacement({
    sku: 'AK772',
    name: 'Custom Holiday Scratch and Sniff Wrapping Paper',
    category: 'Trade Show',
    sageCategory1: 'Gift Wrap',
    websiteProductType: 'Gift Wrap'
  });
  assert.equal(placement.category, 'Gifts & Seasonal');
  assert.equal(placement.websiteProductType, 'Gift Wrap & Packaging');
});

test('merges gift bags and boxes into gift wrap and packaging', () => {
  for (const name of ['Custom Gift Bag', 'Branded Gift Box']) {
    const placement = recommendWebsitePlacement({
      name,
      category: 'Gifts & Seasonal',
      websiteProductType: 'Gift Bags & Boxes'
    });
    assert.equal(placement.category, 'Gifts & Seasonal');
    assert.equal(placement.websiteProductType, 'Gift Wrap & Packaging');
  }
});

test('keeps a reusable tote out of gifts and seasonal', () => {
  const placement = recommendWebsitePlacement({
    sku: 'AW572',
    name: 'Heavyweight Pocket Tote',
    category: 'Bags',
    websiteProductType: 'Tote & Shopping Bags',
    keywords: ['Gift Bag', 'Reusable Bag']
  });

  assert.equal(placement.category, 'Bags');
});

test('classifies puzzles as games and activities', () => {
  const placement = recommendWebsitePlacement({
    sku: 'PUZZLE-1',
    name: 'Custom 500-Piece Jigsaw Puzzle',
    category: 'Gifts & Seasonal',
    sageCategory1: 'Puzzles'
  });

  assert.equal(placement.category, 'Games & Activities');
  assert.equal(placement.websiteProductType, 'Puzzles');
});

test('uses the reviewed use cases for current catalog products', () => {
  assert.deepEqual(derivedUseCases({
    sku: 'AK769',
    useCases: ['employee', 'loyalty']
  }), ['conference']);

  assert.deepEqual(derivedUseCases({
    itemNumber: 'AK753',
    useCases: ['conference', 'employee', 'schools', 'golf']
  }), ['conference', 'employee', 'schools']);

  assert.deepEqual(derivedUseCases({
    sku: 'AK771',
    useCases: []
  }), ['employee']);
});

test('repairs the old keychain type and cooler subcategory on AK764', () => {
  const product = {
    sku: 'AK764',
    name: 'Custom 7-Eleven x PacMan Enamel Pin Set',
    category: 'Keychains & Accessories',
    subcategory: 'Cooler Bags',
    sageCategory1: 'Pins',
    websiteProductType: 'Metal & Enamel Keychains',
    useCases: ['employee', 'loyalty']
  };

  const placement = recommendWebsitePlacement(product);
  assert.equal(placement.category, 'Keychains & Accessories');
  assert.equal(placement.websiteProductType, 'Pins & Patches');
  assert.deepEqual(placement.useCases, ['conference']);
  assert.equal(derivedWebsiteSubcategory(product), '');
});

test('category API filtering uses the repaired website category', () => {
  const stalePin = {
    sku: 'AK765',
    name: 'Custom 7-Eleven BigGulp Enamel Pin',
    category: 'Drinkware',
    sageCategory1: 'Pins',
    keywords: ['Lapel Pin', 'Soft Enamel Pin']
  };

  assert.equal(productMatches(stalePin, { category: 'Drinkware' }), false);
  assert.equal(productMatches(stalePin, { category: 'Keychains & Accessories' }), true);
});
