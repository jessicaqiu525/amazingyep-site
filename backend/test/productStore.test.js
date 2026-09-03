const test = require('node:test');
const assert = require('node:assert/strict');
const {
  derivedUseCases,
  derivedWebsiteSubcategory,
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
  assert.deepEqual(placement.useCases, ['loyalty']);
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

  assert.deepEqual(useCases, ['loyalty']);
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

test('uses the reviewed use cases for current catalog products', () => {
  assert.deepEqual(derivedUseCases({
    sku: 'AK769',
    useCases: ['employee', 'loyalty']
  }), ['conference', 'loyalty']);

  assert.deepEqual(derivedUseCases({
    itemNumber: 'AK753',
    useCases: ['conference', 'employee', 'schools', 'golf']
  }), ['conference', 'employee', 'schools', 'loyalty']);

  assert.deepEqual(derivedUseCases({
    sku: 'AK771',
    useCases: []
  }), ['employee', 'loyalty']);
});
