const fs = require('fs');
const path = require('path');
const os = require('os');
const AdmZip = require('adm-zip');

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const MAIN_FOLDERS = new Set(['main', 'gallery', 'galleries', 'detail', 'details', 'scene', 'scenes', 'images', 'photos']);
const COLOR_FOLDERS = new Set(['color', 'colors', 'colour', 'colours']);
const MAIN_WORDS = new Set(['main', 'gallery', 'detail', 'details', 'scene', 'scenes', 'image', 'photo', 'front', 'back', 'side']);

function normalizeSku(value) {
  return String(value || '').trim().toUpperCase();
}

function isIgnored(entryName) {
  const parts = entryName.split('/').filter(Boolean);
  return !parts.length || parts.some((part) => part === '__MACOSX' || part === '.DS_Store' || part.startsWith('._'));
}

function naturalSort(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

function mainSequence(entryName) {
  const base = path.basename(entryName, path.extname(entryName));
  const match = base.match(/^main(?:[ _-]?(\d+))?$/i);
  return match ? Number(match[1] || 0) : Number.MAX_SAFE_INTEGER;
}

function imageRole(base) {
  return /^main(?:[ _-]?\d+)?$/i.test(base) ? { type: 'main', colorName: '' } : { type: 'color', colorName: base };
}

function classifyEntry(entryName, defaultSku = '') {
  if (isIgnored(entryName)) return null;
  const ext = path.extname(entryName).toLowerCase();
  if (!IMAGE_EXTS.has(ext)) return null;
  const parts = entryName.split('/').filter(Boolean);
  const file = parts[parts.length - 1];
  const base = path.basename(file, ext).trim();
  if (parts.length >= 3) {
    const sku = normalizeSku(parts[parts.length - 3]);
    const folder = String(parts[parts.length - 2] || '').toLowerCase();
    if (COLOR_FOLDERS.has(folder)) return { sku, type: 'color', colorName: base };
    if (MAIN_FOLDERS.has(folder)) return { sku, type: 'main', colorName: '' };
  }
  if (parts.length >= 2) {
    const sku = normalizeSku(parts[parts.length - 2]);
    return { sku, ...imageRole(base) };
  }
  if (defaultSku) return { sku: normalizeSku(defaultSku), ...imageRole(base) };
  const match = base.match(/^([A-Za-z0-9-]+)[ _-]+(.+)$/);
  if (!match) return null;
  const suffix = match[2].trim();
  const suffixKey = suffix.toLowerCase();
  return {
    sku: normalizeSku(match[1]),
    type: MAIN_WORDS.has(suffixKey) || /^\d+$/.test(suffixKey) ? 'main' : 'color',
    colorName: MAIN_WORDS.has(suffixKey) || /^\d+$/.test(suffixKey) ? '' : suffix
  };
}

function readImageZipManifest(zipPath, options = {}) {
  const zip = new AdmZip(zipPath);
  const items = {};
  const warnings = [];
  zip.getEntries().forEach((entry) => {
    if (entry.isDirectory) return;
    const info = classifyEntry(entry.entryName, options.defaultSku);
    if (!info || !info.sku) return;
    if (!items[info.sku]) items[info.sku] = { mainCount: 0, colorCount: 0, colors: [] };
    if (info.type === 'color') {
      items[info.sku].colorCount += 1;
      if (info.colorName && !items[info.sku].colors.includes(info.colorName)) items[info.sku].colors.push(info.colorName);
    } else {
      items[info.sku].mainCount += 1;
    }
  });
  if (!Object.keys(items).length) {
    warnings.push('No product images were found in the ZIP. Use folders like AK468/main and AK468/colors.');
  }
  return { items, warnings };
}

async function importImageZip(zipPath, { uploadImage, defaultSku = '' }) {
  const zip = new AdmZip(zipPath);
  const grouped = {};
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'sage-images-'));
  try {
    const entries = zip.getEntries()
      .filter((entry) => !entry.isDirectory)
      .map((entry) => ({ entry, info: classifyEntry(entry.entryName, defaultSku) }))
      .filter((item) => item.info && item.info.sku)
      .sort((a, b) => {
        if (a.info.sku === b.info.sku && a.info.type === 'main' && b.info.type === 'main') {
          return mainSequence(a.entry.entryName) - mainSequence(b.entry.entryName);
        }
        return naturalSort(a.entry.entryName, b.entry.entryName);
      });

    for (const { entry, info } of entries) {
      if (!grouped[info.sku]) grouped[info.sku] = { main: [], colors: [] };
      const ext = path.extname(entry.entryName).toLowerCase() || '.jpg';
      const tempPath = path.join(tempRoot, info.sku + '-' + grouped[info.sku].main.length + '-' + Date.now() + ext);
      fs.writeFileSync(tempPath, entry.getData());
      const uploaded = await uploadImage({
        path: tempPath,
        originalname: path.basename(entry.entryName),
        mimetype: 'image/' + ext.replace('.', '').replace('jpg', 'jpeg')
      });
      if (info.type === 'color') {
        grouped[info.sku].colors.push({ name: info.colorName, image: uploaded.url, upload: uploaded });
      } else {
        grouped[info.sku].main.push(uploaded);
      }
    }
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
  return grouped;
}

module.exports = { normalizeSku, readImageZipManifest, importImageZip };
