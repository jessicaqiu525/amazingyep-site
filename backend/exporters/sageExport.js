const fs = require('fs');
const path = require('path');

function getXlsx() {
  try {
    return require('xlsx');
  } catch (error) {
    throw new Error('The "xlsx" package is required for SAGE export. Run npm install in the backend before exporting.');
  }
}

const KNOWN_HEADER_NAMES = new Set([
  'ProductID',
  'ItemNum',
  'Name',
  'Page1',
  'Page2',
  'Description',
  'Cat1Name',
  'Cat2Name',
  'Keywords',
  'Colors',
  'Themes',
  'Verified',
  'Discontinued',
  'MadeInCountry',
  'AssembledInCountry',
  'DecoratedInCountry',
  'ShipPointCountry',
  'Dimension1',
  'Dimension2',
  'Dimension3',
  'Dimension1Type',
  'Dimension2Type',
  'Dimension3Type',
  'Dimension1Units',
  'Dimension2Units',
  'Dimension3Units',
  'UnitsPerCarton',
  'WeightPerCarton',
  'CartonL',
  'CartonW',
  'CartonH',
  'ImprintLoc',
  'SecondImprintLoc',
  'ImprintSize1',
  'ImprintSize2',
  'SecondImprintSize1',
  'SecondImprintSize2',
  'ImprintSize1Type',
  'ImprintSize2Type',
  'SecondImprintSize1Type',
  'SecondImprintSize2Type',
  'ImprintSize1Units',
  'ImprintSize2Units',
  'SecondImprintSize1Units',
  'SecondImprintSize2Units',
  'PriceIncludeClr',
  'PriceIncludeLoc',
  'PriceIncludeSide',
  'SetupChg',
  'SetupChgCode',
  'AddClrChgCode',
  'AddClrRunChgCode',
  'RepeatChgCode',
  'ScreenChg',
  'ScreenChgCode',
  'PlateChgCode',
  'DieChg',
  'DieChgCode',
  'ToolingChgCode',
  'NewPictureURL',
  'NewBlankPictureURL',
  'NewPictureFile',
  'NewBlankPictureFile',
  'ErasePicture',
  'EraseBlankPicture',
  'NotPictured',
  'ExpirationDate',
  'ProductionTimeLo',
  'ProductionTimeHi',
  'RushProdTimeLo',
  'RushProdTimeHi',
  'ShipPointZip',
  'PrCode',
  'Qty1',
  'Qty2',
  'Qty3',
  'Qty4',
  'Qty5',
  'Qty6',
  'Prc1',
  'Prc2',
  'Prc3',
  'Prc4',
  'Prc5',
  'Prc6',
  'PiecesPerUnit1',
  'PiecesPerUnit2',
  'PiecesPerUnit3',
  'PiecesPerUnit4',
  'PiecesPerUnit5',
  'PiecesPerUnit6'
]);

function firstDefined() {
  for (let i = 0; i < arguments.length; i += 1) {
    const value = arguments[i];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return '';
}

function toListText(value) {
  if (!value) return '';
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (!item) return '';
        if (typeof item === 'string') return item;
        return item.name || item.value || item.label || '';
      })
      .filter(Boolean)
      .join(', ');
  }
  return String(value);
}

function moneyNumber(value) {
  if (value === undefined || value === null || value === '') return '';
  if (typeof value === 'number') return value;
  const cleaned = String(value).replace(/[^0-9.-]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : '';
}

function quantityNumber(value) {
  if (value === undefined || value === null || value === '') return '';
  if (typeof value === 'number') return value;
  const cleaned = String(value).replace(/[^0-9]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : '';
}

function parseArea(value) {
  if (!value) return {};
  const text = String(value);
  const numbers = text.match(/\d+(?:\.\d+)?/g) || [];
  const unitsMatch = text.match(/\b(inches|inch|in|cm|mm)\b/i);
  return {
    size1: numbers[0] || '',
    size2: numbers[1] || '',
    units: unitsMatch ? unitsMatch[0].replace(/^in$/i, 'Inches') : ''
  };
}

function getPricing(product) {
  const pricing = Array.isArray(product.pricing) ? product.pricing : [];
  return pricing.slice(0, 6).map((row) => ({
    quantity: quantityNumber(firstDefined(row.quantity, row.qty, row.minQuantity)),
    price: moneyNumber(firstDefined(row.price, row.unitPrice, row.priceEach)),
    piecesPerUnit: quantityNumber(firstDefined(row.piecesPerUnit, row.pieces, 1))
  }));
}

function getPrimaryImageUrl(product) {
  const images = []
    .concat(product.images || [])
    .concat(product.gallery || [])
    .concat((product.colorOptions || []).map((option) => option && option.image));

  return images.find((img) => typeof img === 'string' && /^https?:\/\//i.test(img)) || '';
}

function getHeaderRowIndex(rows) {
  let bestIndex = -1;
  let bestScore = 0;

  rows.forEach((row, index) => {
    const score = row.reduce((sum, cell) => {
      return sum + (KNOWN_HEADER_NAMES.has(String(cell || '').trim()) ? 1 : 0);
    }, 0);
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });

  if (bestScore < 3) {
    throw new Error('Could not find the SAGE header row. Please confirm this is a SAGE Bulk Product Update workbook.');
  }

  return bestIndex;
}

function mapProductToSage(product) {
  const pricing = getPricing(product);
  const sage = product.sage || {};
  const dimensions = product.dimensions || {};
  const imprint = product.imprint || {};
  const carton = product.carton || {};
  const production = product.production || {};
  const priceIncludes = product.priceIncludes || {};
  const primaryArea = parseArea(product.imprintArea);
  const secondaryArea = parseArea(product.secondaryImprintArea || product.secondImprintArea);
  const row = {
    ProductID: firstDefined(product.sageProductId, product.productId, product.id),
    ItemNum: firstDefined(product.sku, product.itemNumber, product.itemNo),
    Name: product.name || '',
    Page1: firstDefined(product.catalogPage1, sage.page1),
    Page2: firstDefined(product.catalogPage2, sage.page2),
    Description: product.description || '',
    Cat1Name: firstDefined(product.sageCategory1, product.category),
    Cat2Name: firstDefined(product.sageCategory2, product.subcategory),
    Keywords: toListText(product.keywords),
    Colors: toListText(firstDefined(product.colors, product.colorOptions)),
    Themes: toListText(product.themes),
    Verified: product.verified ? 'True' : '',
    Discontinued: product.discontinued ? 'True' : '',
    MadeInCountry: firstDefined(product.madeInCountry, product.countryOfOrigin, sage.madeInCountry),
    AssembledInCountry: firstDefined(product.assembledInCountry, sage.assembledInCountry),
    DecoratedInCountry: firstDefined(product.decoratedInCountry, sage.decoratedInCountry),
    ShipPointCountry: firstDefined(product.shipPointCountry, sage.shipPointCountry),
    Dimension1: firstDefined(product.dimension1, dimensions.length),
    Dimension2: firstDefined(product.dimension2, dimensions.width),
    Dimension3: firstDefined(product.dimension3, dimensions.height),
    Dimension1Type: firstDefined(product.dimension1Type, dimensions.lengthType, 'L'),
    Dimension2Type: firstDefined(product.dimension2Type, dimensions.widthType, 'W'),
    Dimension3Type: firstDefined(product.dimension3Type, dimensions.heightType, 'H'),
    Dimension1Units: firstDefined(product.dimension1Units, dimensions.units),
    Dimension2Units: firstDefined(product.dimension2Units, dimensions.units),
    Dimension3Units: firstDefined(product.dimension3Units, dimensions.units),
    UnitsPerCarton: firstDefined(product.unitsPerCarton, carton.unitsPerCarton),
    WeightPerCarton: firstDefined(product.weightPerCarton, product.cartonWeight, carton.weight),
    CartonL: firstDefined(product.cartonL, carton.length),
    CartonW: firstDefined(product.cartonW, carton.width),
    CartonH: firstDefined(product.cartonH, carton.height),
    ImprintLoc: firstDefined(product.imprintLocation, product.imprintLoc, imprint.primaryLocation),
    SecondImprintLoc: firstDefined(product.secondaryImprintLocation, product.secondImprintLocation, imprint.secondaryLocation),
    ImprintSize1: firstDefined(product.imprintSize1, imprint.primaryWidth, primaryArea.size1, product.imprintArea),
    ImprintSize2: firstDefined(product.imprintSize2, imprint.primaryHeight, primaryArea.size2),
    SecondImprintSize1: firstDefined(product.secondImprintSize1, product.secondaryImprintSize1, secondaryArea.size1),
    SecondImprintSize2: firstDefined(product.secondImprintSize2, product.secondaryImprintSize2, secondaryArea.size2),
    ImprintSize1Type: firstDefined(product.imprintSize1Type, imprint.primaryWidthType, 'W'),
    ImprintSize2Type: firstDefined(product.imprintSize2Type, imprint.primaryHeightType, 'H'),
    SecondImprintSize1Type: firstDefined(product.secondImprintSize1Type, product.secondaryImprintSize1Type, 'W'),
    SecondImprintSize2Type: firstDefined(product.secondImprintSize2Type, product.secondaryImprintSize2Type, 'H'),
    ImprintSize1Units: firstDefined(product.imprintSize1Units, imprint.units, primaryArea.units),
    ImprintSize2Units: firstDefined(product.imprintSize2Units, imprint.units, primaryArea.units),
    SecondImprintSize1Units: firstDefined(product.secondImprintSize1Units, product.secondaryImprintSize1Units, secondaryArea.units),
    SecondImprintSize2Units: firstDefined(product.secondImprintSize2Units, product.secondaryImprintSize2Units, secondaryArea.units),
    PriceIncludeClr: firstDefined(product.priceIncludeColor, priceIncludes.colors),
    PriceIncludeLoc: firstDefined(product.priceIncludeLocation, priceIncludes.locations),
    PriceIncludeSide: firstDefined(product.priceIncludeSide, priceIncludes.sides),
    SetupChg: moneyNumber(firstDefined(product.setupCharge, product.setupChg)),
    SetupChgCode: firstDefined(product.setupChargeCode, sage.setupChargeCode),
    AddClrChgCode: product.addColorLocationSetupCode || product.addColorChargeCode || '',
    AddClrRunChgCode: product.addColorRunChargeCode || '',
    RepeatChgCode: product.repeatChargeCode || '',
    ScreenChg: moneyNumber(product.screenCharge),
    ScreenChgCode: product.screenChargeCode || '',
    PlateChgCode: product.plateChargeCode || '',
    DieChg: moneyNumber(product.dieCharge),
    DieChgCode: product.dieChargeCode || '',
    ToolingChgCode: product.toolingChargeCode || '',
    NewPictureURL: firstDefined(product.sagePictureUrl, getPrimaryImageUrl(product)),
    NewBlankPictureURL: product.sageBlankPictureUrl || '',
    NewPictureFile: product.sagePictureFile || '',
    NewBlankPictureFile: product.sageBlankPictureFile || '',
    ErasePicture: product.erasePicture ? 'True' : '',
    EraseBlankPicture: product.eraseBlankPicture ? 'True' : '',
    NotPictured: product.notPictured ? 'True' : '',
    ExpirationDate: firstDefined(product.expirationDate, sage.expirationDate),
    ProductionTimeLo: firstDefined(product.productionTimeLo, production.timeLo),
    ProductionTimeHi: firstDefined(product.productionTimeHi, production.timeHi),
    RushProdTimeLo: firstDefined(product.rushProdTimeLo, production.rushLo),
    RushProdTimeHi: firstDefined(product.rushProdTimeHi, production.rushHi),
    ShipPointZip: firstDefined(product.shipPointPostalCode, sage.shipPointPostalCode),
    PrCode: product.priceCode || ''
  };

  for (let i = 0; i < 6; i += 1) {
    row['Qty' + (i + 1)] = pricing[i] ? pricing[i].quantity : '';
    row['Prc' + (i + 1)] = pricing[i] ? pricing[i].price : '';
    row['PiecesPerUnit' + (i + 1)] = pricing[i] ? pricing[i].piecesPerUnit : (product['piecesPerUnit' + (i + 1)] || '');
  }

  return row;
}

function findExistingProductRow(rows, headerRowIndex, headerIndex, product) {
  const itemCol = headerIndex.ItemNum;
  const productIdCol = headerIndex.ProductID;
  const sku = String(firstDefined(product.sku, product.itemNumber, product.itemNo)).trim().toUpperCase();
  const productId = String(firstDefined(product.sageProductId, product.productId, product.id)).trim().toUpperCase();

  for (let rowIndex = headerRowIndex + 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] || [];
    const rowItem = itemCol === undefined ? '' : String(row[itemCol] || '').trim().toUpperCase();
    const rowProductId = productIdCol === undefined ? '' : String(row[productIdCol] || '').trim().toUpperCase();
    if (sku && rowItem === sku) return rowIndex;
    if (productId && rowProductId === productId) return rowIndex;
  }

  return -1;
}

function exportSageWorkbook(options) {
  const XLSX = getXlsx();
  const templatePath = options.templatePath;
  const outputPath = options.outputPath;
  const products = Array.isArray(options.products) ? options.products : [];

  if (!templatePath || !fs.existsSync(templatePath)) {
    throw new Error('SAGE template file was not found: ' + templatePath);
  }
  if (!products.length) {
    throw new Error('No products were provided for SAGE export.');
  }

  const workbook = XLSX.readFile(templatePath, { cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  const headerRowIndex = getHeaderRowIndex(rows);
  const headers = rows[headerRowIndex].map((cell) => String(cell || '').trim());
  const headerIndex = {};

  headers.forEach((header, index) => {
    if (header) headerIndex[header] = index;
  });

  products.forEach((product) => {
    const sageRow = mapProductToSage(product);
    let targetRowIndex = findExistingProductRow(rows, headerRowIndex, headerIndex, product);
    if (targetRowIndex === -1) {
      targetRowIndex = rows.length;
      rows[targetRowIndex] = new Array(headers.length).fill('');
    }

    Object.entries(sageRow).forEach(([header, value]) => {
      const colIndex = headerIndex[header];
      if (colIndex !== undefined) {
        rows[targetRowIndex][colIndex] = value;
      }
    });
  });

  workbook.Sheets[sheetName] = XLSX.utils.aoa_to_sheet(rows);
  delete workbook.Props;
  delete workbook.Custprops;
  delete workbook.Workbook;
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  XLSX.writeFile(workbook, outputPath, { bookType: 'biff8' });

  return {
    outputPath,
    sheetName,
    headerRow: headerRowIndex + 1,
    productCount: products.length
  };
}

module.exports = {
  exportSageWorkbook,
  mapProductToSage
};
