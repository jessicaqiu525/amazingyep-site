const XLSX = require('xlsx');

const DEFAULTS = {
  priceCode: 'CCCCCC',
  priceIncludeColor: '1 color',
  priceIncludeSide: '1 side',
  priceIncludeLocation: '1 location',
  setupCharge: 80,
  setupChargeCode: 'C',
  packaging: 'Bulk,Case,Box',
  sampleTime: '5-7 working days after artwork approval',
  productionTimeLo: '18',
  productionTimeHi: '20',
  rushTimeLo: '',
  rushTimeHi: '',
  shipPointCountry: 'China',
  shipPointPostalCode: '',
  shippingByAir: '10-20 days',
  shippingBySea: '22-30 days'
};

const ALIASES = {
  productId: ['productid', 'product id', 'id'],
  sku: ['itemnum', 'item number', 'item #', 'item no', 'itemno', 'sku'],
  name: ['name', 'product name', 'prod name'],
  description: ['description', 'desc'],
  page1: ['page1', 'page 1'],
  page2: ['page2', 'page 2'],
  category: ['cat1name', 'website category', 'category'],
  subcategory: ['cat2name', 'website subcategory', 'subcategory'],
  sageCategory1: ['sage category', 'primary category', 'sage cat1', 'cat1name'],
  sageCategory2: ['secondary category', 'sage cat2', 'cat2name'],
  keywords: ['keywords', 'search keywords'],
  colors: ['colors', 'product color', 'product colors'],
  themes: ['themes', 'theme'],
  verified: ['verified'],
  discontinued: ['discontinued'],
  notPictured: ['not pictured', 'notpictured'],
  madeIn: ['made in'],
  assembledIn: ['assembled in'],
  decoratedIn: ['decorated in'],
  material: ['material'],
  productSize: ['product size', 'size'],
  imprintMethod: ['imprint method'],
  imprintArea: ['imprint area', 'primary imprint area'],
  imprintLocation: ['imprint location', 'primary imprint location'],
  secondaryImprintArea: ['secondary imprint area'],
  secondaryImprintLocation: ['secondary imprint location'],
  packaging: ['packaging'],
  unitsPerCarton: ['units/ctn', 'units per carton', 'case quantity'],
  weightPerCarton: ['weight/ctn', 'weight per carton', 'carton weight'],
  cartonL: ['carton l', 'carton length'],
  cartonW: ['carton w', 'carton width'],
  cartonH: ['carton h', 'carton height'],
  productL: ['product l', 'product length'],
  productW: ['product w', 'product width'],
  productH: ['product h', 'product height'],
  productUnit: ['product unit', 'dimension unit'],
  picture: ['picture', 'image', 'image url'],
  priceCode: ['prcode', 'price code'],
  priceIncludeColor: ['price include color', 'colors included'],
  priceIncludeSide: ['price include side', 'sides'],
  priceIncludeLocation: ['price include location', 'locations'],
  setupCharge: ['setup charge', 'setup'],
  setupChargeCode: ['setup charge code', 'setup code'],
  screenCharge: ['screen charge'],
  screenChargeCode: ['screen charge code'],
  dieCharge: ['die charge'],
  dieChargeCode: ['die charge code'],
  additionalColorSetup: ["add'l color/location setup", 'additional color setup'],
  additionalColorSetupCode: ["add'l color/location setup code", 'additional color setup code'],
  sampleTime: ['sample', 'sample time'],
  productionTimeLo: ['production time lo', 'production time low', 'production lo'],
  productionTimeHi: ['production time hi', 'production time high', 'production hi'],
  rushTimeLo: ['rush service lo', 'rush lo'],
  rushTimeHi: ['rush service hi', 'rush hi'],
  shipPointCountry: ['ship point country', 'shipping point country'],
  shipPointPostalCode: ['shippointzip', 'ship point zip', 'zip / postal code'],
  shippingByAir: ['air shipping'],
  shippingBySea: ['sea shipping']
};

function normalizeHeader(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');
}

function compactHeader(value) {
  return normalizeHeader(value).replace(/[^a-z0-9]+/g, '');
}

function get(row, headerMap, key) {
  const aliases = ALIASES[key] || [key];
  for (const alias of aliases) {
    const normalized = normalizeHeader(alias);
    const compact = compactHeader(alias);
    const index = headerMap.get(normalized) ?? headerMap.get(compact);
    if (index !== undefined) return row[index];
  }
  return '';
}

function text(value) {
  return String(value ?? '').trim();
}

function numberText(value) {
  const raw = text(value);
  if (!raw) return '';
  const numeric = Number(raw);
  return Number.isFinite(numeric) ? String(numeric) : raw;
}

function moneyText(value) {
  const raw = text(value);
  if (!raw) return '';
  if (/^\$/.test(raw)) return raw;
  const numeric = Number(String(raw).replace(/[$,]/g, ''));
  return Number.isFinite(numeric) ? '$' + numeric.toFixed(2).replace(/\.00$/, '') : raw;
}

function list(value) {
  return text(value)
    .split(/[,;\n|]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function bool(value) {
  const raw = text(value).toLowerCase();
  return ['true', 'yes', 'y', '1', 'published', 'active'].includes(raw);
}

function findHeaderRow(rows) {
  let best = { index: 0, score: -1 };
  rows.slice(0, 30).forEach((row, index) => {
    const headers = row.map(compactHeader);
    const score = ['itemnum', 'itemnumber', 'productid', 'name', 'productname', 'description', 'qty1', 'prc1']
      .reduce((total, key) => total + (headers.includes(key) ? 1 : 0), 0);
    if (score > best.score) best = { index, score };
  });
  return best.score > 0 ? best.index : 0;
}

function buildHeaderMap(row) {
  const map = new Map();
  row.forEach((value, index) => {
    const normalized = normalizeHeader(value);
    const compact = compactHeader(value);
    if (normalized && !map.has(normalized)) map.set(normalized, index);
    if (compact && !map.has(compact)) map.set(compact, index);
  });
  return map;
}

function pricingFrom(row, headerMap) {
  const pricing = [];
  for (let i = 1; i <= 6; i += 1) {
    const qty = get(row, headerMap, 'qty' + i) || row[headerMap.get('qty' + i)];
    const price = get(row, headerMap, 'prc' + i) || row[headerMap.get('prc' + i)];
    const pieces = get(row, headerMap, 'piecesperunit' + i) || row[headerMap.get('piecesperunit' + i)];
    if (text(qty) || text(price)) {
      pricing.push({
        quantity: numberText(qty),
        codedPrice: moneyText(price),
        piecesPerUnit: numberText(pieces) || '1'
      });
    }
  }
  return pricing;
}

function parseSageWorkbook(filePath) {
  const workbook = XLSX.readFile(filePath, { cellDates: false });
  const sheetName =
    workbook.SheetNames.find((name) => name.toLowerCase() === 'sheet2') ||
    workbook.SheetNames[1] ||
    workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  const warnings = [];
  if (!rows.length) return { products: [], warnings: ['The workbook is empty.'] };
  const headerIndex = findHeaderRow(rows);
  const headerMap = buildHeaderMap(rows[headerIndex]);
  const products = [];

  rows.slice(headerIndex + 1).forEach((row) => {
    const sku = text(get(row, headerMap, 'sku')).toUpperCase();
    const name = text(get(row, headerMap, 'name'));
    if (!sku && !name) return;

    const colors = list(get(row, headerMap, 'colors'));
    const themes = list(get(row, headerMap, 'themes')).slice(0, 5);
    const picture = text(get(row, headerMap, 'picture'));
    const pricing = pricingFrom(row, headerMap);
    const productSize = text(get(row, headerMap, 'productSize'));
    const imprintArea = text(get(row, headerMap, 'imprintArea'));
    const imprintMethod = text(get(row, headerMap, 'imprintMethod'));
    const packaging = text(get(row, headerMap, 'packaging')) || DEFAULTS.packaging;

    products.push({
      id: numberText(get(row, headerMap, 'productId')),
      sku,
      itemNumber: sku,
      name: name || sku,
      description: text(get(row, headerMap, 'description')),
      page1: text(get(row, headerMap, 'page1')),
      page2: text(get(row, headerMap, 'page2')),
      category: text(get(row, headerMap, 'category')),
      subcategory: text(get(row, headerMap, 'subcategory')),
      sageCategory1: text(get(row, headerMap, 'sageCategory1')),
      sageCategory2: text(get(row, headerMap, 'sageCategory2')),
      keywords: list(get(row, headerMap, 'keywords')),
      colors,
      colorOptions: colors.map((color) => ({ name: color, image: '' })),
      themes,
      verified: bool(get(row, headerMap, 'verified')),
      discontinued: bool(get(row, headerMap, 'discontinued')),
      notPictured: bool(get(row, headerMap, 'notPictured')),
      published: !bool(get(row, headerMap, 'discontinued')),
      madeIn: text(get(row, headerMap, 'madeIn')),
      assembledIn: text(get(row, headerMap, 'assembledIn')),
      decoratedIn: text(get(row, headerMap, 'decoratedIn')),
      images: picture ? [picture] : [],
      gallery: [],
      sagePictureUrl: picture,
      productDetails: {
        material: text(get(row, headerMap, 'material')),
        size: productSize,
        imprintMethod,
        imprintArea,
        packaging,
        specs: [
          text(get(row, headerMap, 'material')) ? { label: 'Material', value: text(get(row, headerMap, 'material')) } : null,
          productSize ? { label: 'Product Size', value: productSize } : null,
          imprintMethod ? { label: 'Imprint Method', value: imprintMethod } : null,
          imprintArea ? { label: 'Imprint Area', value: imprintArea } : null,
          packaging ? { label: 'Packaging', value: packaging } : null
        ].filter(Boolean)
      },
      dimensions: {
        length: numberText(get(row, headerMap, 'productL')),
        width: numberText(get(row, headerMap, 'productW')),
        height: numberText(get(row, headerMap, 'productH')),
        unit: text(get(row, headerMap, 'productUnit')) || 'Inches'
      },
      carton: {
        units: numberText(get(row, headerMap, 'unitsPerCarton')),
        weight: numberText(get(row, headerMap, 'weightPerCarton')),
        length: numberText(get(row, headerMap, 'cartonL')),
        width: numberText(get(row, headerMap, 'cartonW')),
        height: numberText(get(row, headerMap, 'cartonH'))
      },
      pricing,
      priceCode: text(get(row, headerMap, 'priceCode')) || DEFAULTS.priceCode,
      priceIncludeColor: text(get(row, headerMap, 'priceIncludeColor')) || DEFAULTS.priceIncludeColor,
      priceIncludeSide: text(get(row, headerMap, 'priceIncludeSide')) || DEFAULTS.priceIncludeSide,
      priceIncludeLocation: text(get(row, headerMap, 'priceIncludeLocation')) || DEFAULTS.priceIncludeLocation,
      setupCharge: numberText(get(row, headerMap, 'setupCharge')) || DEFAULTS.setupCharge,
      setupChargeCode: text(get(row, headerMap, 'setupChargeCode')) || DEFAULTS.setupChargeCode,
      screenCharge: numberText(get(row, headerMap, 'screenCharge')),
      screenChargeCode: text(get(row, headerMap, 'screenChargeCode')),
      dieCharge: numberText(get(row, headerMap, 'dieCharge')),
      dieChargeCode: text(get(row, headerMap, 'dieChargeCode')),
      additionalColorSetup: numberText(get(row, headerMap, 'additionalColorSetup')),
      additionalColorSetupCode: text(get(row, headerMap, 'additionalColorSetupCode')),
      packaging,
      sampleTime: text(get(row, headerMap, 'sampleTime')) || DEFAULTS.sampleTime,
      productionTimeLo: numberText(get(row, headerMap, 'productionTimeLo')) || DEFAULTS.productionTimeLo,
      productionTimeHi: numberText(get(row, headerMap, 'productionTimeHi')) || DEFAULTS.productionTimeHi,
      rushTimeLo: numberText(get(row, headerMap, 'rushTimeLo')) || DEFAULTS.rushTimeLo,
      rushTimeHi: numberText(get(row, headerMap, 'rushTimeHi')) || DEFAULTS.rushTimeHi,
      shipPointCountry: text(get(row, headerMap, 'shipPointCountry')) || DEFAULTS.shipPointCountry,
      shipPointPostalCode: text(get(row, headerMap, 'shipPointPostalCode')) || DEFAULTS.shipPointPostalCode,
      shippingByAir: text(get(row, headerMap, 'shippingByAir')) || DEFAULTS.shippingByAir,
      shippingBySea: text(get(row, headerMap, 'shippingBySea')) || DEFAULTS.shippingBySea
    });
  });

  if (!products.length) warnings.push('No products were found. Check that the first sheet has SAGE product columns.');
  return { products, warnings, headerRow: headerIndex + 1 };
}

module.exports = { parseSageWorkbook };
