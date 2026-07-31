const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = process.env.PRODUCT_DB_PATH || path.join(DATA_DIR, 'products.json');
const SEED_PATH = path.join(DATA_DIR, 'products.seed.json');
const BACKUP_DIR = process.env.PRODUCT_BACKUP_DIR || path.join(DATA_DIR, 'backups');
const MAX_BACKUPS = Number(process.env.PRODUCT_MAX_BACKUPS || 60);
const DATABASE_URL = process.env.DATABASE_URL || '';
const USE_POSTGRES = Boolean(DATABASE_URL);
let pool = null;
let postgresReady = false;

const WEBSITE_CATEGORY_GROUPS = [
  {
    name: 'Bags',
    terms: ['bag', 'tote', 'backpack', 'briefcase', 'luggage', 'cooler']
  },
  {
    name: 'Drinkware',
    terms: ['drinkware', 'tumbler', 'mug', 'cup', 'bottle', 'glassware', 'hydration']
  },
  {
    name: 'Plush & Mascots',
    terms: ['plush', 'mascot', 'stuffed animal', 'pillow', 'doll']
  },
  {
    name: 'Keychains & Accessories',
    terms: ['keychain', 'key chain', 'key ring', 'lanyard']
  },
  {
    name: 'Office & Stationery',
    terms: ['office', 'stationery', 'writing', 'pen', 'pencil', 'notebook', 'journal', 'calendar', 'desk']
  },
  {
    name: 'Outdoor & Leisure',
    terms: ['outdoor', 'leisure', 'blanket', 'umbrella', 'sport', 'towel', 'picnic']
  },
  {
    name: 'Technology',
    terms: ['technology', 'electronics', 'power bank', 'charger', 'speaker', 'headphone', 'earbud', 'usb', 'computer accessor']
  },
  {
    name: 'Trade Show',
    terms: ['trade show', 'tradeshow', 'display', 'banner', 'signage', 'tent']
  },
  {
    name: 'Wearables',
    terms: ['wearable', 'apparel', 'sweater', 'shirt', 'jacket', 'hoodie', 'cap', 'hat']
  }
];

function canonicalWebsiteCategory(value) {
  const category = String(value || '').trim();
  const normalized = category.toLowerCase();
  const group = WEBSITE_CATEGORY_GROUPS.find((item) => {
    return item.name.toLowerCase() === normalized
      || item.terms.some((term) => normalized.includes(term));
  });
  return group ? group.name : category;
}

function derivedPriceRange(product) {
  const prices = (product.pricing || [])
    .map((row) => Number(String(row.price || '').replace(/[^0-9.-]/g, '')))
    .filter((price) => Number.isFinite(price) && price > 0);
  if (!prices.length) return product.priceRange || '';
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max
    ? '$' + min.toFixed(2)
    : '$' + min.toFixed(2) + '-$' + max.toFixed(2);
}

const WEBSITE_PRODUCT_TYPE_RULES = {
  'Bags': [
    ['Tote & Shopping Bags', /\b(tote|shopper|shopping bag)\b/i],
    ['Backpacks & Drawstring Bags', /\b(backpack|drawstring|sportpack)\b/i],
    ['Messenger & Briefcase Bags', /\b(messenger|briefcase|laptop bag)\b/i],
    ['Crossbody & Fanny Packs', /\b(crossbody|fanny|waist pack)\b/i],
    ['Duffel & Travel Bags', /\b(duffel|travel bag|luggage)\b/i],
    ['Coolers & Lunch Bags', /\b(cooler|insulated lunch|lunch bag)\b/i],
    ['Clear Stadium Bags', /\b(clear|stadium)\b/i],
    ['Paper, Plastic & Retail Bags', /\b(paper bag|plastic bag|retail bag)\b/i]
  ],
  'Keychains & Accessories': [
    ['Plush Keychains', /\b(plush|stuffed animal).{0,30}\bkeychain\b|\bkeychain.{0,30}\b(plush|stuffed animal)\b/i],
    ['PVC & Rubber Keychains', /\b(pvc|rubber|silicone)\b/i],
    ['Metal & Enamel Keychains', /\b(metal|enamel|zinc alloy)\b/i],
    ['Acrylic Keychains', /\bacrylic\b/i],
    ['Bottle Opener Keychains', /\bbottle opener\b/i],
    ['Leather & Fabric Keychains', /\b(leather|fabric|woven|embroidered)\b/i],
    ['Light-Up & Functional Keychains', /\b(led|light-up|flashlight|tool|functional)\b/i],
    ['Pins & Patches', /\b(pin|pins|patch|patches)\b/i]
  ],
  'Drinkware': [
    ['Tumblers & Travel Mugs', /\b(tumbler|travel mug|vacuum mug|insulated mug)\b/i],
    ['Water Bottles', /\b(water bottle|sports bottle)\b/i],
    ['Mugs & Cups', /\b(mug|cup)\b/i],
    ['Can Coolers & Beverage Holders', /\b(can cooler|koozie|beverage holder|bottle holder)\b/i],
    ['Barware', /\b(barware|wine|cocktail|beer|shot glass)\b/i],
    ['Coasters & Drinkware Accessories', /\b(coaster|straw|lid|drinkware accessory)\b/i]
  ],
  'Plush & Mascots': [
    ['Plush Keychains', /\b(plush|stuffed animal).{0,30}\bkeychain\b|\bkeychain.{0,30}\b(plush|stuffed animal)\b/i],
    ['Plush Pillows', /\b(pillow|cushion)\b/i],
    ['Holiday & Seasonal Plush', /\b(holiday|christmas|seasonal).{0,30}\b(plush|mascot|character)\b/i],
    ['Brand & Team Mascots', /\b(mascot|team character)\b/i],
    ['Custom Plush Toys', /\b(plush|stuffed animal|character|doll)\b/i]
  ],
  'Wearables': [
    ['T-Shirts', /\bt[ -]?shirt\b/i],
    ['Polo Shirts', /\bpolo\b/i],
    ['Hoodies & Sweatshirts', /\b(hoodie|sweatshirt)\b/i],
    ['Sweaters & Knitwear', /\b(sweater|knitwear|cardigan)\b/i],
    ['Jackets & Outerwear', /\b(jacket|outerwear|coat|vest)\b/i],
    ['Hats & Caps', /\b(hat|cap|beanie)\b/i],
    ['Aprons & Uniforms', /\b(apron|uniform)\b/i],
    ['Activewear', /\b(activewear|athletic|sportswear|shorts|leggings)\b/i]
  ],
  'Office & Stationery': [
    ['Notebooks & Journals', /\b(notebook|journal)\b/i],
    ['Pens & Writing', /\b(pen|pencil|writing)\b/i],
    ['Desk Accessories & Organizers', /\b(desk|organizer|holder)\b/i],
    ['Sticky Notes', /\bsticky note\b/i],
    ['Calendars & Planners', /\b(calendar|planner)\b/i],
    ['Mouse Pads', /\bmouse pad\b/i]
  ],
  'Outdoor & Leisure': [
    ['Camping & Hiking Gear', /\b(camping|hiking|camp)\b/i],
    ['Picnic & BBQ', /\b(picnic|bbq|barbecue|grill)\b/i],
    ['Beach Accessories', /\b(beach|sunshade)\b/i],
    ['Fishing Gear', /\bfishing\b/i],
    ['Outdoor Games', /\b(outdoor game|cornhole|frisbee|flying disc)\b/i],
    ['Blankets & Towels', /\b(blanket|towel)\b/i],
    ['Travel & Leisure Kits', /\b(travel kit|leisure kit|amenity kit)\b/i]
  ],
  'Technology': [
    ['Power Banks', /\bpower bank\b/i],
    ['USB Drives', /\b(usb drive|flash drive)\b/i],
    ['Phone Accessories', /\b(phone|webcam cover|phone case)\b/i],
    ['Wireless Chargers', /\bwireless charger\b/i],
    ['Speakers & Audio', /\b(speaker|audio)\b/i],
    ['Headphones & Earbuds', /\b(headphone|earbud|headset)\b/i],
    ['Cables & Adapters', /\b(cable|adapter|connector)\b/i]
  ],
  'Trade Show': [
    ['Banners & Signs', /\b(banner|sign|signage)\b/i],
    ['Table Covers', /\btable cover\b/i],
    ['Pop-Up Displays', /\b(pop-up|popup|display)\b/i],
    ['Lanyards & Badges', /\b(lanyard|badge)\b/i],
    ['Brochure & Literature Holders', /\b(brochure|literature holder)\b/i],
    ['Flags', /\bflag\b/i],
    ['Booth Accessories', /\b(booth|tent|trade show accessory)\b/i]
  ]
};

function derivedWebsiteProductType(product) {
  if (String(product.websiteProductType || '').trim()) {
    const explicitType = String(product.websiteProductType).trim();
    const productTypeAliases = {
      'Tote Bags': 'Tote & Shopping Bags',
      'Backpacks': 'Backpacks & Drawstring Bags',
      'Drawstring Sportpacks': 'Backpacks & Drawstring Bags',
      'Messenger and Briefcase Bags': 'Messenger & Briefcase Bags',
      'Crossbody Bags and Fanny Packs': 'Crossbody & Fanny Packs',
      'Duffels': 'Duffel & Travel Bags',
      'Travel and Travel Accessories': 'Duffel & Travel Bags',
      'Coolers': 'Coolers & Lunch Bags',
      'Paper Bags': 'Paper, Plastic & Retail Bags',
      'Plastic Bags': 'Paper, Plastic & Retail Bags',
      'PVC Keychains': 'PVC & Rubber Keychains',
      'Metal Keychains': 'Metal & Enamel Keychains',
      'Enamel Keychains': 'Metal & Enamel Keychains',
      'LED Keychains': 'Light-Up & Functional Keychains',
      'Leather Keychains': 'Leather & Fabric Keychains',
      'Pins': 'Pins & Patches',
      'Patches': 'Pins & Patches',
      'Mugs and Tumblers': 'Tumblers & Travel Mugs',
      'Cups': 'Mugs & Cups',
      'Beverage Holders': 'Can Coolers & Beverage Holders',
      'Coasters': 'Coasters & Drinkware Accessories',
      'Reusable Straws': 'Coasters & Drinkware Accessories',
      'Desk Accessories': 'Desk Accessories & Organizers',
      'Desk Organizers': 'Desk Accessories & Organizers',
      'Camping Gear': 'Camping & Hiking Gear',
      'Hiking Equipment': 'Camping & Hiking Gear',
      'Picnic Sets': 'Picnic & BBQ',
      'BBQ Tools': 'Picnic & BBQ',
      'Blankets': 'Blankets & Towels',
      'Travel Kits': 'Travel & Leisure Kits',
      'Phone Cases': 'Phone Accessories',
      'Webcam Covers': 'Phone Accessories',
      'Bluetooth Speakers': 'Speakers & Audio',
      'Earbuds': 'Headphones & Earbuds',
      'Cable Sets': 'Cables & Adapters',
      'Brochure Holders': 'Brochure & Literature Holders',
      'Sweaters': 'Sweaters & Knitwear',
      'Aprons': 'Aprons & Uniforms',
      'Uniforms': 'Aprons & Uniforms',
      'Custom Plush Characters': 'Custom Plush Toys',
      'Custom Shape Plush': 'Custom Plush Toys',
      'Stuffed Animals': 'Custom Plush Toys',
      'Brand Mascots': 'Brand & Team Mascots',
      'Mini Plush Keychains': 'Plush Keychains',
      'Holiday Plush': 'Holiday & Seasonal Plush',
      'Seasonal Characters': 'Holiday & Seasonal Plush'
    };
    return productTypeAliases[explicitType] || explicitType;
  }
  const searchable = [
    product.name,
    Array.isArray(product.keywords) ? product.keywords.join(' ') : product.keywords,
    product.subcategory,
    product.sageCategory2,
    product.sageCategory1
  ].filter(Boolean).join(' ');
  const websiteCategory = canonicalWebsiteCategory(product.category || product.sageCategory1);
  const categoryRules = WEBSITE_PRODUCT_TYPE_RULES[websiteCategory]
    || Object.values(WEBSITE_PRODUCT_TYPE_RULES).flat();
  const match = categoryRules.find((rule) => rule[1].test(searchable));
  return match ? match[0] : String(product.subcategory || product.sageCategory2 || product.sageCategory1 || '').trim();
}

function productForDisplay(product) {
  return product ? {
    ...product,
    priceRange: derivedPriceRange(product),
    websiteProductType: derivedWebsiteProductType(product)
  } : product;
}

function ensureStore() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    const seed = fs.existsSync(SEED_PATH) ? fs.readFileSync(SEED_PATH, 'utf8') : '[]';
    fs.writeFileSync(DB_PATH, seed);
  }
}

function getPool() {
  if (!USE_POSTGRES) return null;
  if (!pool) {
    const { Pool } = require('pg');
    pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
  }
  return pool;
}

async function ensurePostgresStore() {
  if (!USE_POSTGRES || postgresReady) return;
  const db = getPool();
  await db.query(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      sku TEXT,
      published BOOLEAN NOT NULL DEFAULT FALSE,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await db.query('CREATE INDEX IF NOT EXISTS products_sku_idx ON products (UPPER(sku))');
  await db.query('CREATE INDEX IF NOT EXISTS products_published_idx ON products (published)');

  const count = await db.query('SELECT COUNT(*)::int AS count FROM products');
  if ((count.rows[0] && count.rows[0].count) === 0 && fs.existsSync(DB_PATH)) {
    const products = readProductsFromFile();
    for (const product of products) {
      const normalized = normalizeProduct(product, null);
      await writeProductToPostgres(normalized);
    }
  }
  postgresReady = true;
}

function readProductsFromFile() {
  ensureStore();
  const raw = fs.readFileSync(DB_PATH, 'utf8');
  const products = JSON.parse(raw || '[]');
  return Array.isArray(products) ? products : [];
}

function readProducts() {
  if (USE_POSTGRES) {
    throw new Error('Use readProductsAsync when DATABASE_URL is configured.');
  }
  return readProductsFromFile();
}

async function readProductsAsync() {
  if (!USE_POSTGRES) return readProductsFromFile();
  await ensurePostgresStore();
  const result = await getPool().query('SELECT data FROM products ORDER BY created_at ASC');
  return result.rows.map((row) => row.data);
}

function readProductsFromJson() {
  ensureStore();
  const raw = fs.readFileSync(DB_PATH, 'utf8');
  const products = JSON.parse(raw || '[]');
  return Array.isArray(products) ? products : [];
}

function writeProducts(products) {
  if (USE_POSTGRES) {
    throw new Error('Use async product writes when DATABASE_URL is configured.');
  }
  ensureStore();
  createBackup();
  const tempPath = DB_PATH + '.tmp';
  fs.writeFileSync(tempPath, JSON.stringify(products, null, 2));
  fs.renameSync(tempPath, DB_PATH);
}

function backupName(date) {
  return 'products-' + date.toISOString().replace(/[:.]/g, '-').replace('T', '-').replace('Z', '') + '.json';
}

function createBackup() {
  ensureStore();
  if (!fs.existsSync(DB_PATH)) return null;

  const backupPath = path.join(BACKUP_DIR, backupName(new Date()));
  fs.copyFileSync(DB_PATH, backupPath);
  pruneBackups();
  return backupPath;
}

function listBackups() {
  ensureStore();
  return fs.readdirSync(BACKUP_DIR)
    .filter((name) => /^products-.*\.json$/.test(name))
    .map((name) => {
      const fullPath = path.join(BACKUP_DIR, name);
      const stat = fs.statSync(fullPath);
      return {
        name,
        path: fullPath,
        size: stat.size,
        createdAt: stat.mtime.toISOString()
      };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function pruneBackups() {
  const backups = listBackups();
  backups.slice(MAX_BACKUPS).forEach((backup) => {
    fs.unlinkSync(backup.path);
  });
}

function latestBackup() {
  const backups = listBackups();
  return backups[0] || null;
}

function findBackup(name) {
  const safeName = path.basename(String(name || ''));
  return listBackups().find((backup) => backup.name === safeName) || null;
}

function restoreBackup(name) {
  ensureStore();
  const backup = name ? findBackup(name) : latestBackup();
  if (!backup || !backup.path || !fs.existsSync(backup.path)) return null;

  const raw = fs.readFileSync(backup.path, 'utf8');
  const products = JSON.parse(raw || '[]');
  if (!Array.isArray(products)) {
    throw new Error('Selected backup is not a valid product database.');
  }

  createBackup();
  fs.writeFileSync(DB_PATH, JSON.stringify(products, null, 2));
  return {
    name: backup.name,
    size: backup.size,
    createdAt: backup.createdAt,
    productCount: products.length
  };
}

function normalizeProduct(product, existing) {
  const now = new Date().toISOString();
  const normalized = {
    ...(existing || {}),
    ...product,
    id: product.id !== undefined && product.id !== null && product.id !== ''
      ? product.id
      : ((existing && existing.id) || nextId()),
    category: canonicalWebsiteCategory(product.category),
    published: product.published === true,
    updatedAt: now,
    createdAt: (existing && existing.createdAt) || product.createdAt || now
  };
  normalized.priceRange = derivedPriceRange(normalized);
  normalized.websiteProductType = derivedWebsiteProductType(normalized);
  return normalized;
}

function nextId() {
  const products = readProductsFromJson();
  const numericIds = products
    .map((product) => Number(product.id))
    .filter((id) => Number.isFinite(id));
  return numericIds.length ? Math.max.apply(null, numericIds) + 1 : 1;
}

async function nextIdAsync() {
  if (!USE_POSTGRES) return nextId();
  await ensurePostgresStore();
  const result = await getPool().query("SELECT MAX(id::int) AS max_id FROM products WHERE id ~ '^[0-9]+$'");
  const max = Number(result.rows[0] && result.rows[0].max_id);
  return Number.isFinite(max) ? max + 1 : 1;
}

function productMatches(product, query) {
  if (query.category && canonicalWebsiteCategory(product.category) !== canonicalWebsiteCategory(query.category)) {
    return false;
  }

  if (query.sageCategory && ![product.sageCategory1, product.sageCategory2]
    .some((value) => String(value || '') === String(query.sageCategory))) {
    return false;
  }

  if (query.publishedOnly && product.published === false) {
    return false;
  }

  if (query.search) {
    const rawSearch = String(query.search).trim().toLowerCase();
    const compactSearch = rawSearch.replace(/[^a-z0-9]+/g, '');
    const sku = String(product.sku || product.itemNumber || product.itemNo || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '');
    const looksLikeItemCode = /^[a-z]{2}$/.test(compactSearch)
      || (/^[a-z]{2,4}[a-z0-9]*\d[a-z0-9]*$/.test(compactSearch));

    // Two-letter searches such as AK or AW are catalog-code searches. This
    // prevents "AK" from accidentally matching ordinary words such as "leak".
    if (looksLikeItemCode) return sku.startsWith(compactSearch);

    const searchTerms = rawSearch
      .trim()
      .replace(/[^a-z0-9]+/g, ' ')
      .split(/\s+/)
      .filter(Boolean);
    const haystack = [
      product.name,
      product.sku,
      product.itemNumber,
      product.itemNo,
      product.category,
      product.subcategory,
      product.sageCategory1,
      product.sageCategory2,
      product.description,
      Array.isArray(product.keywords) ? product.keywords.join(' ') : product.keywords
    ].join(' ').toLowerCase().replace(/[^a-z0-9]+/g, ' ');
    if (!searchTerms.every((term) => {
      const singular = term.endsWith('s') && term.length > 3 ? term.slice(0, -1) : term;
      return haystack.includes(term) || haystack.includes(singular);
    })) return false;
  }

  return true;
}

function productSearchScore(product, search) {
  const query = String(search || '').trim().toLowerCase();
  const sku = String(product.sku || product.itemNumber || product.itemNo || '').trim().toLowerCase();
  const name = String(product.name || '').trim().toLowerCase();
  const keywords = Array.isArray(product.keywords)
    ? product.keywords.join(' ').toLowerCase()
    : String(product.keywords || '').toLowerCase();

  if (sku === query) return 1000;
  if (sku.startsWith(query)) return 900;
  if (name === query) return 800;
  if (name.startsWith(query)) return 700;
  if (name.includes(query)) return 600;
  if (keywords.includes(query)) return 500;
  return 100;
}

function sortSearchResults(products, search) {
  if (!search) return products;
  return products.slice().sort((a, b) => {
    return productSearchScore(b, search) - productSearchScore(a, search)
      || String(a.name || '').localeCompare(String(b.name || ''));
  });
}

function listProducts(query) {
  const filters = query || {};
  const products = readProductsFromJson().filter((product) => productMatches(product, filters));
  return sortSearchResults(products, filters.search).map(productForDisplay);
}

async function listProductsAsync(query) {
  const filters = query || {};
  const products = await readProductsAsync();
  return sortSearchResults(
    products.filter((product) => productMatches(product, filters)),
    filters.search
  ).map(productForDisplay);
}

function findProduct(idOrSku) {
  const target = String(idOrSku || '').trim().toUpperCase();
  const product = readProductsFromJson().find((product) => {
    return [product.id, product.sku, product.itemNumber, product.itemNo]
      .some((value) => String(value || '').trim().toUpperCase() === target);
  }) || null;
  return productForDisplay(product);
}

async function findProductAsync(idOrSku) {
  if (!USE_POSTGRES) return findProduct(idOrSku);
  await ensurePostgresStore();
  const target = String(idOrSku || '').trim();
  const result = await getPool().query(
    'SELECT data FROM products WHERE id = $1 OR UPPER(sku) = UPPER($1) OR UPPER(data->>\'itemNumber\') = UPPER($1) OR UPPER(data->>\'itemNo\') = UPPER($1) LIMIT 1',
    [target]
  );
  return result.rows[0] ? productForDisplay(result.rows[0].data) : null;
}

async function writeProductToPostgres(product) {
  const id = String(product.id);
  const sku = product.sku ? String(product.sku) : '';
  await getPool().query(`
    INSERT INTO products (id, sku, published, data, created_at, updated_at)
    VALUES ($1, $2, $3, $4::jsonb, COALESCE(($4::jsonb->>'createdAt')::timestamptz, NOW()), COALESCE(($4::jsonb->>'updatedAt')::timestamptz, NOW()))
    ON CONFLICT (id) DO UPDATE SET
      sku = EXCLUDED.sku,
      published = EXCLUDED.published,
      data = EXCLUDED.data,
      updated_at = NOW()
  `, [id, sku, product.published === true, JSON.stringify(product)]);
}

function saveProduct(product) {
  const products = readProductsFromJson();
  const target = String(product.id || product.sku || '').trim().toUpperCase();
  const index = products.findIndex((item) => {
    return [item.id, item.sku].some((value) => String(value || '').trim().toUpperCase() === target);
  });

  const normalized = normalizeProduct(product, index >= 0 ? products[index] : null);

  if (index >= 0) {
    products[index] = normalized;
  } else {
    products.push(normalized);
  }

  writeProducts(products);
  return normalized;
}

async function saveProductAsync(product) {
  if (!USE_POSTGRES) return saveProduct(product);
  await ensurePostgresStore();
  const target = String(product.id || product.sku || '').trim();
  let existing = null;
  if (target) {
    existing = await findProductAsync(target);
  }
  const nextProduct = { ...product };
  if (nextProduct.id === undefined || nextProduct.id === null || nextProduct.id === '') {
    nextProduct.id = existing && existing.id ? existing.id : await nextIdAsync();
  }
  const normalized = normalizeProduct(nextProduct, existing);
  await writeProductToPostgres(normalized);
  return normalized;
}

function deleteProduct(idOrSku) {
  const products = readProductsFromJson();
  const target = String(idOrSku || '').trim().toUpperCase();
  const next = products.filter((product) => {
    return ![product.id, product.sku].some((value) => String(value || '').trim().toUpperCase() === target);
  });

  if (next.length === products.length) return false;
  writeProducts(next);
  return true;
}

async function deleteProductAsync(idOrSku) {
  if (!USE_POSTGRES) return deleteProduct(idOrSku);
  await ensurePostgresStore();
  const existing = await findProductAsync(idOrSku);
  if (!existing) return false;
  await getPool().query('DELETE FROM products WHERE id = $1', [String(existing.id)]);
  return true;
}

module.exports = {
  listProducts,
  listProductsAsync,
  findProduct,
  findProductAsync,
  saveProduct,
  saveProductAsync,
  deleteProduct,
  deleteProductAsync,
  readProducts,
  readProductsAsync,
  createBackup,
  latestBackup,
  listBackups,
  restoreBackup,
  derivedWebsiteProductType,
  usingPostgres: USE_POSTGRES,
  ensurePostgresStore
};
