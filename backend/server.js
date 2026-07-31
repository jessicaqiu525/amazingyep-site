const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { exportSageWorkbook } = require('./exporters/sageExport');
const { parseSageWorkbook } = require('./importers/sageImport');
const { importImageZip, normalizeSku, readImageZipManifest } = require('./importers/imageZip');
const auditStore = require('./lib/auditStore');
const productStore = require('./lib/productStore');
const userStore = require('./lib/userStore');
const { optionalAuth, requireAdmin, requireAuth, signToken, verifyCredentials } = require('./lib/auth');

const app = express();
const PORT = process.env.PORT || 4000;
const DEFAULT_SAGE_TEMPLATE_PATH = path.join(__dirname, 'data', 'SAGE_BPU_ProductList_AmazingYep.xls');
const SAGE_TEMPLATE_PATH = process.env.SAGE_TEMPLATE_PATH || (fs.existsSync(DEFAULT_SAGE_TEMPLATE_PATH) ? DEFAULT_SAGE_TEMPLATE_PATH : '');
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
const EXPORT_DIR = process.env.EXPORT_DIR || path.join(__dirname, 'exports');
const ADMIN_DIR = path.join(__dirname, 'public');
const SITE_ASSETS_DIR = path.join(__dirname, '..', 'assets');
const SITE_ROOT_DIR = path.join(__dirname, '..');
const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || 'amazingyep/products';
const CLOUDINARY_ENABLED = Boolean(
  process.env.CLOUDINARY_URL ||
  (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
);

fs.mkdirSync(UPLOAD_DIR, { recursive: true });
fs.mkdirSync(EXPORT_DIR, { recursive: true });

if (CLOUDINARY_ENABLED && !process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase();
      const base = path.basename(file.originalname || 'image', ext).replace(/[^a-z0-9_-]+/gi, '-').replace(/^-|-$/g, '');
      cb(null, Date.now() + '-' + (base || 'image') + ext);
    }
  }),
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!/^image\//.test(file.mimetype || '')) {
      cb(new Error('Only image uploads are allowed.'));
      return;
    }
    cb(null, true);
  }
});

function removeTempUpload(filePath) {
  if (!filePath) return;
  fs.unlink(filePath, () => {});
}

const importUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase();
      const base = path.basename(file.originalname || 'import', ext).replace(/[^a-z0-9_-]+/gi, '-').replace(/^-|-$/g, '');
      cb(null, Date.now() + '-' + (base || 'import') + ext);
    }
  }),
  limits: { fileSize: 180 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (!['.xls', '.xlsx', '.zip'].includes(ext)) {
      cb(new Error('Only SAGE Excel files and image ZIP files are allowed.'));
      return;
    }
    cb(null, true);
  }
});

async function uploadImportedImage(file) {
  if (CLOUDINARY_ENABLED) {
    return uploadToCloudinary(file);
  }
  const ext = path.extname(file.originalname || file.path || '').toLowerCase() || '.jpg';
  const base = path.basename(file.originalname || 'image', ext).replace(/[^a-z0-9_-]+/gi, '-').replace(/^-|-$/g, '');
  const filename = Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '-' + (base || 'image') + ext;
  const target = path.join(UPLOAD_DIR, filename);
  await fs.promises.copyFile(file.path, target);
  return {
    url: '/uploads/' + filename,
    filename,
    originalName: file.originalname,
    provider: 'local'
  };
}

function importFiles(req) {
  const files = req.files || {};
  return {
    excel: files.excel && files.excel[0],
    imagesZip: files.imagesZip && files.imagesZip[0]
  };
}

function cleanupImportFiles(req) {
  Object.values(req.files || {}).flat().forEach((file) => removeTempUpload(file.path));
}

function mergeColorOptions(existingOptions, importedOptions, zipColors) {
  const merged = new Map();
  [...(existingOptions || []), ...(importedOptions || [])].forEach((option) => {
    if (!option || !option.name) return;
    merged.set(option.name.toLowerCase(), { name: option.name, image: option.image || '' });
  });
  (zipColors || []).forEach((option) => {
    if (!option || !option.name) return;
    merged.set(option.name.toLowerCase(), { name: option.name, image: option.image || '' });
  });
  return Array.from(merged.values());
}

function mergeImportedProduct(existing, imported, imagesForSku) {
  const product = { ...(existing || {}), ...imported };
  const uploadedMain = (imagesForSku && imagesForSku.main ? imagesForSku.main : []).map((item) => item.url).filter(Boolean);
  if (uploadedMain.length) {
    product.images = [uploadedMain[0]];
    product.gallery = uploadedMain.slice(1);
  } else if (existing && existing.images && existing.images.length && !imported.images.length) {
    product.images = existing.images;
    product.gallery = existing.gallery || [];
  }
  product.colorOptions = mergeColorOptions(existing && existing.colorOptions, imported.colorOptions, imagesForSku && imagesForSku.colors);
  product.colors = Array.from(new Set([
    ...(product.colors || []),
    ...product.colorOptions.map((option) => option.name).filter(Boolean)
  ]));
  return product;
}

function importSummary(product, imagesForSku) {
  return {
    id: product.id,
    sku: product.sku || product.itemNumber,
    name: product.name,
    mainImages: imagesForSku && imagesForSku.main ? imagesForSku.main.length : 0,
    colorImages: imagesForSku && imagesForSku.colors ? imagesForSku.colors.length : 0
  };
}

async function uploadToCloudinary(file) {
  const result = await cloudinary.uploader.upload(file.path, {
    folder: CLOUDINARY_FOLDER,
    resource_type: 'image',
    use_filename: true,
    unique_filename: true,
    overwrite: false
  });
  return {
    url: result.secure_url,
    filename: result.public_id,
    originalName: file.originalname,
    provider: 'cloudinary',
    width: result.width,
    height: result.height
  };
}

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use((req, res, next) => {
  if (req.path.endsWith('.html') || req.path === '/') {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  next();
});
app.get('/solutions/brand-program.html', (req, res) => {
  const queryIndex = req.originalUrl.indexOf('?');
  const queryString = queryIndex >= 0 ? req.originalUrl.slice(queryIndex) : '';
  res.redirect(302, '/solutions/brand-program-v2.html' + queryString);
});
app.get('/solutions/brand-program-v2.html', (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const detailPath = path.join(SITE_ROOT_DIR, 'solutions', 'brand-program.html');
  fs.readFile(detailPath, 'utf8', (error, html) => {
    if (error) {
      res.status(500).send('Unable to load the brand program page.');
      return;
    }
    const breadcrumbBootstrap = `<script>
      document.addEventListener('DOMContentLoaded', function () {
        if (document.querySelector('.brand-back-bar')) return;
        var categories = {
          "tropicana":"Food & Beverage","king's hawaiian":"Food & Beverage","olipop":"Food & Beverage","pabst":"Food & Beverage","aperol":"Food & Beverage","deer park":"Food & Beverage","naked":"Food & Beverage","mauna loa":"Food & Beverage","espolòn":"Food & Beverage","rainier":"Food & Beverage","lone star":"Food & Beverage","long drink":"Food & Beverage","grillo's":"Food & Beverage","splash refresher":"Food & Beverage",
          "playboy":"Lifestyle & Entertainment","john wayne":"Lifestyle & Entertainment","mythical":"Lifestyle & Entertainment","steve-o":"Lifestyle & Entertainment","world's strongest man":"Sports","bmw":"Retail & Automotive","7-eleven":"Retail & Automotive","librela":"Health, Wellness & Pet","intelliskin":"Health, Wellness & Pet"
        };
        var brand = new URLSearchParams(window.location.search).get('brand') || 'Brand Program';
        var bar = document.createElement('div');
        bar.className = 'brand-back-bar';
        bar.setAttribute('aria-label', 'Breadcrumb');
        bar.style.cssText = 'margin-top:72px;background:#fff;border-bottom:1px solid #e5e7eb;';
        var inner = document.createElement('div');
        inner.className = 'container';
        inner.style.cssText = 'min-height:54px;display:flex;align-items:center;gap:9px;color:#667085;font-size:14px;';
        var link = document.createElement('a');
        link.href = 'index.html';
        link.textContent = '← Brand Programs';
        link.style.cssText = 'color:#082746;font-weight:700;text-decoration:none;';
        var category = document.createElement('span');
        category.textContent = categories[brand.toLowerCase()] || 'Brand Program';
        var categorySlugs = {'Food & Beverage':'food-beverage','Lifestyle & Entertainment':'lifestyle-entertainment','Sports':'sports','Retail & Automotive':'retail-automotive','Health, Wellness & Pet':'health-wellness'};
        var categoryLink = document.createElement('a');
        categoryLink.className = 'brand-back-category';
        categoryLink.href = 'index.html?category=' + (categorySlugs[category.textContent] || 'all');
        categoryLink.textContent = category.textContent;
        categoryLink.style.cssText = 'color:#082746;font-weight:600;text-decoration:none;';
        var current = document.createElement('span');
        current.textContent = brand;
        inner.append(link, document.createTextNode('/'), categoryLink, document.createTextNode('/'), current);
        bar.appendChild(inner);
        var nav = document.querySelector('nav.nav');
        if (nav) nav.insertAdjacentElement('afterend', bar);
      });
    <\/script>`;
    res.type('html').send(html.replace('</body>', breadcrumbBootstrap + '</body>'));
  });
});
app.use('/uploads', express.static(UPLOAD_DIR));
app.use('/assets', express.static(SITE_ASSETS_DIR));
app.use('/admin', express.static(ADMIN_DIR));
app.use(express.static(SITE_ROOT_DIR));

app.get('/', (req, res) => {
  res.redirect('/admin/');
});

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'amazingyep-backend' });
});

app.post('/api/auth/login', (req, res) => {
  const username = req.body && req.body.username;
  const password = req.body && req.body.password;

  const user = verifyCredentials(username, password);
  if (!user) {
    res.status(401).json({ error: 'Incorrect username or password.' });
    return;
  }

  res.json({
    token: signToken(user),
    user
  });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      username: req.user.sub,
      displayName: req.user.displayName || req.user.sub,
      role: req.user.role || 'staff'
    }
  });
});

app.get('/api/products', optionalAuth, async (req, res, next) => {
  try {
    const products = await productStore.listProductsAsync({
    category: req.query.category,
    sageCategory: req.query.sageCategory,
    search: req.query.search,
    publishedOnly: !req.user
  });
    res.json({ products });
  } catch (error) {
    next(error);
  }
});

app.get('/api/products/:id', optionalAuth, async (req, res, next) => {
  try {
    const product = await productStore.findProductAsync(req.params.id);
    if (!product || (!req.user && product.published === false)) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
});

app.use('/api', requireAuth);

app.post('/api/imports/sage/preview', importUpload.fields([
  { name: 'excel', maxCount: 1 },
  { name: 'imagesZip', maxCount: 1 }
]), async (req, res, next) => {
  try {
    const { excel, imagesZip } = importFiles(req);
    if (!excel) {
      res.status(400).json({ error: 'Upload a SAGE Excel file first.' });
      return;
    }
    const parsed = parseSageWorkbook(excel.path);
    const manifest = imagesZip ? readImageZipManifest(imagesZip.path) : { items: {}, warnings: [] };
    res.json({
      products: parsed.products.slice(0, 25).map((product) => ({
        sku: product.sku || product.itemNumber,
        name: product.name,
        category: product.category,
        mainImages: manifest.items[normalizeSku(product.sku || product.itemNumber)]?.mainCount || 0,
        colorImages: manifest.items[normalizeSku(product.sku || product.itemNumber)]?.colorCount || 0
      })),
      totalProducts: parsed.products.length,
      totalImageSkus: Object.keys(manifest.items).length,
      warnings: [...(parsed.warnings || []), ...(manifest.warnings || [])]
    });
  } catch (error) {
    next(error);
  } finally {
    cleanupImportFiles(req);
  }
});

app.post('/api/imports/sage/products', importUpload.fields([
  { name: 'excel', maxCount: 1 },
  { name: 'imagesZip', maxCount: 1 }
]), async (req, res, next) => {
  try {
    const { excel, imagesZip } = importFiles(req);
    if (!excel) {
      res.status(400).json({ error: 'Upload a SAGE Excel file first.' });
      return;
    }
    const parsed = parseSageWorkbook(excel.path);
    const imageMap = imagesZip ? await importImageZip(imagesZip.path, { uploadImage: uploadImportedImage }) : {};
    const saved = [];
    for (const imported of parsed.products) {
      const sku = normalizeSku(imported.sku || imported.itemNumber || imported.id);
      const existing = await productStore.findProductAsync(sku);
      const merged = mergeImportedProduct(existing, imported, imageMap[sku]);
      const product = await productStore.saveProductAsync(merged);
      saved.push(importSummary(product, imageMap[sku]));
    }
    auditStore.record(req, 'sage.imported', { productCount: saved.length, imageSkuCount: Object.keys(imageMap).length });
    res.status(201).json({
      imported: saved,
      totalProducts: saved.length,
      totalImageSkus: Object.keys(imageMap).length,
      warnings: parsed.warnings || []
    });
  } catch (error) {
    next(error);
  } finally {
    cleanupImportFiles(req);
  }
});

app.get('/api/activity', requireAdmin, (req, res) => {
  res.json({ events: auditStore.listEvents(req.query.limit) });
});

app.get('/api/users', requireAdmin, (req, res) => {
  res.json({ users: userStore.listUsers() });
});

app.post('/api/users', requireAdmin, (req, res) => {
  const user = userStore.saveUser(req.body || {});
  auditStore.record(req, 'user.created', { username: user.username, role: user.role });
  res.status(201).json({ user });
});

app.put('/api/users/:id', requireAdmin, (req, res) => {
  const existing = userStore.findUser(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }
  const user = userStore.saveUser({ ...existing, ...(req.body || {}), id: existing.id });
  auditStore.record(req, 'user.updated', { username: user.username, role: user.role, active: user.active });
  res.json({ user });
});

app.patch('/api/users/:id/status', requireAdmin, (req, res) => {
  const user = userStore.setUserActive(req.params.id, req.body && req.body.active);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }
  auditStore.record(req, user.active ? 'user.enabled' : 'user.disabled', { username: user.username, role: user.role });
  res.json({ user });
});

app.get('/api/reference/sage', (req, res) => {
  const categories = require('./data/sageCategories.json');
  const themes = require('./data/sageThemes.json');
  res.json({ categories, themes });
});

app.get('/api/backups', requireAdmin, (req, res) => {
  res.json({ backups: productStore.listBackups().map(({ path: backupPath, ...backup }) => backup) });
});

app.post('/api/backups', requireAdmin, (req, res) => {
  productStore.createBackup();
  const backup = productStore.latestBackup();
  auditStore.record(req, 'backup.created', backup ? { name: backup.name } : {});
  res.status(201).json({
    backup: backup ? { name: backup.name, size: backup.size, createdAt: backup.createdAt } : null
  });
});

app.get('/api/backups/latest/download', requireAdmin, (req, res) => {
  const backup = productStore.latestBackup() || { path: productStore.createBackup() };
  if (!backup || !backup.path || !fs.existsSync(backup.path)) {
    res.status(404).json({ error: 'No backup is available.' });
    return;
  }
  res.download(backup.path, path.basename(backup.path));
});

app.post('/api/backups/latest/restore', requireAdmin, (req, res) => {
  const restored = productStore.restoreBackup();
  if (!restored) {
    res.status(404).json({ error: 'No backup is available.' });
    return;
  }
  auditStore.record(req, 'backup.restored', { name: restored.name, productCount: restored.productCount });
  res.json({ restored });
});

app.post('/api/backups/:name/restore', requireAdmin, (req, res) => {
  const restored = productStore.restoreBackup(req.params.name);
  if (!restored) {
    res.status(404).json({ error: 'Backup not found.' });
    return;
  }
  auditStore.record(req, 'backup.restored', { name: restored.name, productCount: restored.productCount });
  res.json({ restored });
});

app.post('/api/products', async (req, res, next) => {
  try {
    const product = await productStore.saveProductAsync(req.body || {});
    auditStore.record(req, 'product.created', { id: product.id, sku: product.sku, name: product.name });
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

app.put('/api/products/:id', async (req, res, next) => {
  try {
    const existing = await productStore.findProductAsync(req.params.id);
    if (!existing) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    const product = await productStore.saveProductAsync({ ...existing, ...(req.body || {}), id: existing.id });
    auditStore.record(req, 'product.updated', { id: product.id, sku: product.sku, name: product.name });
    res.json(product);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/products/:id', requireAdmin, async (req, res, next) => {
  try {
    const deleted = await productStore.deleteProductAsync(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    auditStore.record(req, 'product.deleted', { id: req.params.id });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.post('/api/uploads/images', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image was uploaded.' });
      return;
    }

    if (CLOUDINARY_ENABLED) {
      const cloudinaryUpload = await uploadToCloudinary(req.file);
      removeTempUpload(req.file.path);
      res.status(201).json(cloudinaryUpload);
      auditStore.record(req, 'image.uploaded', {
        filename: cloudinaryUpload.filename,
        originalName: cloudinaryUpload.originalName,
        provider: 'cloudinary'
      });
      return;
    }

    res.status(201).json({
      url: '/uploads/' + req.file.filename,
      filename: req.file.filename,
      originalName: req.file.originalname,
      provider: 'local'
    });
    auditStore.record(req, 'image.uploaded', {
      filename: req.file.filename,
      originalName: req.file.originalname,
      provider: 'local'
    });
  } catch (error) {
    if (req.file) removeTempUpload(req.file.path);
    next(error);
  }
});

app.post('/api/exports/sage/products', requireAdmin, async (req, res, next) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
    const products = Array.isArray(req.body.products) && req.body.products.length
      ? req.body.products
      : (ids.length
        ? (await Promise.all(ids.map((id) => productStore.findProductAsync(id)))).filter(Boolean)
        : await productStore.readProductsAsync());
    const templatePath = req.body.templatePath || SAGE_TEMPLATE_PATH;
    const outputPath = req.body.outputPath || path.join(EXPORT_DIR, 'sage-products-' + Date.now() + '.xls');
    const result = exportSageWorkbook({ templatePath, outputPath, products });
    auditStore.record(req, 'sage.exported', { productCount: products.length });

    res.download(result.outputPath, 'SAGE_BPU_ProductList_AmazingYep.xls');
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  res.status(400).json({
    error: error.message || 'Export failed'
  });
});

app.listen(PORT, () => {
  console.log('Amazing Yep backend listening on port ' + PORT);
});
