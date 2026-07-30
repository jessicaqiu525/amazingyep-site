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
  return {
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
    const search = String(query.search).trim().toLowerCase();
    const haystack = [
      product.name,
      product.sku,
      product.category,
      product.subcategory,
      product.sageCategory1,
      product.sageCategory2,
      product.description,
      Array.isArray(product.keywords) ? product.keywords.join(' ') : product.keywords
    ].join(' ').toLowerCase();
    if (!haystack.includes(search)) return false;
  }

  return true;
}

function listProducts(query) {
  return readProductsFromJson().filter((product) => productMatches(product, query || {}));
}

async function listProductsAsync(query) {
  const products = await readProductsAsync();
  return products.filter((product) => productMatches(product, query || {}));
}

function findProduct(idOrSku) {
  const target = String(idOrSku || '').trim().toUpperCase();
  return readProductsFromJson().find((product) => {
    return [product.id, product.sku, product.itemNumber, product.itemNo]
      .some((value) => String(value || '').trim().toUpperCase() === target);
  }) || null;
}

async function findProductAsync(idOrSku) {
  if (!USE_POSTGRES) return findProduct(idOrSku);
  await ensurePostgresStore();
  const target = String(idOrSku || '').trim();
  const result = await getPool().query(
    'SELECT data FROM products WHERE id = $1 OR UPPER(sku) = UPPER($1) OR UPPER(data->>\'itemNumber\') = UPPER($1) OR UPPER(data->>\'itemNo\') = UPPER($1) LIMIT 1',
    [target]
  );
  return result.rows[0] ? result.rows[0].data : null;
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
  usingPostgres: USE_POSTGRES,
  ensurePostgresStore
};
