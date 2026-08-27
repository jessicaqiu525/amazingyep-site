const API = '';

const state = {
  products: [],
  selected: null,
  reference: { categories: [], themes: [] },
  brandReference: { brands: [], categories: [] },
  user: null,
  users: [],
  view: 'products',
  editorTab: 'website',
  token: window.localStorage.getItem('amazingyepAdminToken') || ''
};

const els = {
  loginScreen: document.getElementById('loginScreen'),
  loginForm: document.getElementById('loginForm'),
  loginUser: document.getElementById('loginUser'),
  loginPassword: document.getElementById('loginPassword'),
  loginStatus: document.getElementById('loginStatus'),
  list: document.getElementById('productList'),
  form: document.getElementById('productForm'),
  status: document.getElementById('statusBar'),
  validationPanel: document.getElementById('validationPanel'),
  productsView: document.getElementById('productsView'),
  editorView: document.getElementById('editorView'),
  adminView: document.getElementById('adminView'),
  productsViewBtn: document.getElementById('productsViewBtn'),
  editorViewBtn: document.getElementById('editorViewBtn'),
  adminViewBtn: document.getElementById('adminViewBtn'),
  title: document.getElementById('pageTitle'),
  search: document.getElementById('searchInput'),
  category: document.getElementById('categoryFilter'),
  sageCategory: document.getElementById('sageCategoryFilter'),
  clearFiltersBtn: document.getElementById('clearFiltersBtn'),
  catalogRows: document.getElementById('catalogRows'),
  catalogSummary: document.getElementById('catalogSummary'),
  imagePreview: document.getElementById('imagePreview'),
  galleryPreview: document.getElementById('galleryPreview'),
  pricingRows: document.getElementById('pricingRows'),
  colorRows: document.getElementById('colorRows'),
  optionRows: document.getElementById('optionRows'),
  themeSearch: document.getElementById('themeSearch'),
  addThemeBtn: document.getElementById('addThemeBtn'),
  selectedThemes: document.getElementById('selectedThemes'),
  themeCount: document.getElementById('themeCount'),
  logoutBtn: document.getElementById('logoutBtn'),
  downloadBackupBtn: document.getElementById('downloadBackupBtn'),
  viewProductBtn: document.getElementById('viewProductBtn'),
  saveBtn: document.getElementById('saveBtn'),
  importSageBtn: document.getElementById('importSageBtn'),
  importPanel: document.getElementById('importPanel'),
  closeImportBtn: document.getElementById('closeImportBtn'),
  sageImportFile: document.getElementById('sageImportFile'),
  sageImageZipFile: document.getElementById('sageImageZipFile'),
  sagePreviewBtn: document.getElementById('sagePreviewBtn'),
  sageImportProductsBtn: document.getElementById('sageImportProductsBtn'),
  sageImportResult: document.getElementById('sageImportResult'),
  deleteProductBtn: document.getElementById('deleteProductBtn'),
  teamPanel: document.getElementById('teamPanel'),
  userList: document.getElementById('userList'),
  reloadUsersBtn: document.getElementById('reloadUsersBtn'),
  addUserBtn: document.getElementById('addUserBtn'),
  newUserName: document.getElementById('newUserName'),
  newUserDisplay: document.getElementById('newUserDisplay'),
  newUserPassword: document.getElementById('newUserPassword'),
  newUserRole: document.getElementById('newUserRole'),
  backupPanel: document.getElementById('backupPanel'),
};

const DEFAULT_OPTION_QTYS = [100, 500, 1000, 5000, 10000, 100000];
const WEBSITE_PRODUCT_TYPES = {
  'Bags': ['Tote & Shopping Bags', 'Backpacks & Drawstring Bags', 'Messenger & Briefcase Bags', 'Crossbody & Fanny Packs', 'Duffel & Travel Bags', 'Coolers & Lunch Bags', 'Clear Stadium Bags', 'Paper, Plastic & Retail Bags'],
  'Keychains & Accessories': ['Plush Keychains', 'PVC & Rubber Keychains', 'Metal & Enamel Keychains', 'Acrylic Keychains', 'Bottle Opener Keychains', 'Leather & Fabric Keychains', 'Light-Up & Functional Keychains', 'Pins & Patches'],
  'Drinkware': ['Tumblers & Travel Mugs', 'Water Bottles', 'Mugs & Cups', 'Can Coolers & Beverage Holders', 'Barware', 'Coasters & Drinkware Accessories'],
  'Plush & Mascots': ['Plush Keychains', 'Plush Pillows', 'Holiday & Seasonal Plush', 'Brand & Team Mascots', 'Custom Plush Toys'],
  'Wearables': ['T-Shirts', 'Polo Shirts', 'Hoodies & Sweatshirts', 'Sweaters & Knitwear', 'Jackets & Outerwear', 'Hats & Caps', 'Aprons & Uniforms', 'Activewear'],
  'Office & Stationery': ['Notebooks & Journals', 'Pens & Writing', 'Desk Accessories & Organizers', 'Sticky Notes', 'Calendars & Planners', 'Mouse Pads'],
  'Outdoor & Leisure': ['Camping & Hiking Gear', 'Picnic & BBQ', 'Beach Accessories', 'Fishing Gear', 'Outdoor Games', 'Blankets & Towels', 'Travel & Leisure Kits'],
  'Technology': ['Power Banks', 'USB Drives', 'Phone Accessories', 'Wireless Chargers', 'Speakers & Audio', 'Headphones & Earbuds', 'Cables & Adapters'],
  'Trade Show': ['Banners & Signs', 'Table Covers', 'Pop-Up Displays', 'Lanyards & Badges', 'Brochure & Literature Holders', 'Flags', 'Booth Accessories']
};
const BRAND_CATEGORIES = {
  'Tropicana': 'Food & Beverage', "King's Hawaiian": 'Food & Beverage', 'OLIPOP': 'Food & Beverage',
  'Pabst': 'Food & Beverage', 'Aperol': 'Food & Beverage', 'Deer Park': 'Food & Beverage',
  'Naked': 'Food & Beverage', 'Mauna Loa': 'Food & Beverage', 'Espolon': 'Food & Beverage',
  'Rainier': 'Food & Beverage', 'Lone Star': 'Food & Beverage', 'Long Drink': 'Food & Beverage',
  "Grillo's": 'Food & Beverage', 'Splash Refresher': 'Food & Beverage',
  'Playboy': 'Lifestyle & Entertainment', 'John Wayne': 'Lifestyle & Entertainment',
  'Mythical': 'Lifestyle & Entertainment', 'Steve-O': 'Lifestyle & Entertainment',
  "World's Strongest Man": 'Sports', 'BMW': 'Retail & Automotive', '7-Eleven': 'Retail & Automotive',
  'Librela': 'Health, Wellness & Pet', 'IntelliSkin': 'Health, Wellness & Pet'
};
const NEW_PRODUCT_DEFAULTS = {
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
  shippingByAir: '5-7 days',
  shippingBySea: '22-30 days'
};

function setAuthToken(token) {
  state.token = token || '';
  if (state.token) {
    window.localStorage.setItem('amazingyepAdminToken', state.token);
  } else {
    window.localStorage.removeItem('amazingyepAdminToken');
  }
}

function showLogin(message) {
  document.body.classList.add('auth-locked');
  els.loginScreen.hidden = false;
  if (message) {
    els.loginStatus.hidden = false;
    els.loginStatus.textContent = message;
  } else {
    els.loginStatus.hidden = true;
    els.loginStatus.textContent = '';
  }
  window.setTimeout(() => els.loginPassword.focus(), 0);
}

function hideLogin() {
  document.body.classList.remove('auth-locked');
  els.loginScreen.hidden = true;
  els.loginStatus.hidden = true;
  els.loginStatus.textContent = '';
}

function isAdmin() {
  return state.user && state.user.role === 'admin';
}

function applyPermissions() {
  const admin = isAdmin();
  els.teamPanel.hidden = !admin;
  els.backupPanel.hidden = !admin;
  els.adminViewBtn.hidden = !admin;
  els.downloadBackupBtn.hidden = !admin;
  els.deleteProductBtn.hidden = !admin;
}

async function authFetch(url, options) {
  const request = { ...(options || {}) };
  const headers = new Headers(request.headers || {});
  if (state.token) headers.set('Authorization', 'Bearer ' + state.token);
  request.headers = headers;

  const res = await fetch(API + url, request);
  if (res.status === 401) {
    setAuthToken('');
    showLogin('Please sign in again.');
  }
  return res;
}

function currentCatalogExpirationDate() {
  return '12/31/' + new Date().getFullYear();
}

function showStatus(message, isError) {
  els.status.hidden = false;
  els.status.textContent = message;
  els.status.classList.toggle('error', Boolean(isError));
  window.clearTimeout(showStatus.timer);
  showStatus.timer = window.setTimeout(() => {
    els.status.hidden = true;
  }, 3600);
}

function setView(view) {
  state.view = view;
  const showProducts = view === 'products';
  const showAdmin = view === 'admin';
  els.productsView.hidden = !showProducts;
  els.adminView.hidden = !showAdmin;
  els.editorView.hidden = showProducts || showAdmin;
  els.productsViewBtn.classList.toggle('active', showProducts);
  els.editorViewBtn.classList.toggle('active', !showProducts && !showAdmin);
  els.adminViewBtn.classList.toggle('active', showAdmin);
  els.viewProductBtn.hidden = showProducts || showAdmin;
  els.saveBtn.hidden = showProducts || showAdmin;
  els.deleteProductBtn.hidden = showProducts || showAdmin || !isAdmin();
  els.title.textContent = showProducts ? 'Products' : (showAdmin ? 'Administration' : ((state.selected && state.selected.name) || 'New Product'));
  if (els.importPanel) els.importPanel.hidden = true;
}

function clearSearchAutofill() {
  const value = els.search.value.trim();
  const username = (els.loginUser.value || (state.user && state.user.username) || '').trim();
  if (value && username && value.toLowerCase() === username.toLowerCase()) {
    els.search.value = '';
  }
}

function isFilled(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === 'object') return Object.values(value).some((item) => isFilled(item));
  return String(value || '').trim() !== '';
}

function priceTierCount(product) {
  return Array.isArray(product.pricing)
    ? product.pricing.filter((row) => Number(row.quantity) > 0 && Number(row.price) > 0).length
    : 0;
}

function validateProduct(product) {
  const required = [];
  const sageWarnings = [];

  [
    ['Item Number', product.sku],
    ['Product Name', product.name],
    ['Website Category', product.category],
    ['Primary Category', product.sageCategory1],
    ['Description', product.description],
    ['Main Image', product.images],
    ['Price Range', product.priceRange]
  ].forEach(([label, value]) => {
    if (!isFilled(value)) required.push(label);
  });

  [
    ['Keywords', product.keywords],
    ['Themes', product.themes],
    ['Colors', product.colorOptions],
    ['Made In', product.madeInCountry],
    ['Assembled In', product.assembledInCountry],
    ['Decorated In', product.decoratedInCountry],
    ['Material', product.material],
    ['Dimensions', product.dimensions],
    ['Decoration Method', product.imprintMethod],
    ['Primary Imprint Area', product.imprintArea],
    ['Packaging', product.packaging],
    ['Carton Information', product.carton],
    ['Production Time', product.production && (product.production.timeLo || product.production.timeHi)],
    ['Sample Time', product.shippingTimeline && product.shippingTimeline.sample],
    ['Shipping Point Country', product.shipPointCountry],
    ['Price Code', product.priceCode],
    ['Price Includes', product.priceIncludes]
  ].forEach(([label, value]) => {
    if (!isFilled(value)) sageWarnings.push(label);
  });

  if (priceTierCount(product) < 1 && !product.quotedUponRequest) {
    sageWarnings.push('At least one pricing tier');
  }

  if (Array.isArray(product.themes) && product.themes.length > 5) {
    sageWarnings.push('Themes must be 5 or fewer');
  }

  return { required, sageWarnings };
}

function renderValidation(result) {
  const required = result.required || [];
  const sageWarnings = result.sageWarnings || [];
  if (!required.length && !sageWarnings.length) {
    els.validationPanel.hidden = false;
    els.validationPanel.className = 'validation-panel ok';
    els.validationPanel.innerHTML = '<strong>Product Check</strong><span>Looks ready for website and SAGE export.</span>';
    return;
  }

  els.validationPanel.hidden = false;
  els.validationPanel.className = 'validation-panel' + (required.length ? ' has-errors' : '');
  els.validationPanel.innerHTML =
    '<strong>Product Check</strong>' +
    (required.length ? '<div><b>Required before saving:</b> ' + required.map(escapeHtml).join(', ') + '</div>' : '') +
    (sageWarnings.length ? '<div><b>SAGE reminders:</b> ' + sageWarnings.map(escapeHtml).join(', ') + '</div>' : '');
}

function normalizeList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value).split(',').map((item) => item.trim()).filter(Boolean);
}

function themeLabel(value) {
  const theme = (state.reference.themes || []).find((item) => item.value === value);
  return theme ? theme.label : value;
}

function resolveThemeValue(raw) {
  const text = String(raw || '').trim();
  if (!text) return '';
  const exact = (state.reference.themes || []).find((item) => item.value === text || item.label === text);
  if (exact) return exact.value;
  const labelValue = text.split('—')[0].trim();
  const fromLabel = (state.reference.themes || []).find((item) => item.value === labelValue);
  return fromLabel ? fromLabel.value : labelValue;
}

function getSelectedThemes() {
  return normalizeList(getField('themes')).slice(0, 5);
}

function setSelectedThemes(themes) {
  setField('themes', normalizeList(themes).slice(0, 5).join(', '));
  renderSelectedThemes();
}

function renderSelectedThemes() {
  const selected = getSelectedThemes();
  if (els.themeCount) {
    els.themeCount.textContent = selected.length + ' / 5 selected';
  }
  if (els.addThemeBtn) {
    els.addThemeBtn.disabled = selected.length >= 5;
  }
  if (!els.selectedThemes) return;
  els.selectedThemes.innerHTML = selected.map((value) => (
    '<span class="theme-chip">' +
      escapeHtml(themeLabel(value)) +
      '<button type="button" class="remove-theme" data-theme="' + escapeHtml(value) + '" aria-label="Remove ' + escapeHtml(value) + '">×</button>' +
    '</span>'
  )).join('');
}

function addSelectedTheme() {
  const value = resolveThemeValue(els.themeSearch && els.themeSearch.value);
  if (!value) return;
  const selected = getSelectedThemes();
  if (selected.includes(value)) {
    if (els.themeSearch) els.themeSearch.value = '';
    return;
  }
  if (selected.length >= 5) {
    showStatus('Themes can only include up to 5 items.', true);
    return;
  }
  setSelectedThemes(selected.concat(value));
  if (els.themeSearch) {
    els.themeSearch.value = '';
    els.themeSearch.focus();
  }
  if (!els.validationPanel.hidden) {
    renderValidation(validateProduct(collectProduct()));
  }
}

function linesToArray(value) {
  return String(value || '').split(/\n+/).map((item) => item.trim()).filter(Boolean);
}

function arrayToLines(value) {
  return Array.isArray(value) ? value.join('\n') : '';
}

function parseLegacyUpcharges(value) {
  const out = {};
  String(value || '').split(',').forEach((pair) => {
    const parts = pair.split(':');
    if (parts.length >= 2) {
      const qty = parts[0].trim();
      const amount = parts.slice(1).join(':').trim();
      if (qty) out[qty] = amount;
    }
  });
  return out;
}

function normalizeOptions(product) {
  if (Array.isArray(product.options)) return product.options;
  if (product.options && typeof product.options === 'object') {
    const option = product.options;
    return [{
      name: option.name || '',
      priceCode: option.priceCode || '',
      pricingType: option.pricingType || 'upcharge',
      rows: [{
        label: option.label || '',
        upcharges: parseLegacyUpcharges(option.upcharges)
      }]
    }];
  }
  if (product.optionName || product.optionLabel || product.optionUpcharges) {
    return [{
      name: product.optionName || '',
      priceCode: product.optionPriceCode || '',
      pricingType: 'upcharge',
      rows: [{
        label: product.optionLabel || '',
        upcharges: parseLegacyUpcharges(product.optionUpcharges)
      }]
    }];
  }
  return [];
}

function getOptionQuantities(option) {
  if (Array.isArray(option.quantities) && option.quantities.length) {
    return option.quantities.map((qty) => String(qty));
  }
  const pricingQtys = collectPricing().map((row) => row.quantity).filter(Boolean);
  if (pricingQtys.length) return pricingQtys.map((qty) => String(qty));
  return DEFAULT_OPTION_QTYS.map((qty) => String(qty));
}

function setField(name, value) {
  const input = els.form.elements[name];
  if (input) input.value = value || '';
}

function setChecked(name, value) {
  const input = els.form.elements[name];
  if (input) input.checked = Boolean(value);
}

function resizeTextareas() {
  Array.from(els.form.querySelectorAll('textarea')).forEach((textarea) => {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  });
}

function getField(name) {
  const input = els.form.elements[name];
  return input ? input.value.trim() : '';
}

function updateWebsiteProductTypeOptions(category, selectedValue) {
  const select = els.form.elements.websiteProductType;
  if (!select) return;
  const types = WEBSITE_PRODUCT_TYPES[category] || [];
  select.innerHTML = '<option value="">Automatically detect</option>' + types.map((type) => (
    '<option value="' + escapeHtml(type) + '">' + escapeHtml(type) + '</option>'
  )).join('');
  if (selectedValue && !types.includes(selectedValue)) {
    select.insertAdjacentHTML('beforeend', '<option value="' + escapeHtml(selectedValue) + '">' + escapeHtml(selectedValue) + ' (existing)</option>');
  }
  select.value = selectedValue || '';
}

function getChecked(name) {
  const input = els.form.elements[name];
  return input ? input.checked : false;
}

function productImage(product) {
  return (product.images && product.images[0])
    || (product.gallery && product.gallery[0])
    || (product.colorOptions && product.colorOptions[0] && product.colorOptions[0].image)
    || '';
}

function updatePreview(src) {
  if (!src) {
    els.imagePreview.innerHTML = '<span class="image-preview-empty">Website Main Image / Left Image</span>';
    return;
  }
  const previewSrc = src.replace(/^\.\.\//, '/');
  els.imagePreview.innerHTML = '<span class="image-preview-badge">Website Main Image / Left Image</span><img src="' + previewSrc + '" alt="">';
}

function renderGalleryPreview(images) {
  const items = Array.isArray(images) ? images.filter(Boolean) : [];
  if (!items.length) {
    els.galleryPreview.innerHTML = '<p class="panel-note">No additional images yet.</p>';
    return;
  }
  els.galleryPreview.innerHTML = items.map((src, index) =>
    '<div class="gallery-thumb"><img src="' + escapeHtml(src.replace(/^\.\.\//, '/')) + '" alt="Additional product image"><button type="button" class="remove-gallery-image" data-index="' + index + '" aria-label="Remove image">×</button></div>'
  ).join('');
}

function updateCalculatedPriceRange() {
  const values = Array.from(document.querySelectorAll('.price-value'))
    .map((input) => Number(input.value))
    .filter((value) => Number.isFinite(value) && value > 0);
  const field = els.form.elements.priceRange;
  if (!field) return;
  if (!values.length) {
    field.value = '';
    return;
  }
  const low = Math.min(...values);
  const high = Math.max(...values);
  field.value = '$' + low.toFixed(2) + (low === high ? '' : '-$' + high.toFixed(2));
}

function renderList() {
  if (!state.products.length) {
    els.list.innerHTML = '<div class="product-item"><strong>No products</strong><span>Create your first product.</span></div>';
    return;
  }

  els.list.innerHTML = state.products.map((product) => {
    const active = state.selected && String(state.selected.id) === String(product.id);
    return '<button class="product-item ' + (active ? 'active' : '') + '" type="button" data-id="' + product.id + '">' +
      '<strong>' + escapeHtml(product.name || 'Untitled Product') + '</strong>' +
      '<span>' + escapeHtml(product.sku || 'No SKU') + ' · ' + escapeHtml(product.category || 'No category') + '</span>' +
    '</button>';
  }).join('');
}

function productStatusLabel(product) {
  if (product.discontinued) return '<span class="status-pill danger">Discontinued</span>';
  if (product.published !== false) return '<span class="status-pill live">Published</span>';
  return '<span class="status-pill draft">Draft</span>';
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}

function renderCatalog() {
  els.catalogSummary.textContent = state.products.length
    ? state.products.length + ' product' + (state.products.length === 1 ? '' : 's') + ' in the current view.'
    : 'No products match the current filters. Clear search or filters to see all products.';

  if (!state.products.length) {
    els.catalogRows.innerHTML = '<tr><td colspan="7" class="empty-cell">No products found. Use Clear Filters or create a New Product.</td></tr>';
    return;
  }

  els.catalogRows.innerHTML = state.products.map((product) => {
    return '<tr class="catalog-row" data-id="' + escapeHtml(product.id) + '">' +
      '<td><div class="catalog-product"><div class="catalog-thumb">' + (productImage(product) ? '<img src="' + escapeHtml(productImage(product)) + '" alt="">' : '<span>No image</span>') + '</div><strong>' + escapeHtml(product.sku || product.itemNumber || product.id || '') + '</strong></div></td>' +
      '<td>' + escapeHtml(product.name || 'Untitled Product') + '<div class="catalog-desc">' + escapeHtml((product.description || '').slice(0, 120)) + '</div></td>' +
      '<td>' + escapeHtml(product.category || '') + '<div class="catalog-desc">' + escapeHtml(product.subcategory || '') + '</div></td>' +
      '<td>' + escapeHtml(product.sageCategory1 || '') + '<div class="catalog-desc">' + escapeHtml(product.sageCategory2 || '') + '</div></td>' +
      '<td>' + productStatusLabel(product) + '</td>' +
      '<td>' + escapeHtml(formatDate(product.updatedAt)) + '</td>' +
      '<td><button class="btn mini edit-product" type="button" data-id="' + escapeHtml(product.id) + '">Edit</button></td>' +
    '</tr>';
  }).join('');
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[char]));
}

function populateBrandReferences() {
  const names = new Set(Object.keys(BRAND_CATEGORIES));
  const categories = new Set(Object.values(BRAND_CATEGORIES));
  (state.brandReference.brands || []).forEach((brand) => {
    if (brand.name) names.add(brand.name);
    if (brand.category) categories.add(brand.category);
  });
  (state.brandReference.categories || []).forEach((category) => categories.add(category));
  state.products.forEach((product) => {
    if (product.brandName) names.add(product.brandName);
    if (product.brandCategory) categories.add(product.brandCategory);
  });
  const nameList = document.getElementById('brandNameList');
  const categoryList = document.getElementById('brandCategoryList');
  if (nameList) nameList.innerHTML = Array.from(names).sort().map((value) => '<option value="' + escapeHtml(value) + '"></option>').join('');
  if (categoryList) categoryList.innerHTML = Array.from(categories).sort().map((value) => '<option value="' + escapeHtml(value) + '"></option>').join('');
}

function applyKnownBrandCategory() {
  const entered = getField('brandName').toLowerCase();
  const known = Object.entries(BRAND_CATEGORIES).find(([name]) => name.toLowerCase() === entered);
  const saved = (state.brandReference.brands || []).find((brand) => String(brand.name || '').toLowerCase() === entered);
  if (saved && saved.category) setField('brandCategory', saved.category);
  else if (known) setField('brandCategory', known[1]);
  updateBrandAssignmentStatus();
}

function updateBrandAssignmentStatus() {
  const status = document.getElementById('brandAssignmentStatus');
  if (!status) return;
  const name = getField('brandName');
  const category = getField('brandCategory');
  status.classList.toggle('assigned', Boolean(name || category));
  status.textContent = name
    ? 'Assigned to ' + name + (category ? ' · ' + category : ' · category not selected')
    : (category ? 'Category selected: ' + category + ' · brand not selected' : 'No brand program assigned to this product.');
}

function rememberBrandReference(product) {
  const name = String(product.brandName || '').trim();
  const category = String(product.brandCategory || '').trim();
  if (category && !(state.brandReference.categories || []).some((item) => item.toLowerCase() === category.toLowerCase())) {
    state.brandReference.categories.push(category);
  }
  if (name) {
    const existing = (state.brandReference.brands || []).find((item) => item.name.toLowerCase() === name.toLowerCase());
    if (existing) existing.category = category || existing.category;
    else state.brandReference.brands.push({ name, category });
  }
  populateBrandReferences();
}

async function loadProducts() {
  const params = new URLSearchParams();
  if (els.search.value.trim()) params.set('search', els.search.value.trim());
  if (els.category.value) params.set('category', els.category.value);
  if (els.sageCategory.value) params.set('sageCategory', els.sageCategory.value);
  const res = await authFetch('/api/products?' + params.toString());
  if (!res.ok) throw new Error('Could not load products.');
  const data = await res.json();
  state.products = data.products || [];
  populateBrandReferences();
  if (state.selected && !state.products.some((product) => String(product.id) === String(state.selected.id))) {
    state.selected = null;
  }
  renderList();
  renderCatalog();
  if (state.view === 'products') setView('products');
}

async function loadReference() {
  const res = await authFetch('/api/reference/sage');
  if (!res.ok) return;
  state.reference = await res.json();
  const categoryList = document.getElementById('sageCategoryList');
  const themeList = document.getElementById('sageThemeList');
  els.sageCategory.innerHTML = '<option value="">All SAGE Categories</option>' + (state.reference.categories || [])
    .map((item) => '<option value="' + escapeHtml(item) + '">' + escapeHtml(item) + '</option>')
    .join('');
  categoryList.innerHTML = (state.reference.categories || [])
    .map((item) => '<option value="' + escapeHtml(item) + '"></option>')
    .join('');
  themeList.innerHTML = (state.reference.themes || [])
    .map((item) => '<option value="' + escapeHtml(item.value) + '">' + escapeHtml(item.label) + '</option>')
    .join('');
}

async function loadBrandReference() {
  const res = await authFetch('/api/reference/brands');
  if (!res.ok) return;
  state.brandReference = await res.json();
  populateBrandReferences();
}

async function login(username, password) {
  const res = await fetch(API + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Login failed.');
  }
  const data = await res.json();
  setAuthToken(data.token);
  state.user = data.user || null;
  applyPermissions();
  hideLogin();
  els.search.value = '';
  await loadReference();
  await loadBrandReference();
  clearSearchAutofill();
  await loadProducts();
  setView('products');
  if (isAdmin()) {
    await loadUsers();
  }
}

async function checkSession() {
  if (!state.token) {
    showLogin();
    return;
  }

  const res = await authFetch('/api/auth/me');
  if (!res.ok) {
    showLogin('Please sign in.');
    return;
  }

  const data = await res.json();
  state.user = data.user || null;
  applyPermissions();
  hideLogin();
  els.search.value = '';
  await loadReference();
  await loadBrandReference();
  clearSearchAutofill();
  await loadProducts();
  setView('products');
  if (isAdmin()) {
    await loadUsers();
  }
}

function logout() {
  setAuthToken('');
  state.user = null;
  state.users = [];
  state.products = [];
  state.selected = null;
  applyPermissions();
  renderList();
  showLogin('You have signed out.');
}

function renderUsers() {
  if (!isAdmin()) {
    els.userList.innerHTML = '';
    return;
  }

  if (!state.users.length) {
    els.userList.innerHTML = '<div class="user-item"><strong>No users</strong><span>Add staff accounts here.</span></div>';
    return;
  }

  els.userList.innerHTML = state.users.map((user) => {
    const active = user.active !== false;
    return '<div class="user-item">' +
      '<div><strong>' + escapeHtml(user.displayName || user.username) + '</strong>' +
      '<span>' + escapeHtml(user.username) + ' · ' + escapeHtml(user.role || 'staff') + (active ? '' : ' · inactive') + '</span></div>' +
      '<button class="text-btn user-toggle" type="button" data-id="' + escapeHtml(user.id) + '" data-active="' + (active ? 'false' : 'true') + '">' + (active ? 'Disable' : 'Enable') + '</button>' +
    '</div>';
  }).join('');
}

async function loadUsers() {
  if (!isAdmin()) return;
  const res = await authFetch('/api/users');
  if (!res.ok) throw new Error('Could not load team accounts.');
  const data = await res.json();
  state.users = data.users || [];
  renderUsers();
}

async function addUser() {
  if (!isAdmin()) return;
  const username = els.newUserName.value.trim();
  const displayName = els.newUserDisplay.value.trim();
  const password = els.newUserPassword.value;
  const role = els.newUserRole.value;

  if (!username || !password) {
    showStatus('Username and temporary password are required.', true);
    return;
  }

  const res = await authFetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, displayName, password, role })
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Could not create user.');
  }

  els.newUserName.value = '';
  els.newUserDisplay.value = '';
  els.newUserPassword.value = '';
  els.newUserRole.value = 'staff';
  await loadUsers();
  showStatus('Staff account created.');
}

async function toggleUser(id, active) {
  const res = await authFetch('/api/users/' + encodeURIComponent(id) + '/status', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ active })
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Could not update user.');
  }
  await loadUsers();
  showStatus('Team account updated.');
}

async function selectProduct(id) {
  const res = await authFetch('/api/products/' + encodeURIComponent(id));
  if (!res.ok) throw new Error('Product not found.');
  state.selected = await res.json();
  fillForm(state.selected);
  renderList();
  setView('editor');
}

function fillForm(product) {
  els.form.reset();
  els.title.textContent = product.name || 'New Product';
  setField('id', product.id);
  setField('sku', product.sku);
  setField('category', product.category);
  setField('subcategory', product.subcategory);
  updateWebsiteProductTypeOptions(product.category, product.websiteProductType);
  setField('brandName', product.brandName);
  setField('brandCategory', product.brandCategory);
  updateBrandAssignmentStatus();
  setField('sageCategory1', product.sageCategory1);
  setField('sageCategory2', product.sageCategory2);
  setField('name', product.name);
  setField('description', product.description);
  setField('priceRange', product.priceRange);
  setField('keywords', Array.isArray(product.keywords) ? product.keywords.join(', ') : product.keywords);
  setSelectedThemes(product.themes);
  setSelectedUseCases(product.useCases || product.useCase || []);
  setField('catalogPage1', product.catalogPage1 || (product.sage && product.sage.page1));
  setField('catalogPage2', product.catalogPage2 || (product.sage && product.sage.page2));
  setField('expirationDate', product.expirationDate || (product.sage && product.sage.expirationDate));
  setChecked('published', product.published !== false);
  setChecked('verified', product.verified);
  setChecked('discontinued', product.discontinued);
  setChecked('notPictured', product.notPictured);
  setField('mainImage', productImage(product));
  setField('gallery', arrayToLines(product.gallery || []));
  renderGalleryPreview(product.gallery || []);
  setField('sagePictureUrl', product.sagePictureUrl);
  setField('madeInCountry', 'China');
  setField('assembledInCountry', 'China');
  setField('decoratedInCountry', 'China');
  setField('shipPointCountry', 'China');
  setField('shipPointPostalCode', product.shipPointPostalCode || (product.sage && product.sage.shipPointPostalCode));
  setField('setupCharge', product.setupCharge);
  setField('setupChargeCode', 'C');
  setField('imprintLocation', product.imprintLocation);
  setField('imprintArea', product.imprintArea);
  setField('secondaryImprintArea', product.secondaryImprintArea || product.secondImprintArea);
  setField('secondaryImprintLocation', product.secondaryImprintLocation || product.secondImprintLocation);
  setChecked('noDecorationOffered', product.noDecorationOffered);
  setChecked('printOnDemand', product.printOnDemand);
  setField('material', product.material);
  setField('dimensionLength', product.dimensionLength || (product.dimensions && product.dimensions.length));
  setField('dimensionWidth', product.dimensionWidth || (product.dimensions && product.dimensions.width));
  setField('dimensionHeight', product.dimensionHeight || (product.dimensions && product.dimensions.height));
  setField('dimensionUnits', product.dimensionUnits || (product.dimensions && product.dimensions.units));
  setField('imprintMethod', product.imprintMethod);
  setField('packaging', product.packaging);
  setField('priceCode', 'CCCCCC');
  setField('priceIncludeColor', product.priceIncludeColor || (product.priceIncludes && product.priceIncludes.colors));
  setField('priceIncludeSide', product.priceIncludeSide || (product.priceIncludes && product.priceIncludes.sides));
  setField('priceIncludeLocation', product.priceIncludeLocation || (product.priceIncludes && product.priceIncludes.locations));
  setChecked('quotedUponRequest', product.quotedUponRequest);
  setChecked('noDecorationIncludedInPrice', product.noDecorationIncludedInPrice);
  setField('screenCharge', product.screenCharge);
  setField('screenChargeCode', product.screenChargeCode);
  setField('dieCharge', product.dieCharge);
  setField('dieChargeCode', product.dieChargeCode);
  setField('addColorLocationSetup', product.addColorLocationSetup);
  setField('addColorLocationSetupCode', product.addColorLocationSetupCode || product.addColorChargeCode);
  renderPricing(product.pricing || []);
  renderOptions(normalizeOptions(product));
  setField('unitsPerCarton', product.unitsPerCarton || (product.carton && product.carton.unitsPerCarton));
  setField('weightPerCarton', product.weightPerCarton || (product.carton && product.carton.weight));
  setField('cartonLength', product.cartonLength || (product.carton && product.carton.length));
  setField('cartonWidth', product.cartonWidth || (product.carton && product.carton.width));
  setField('cartonHeight', product.cartonHeight || (product.carton && product.carton.height));
  setField('sampleTime', product.sampleTime || (product.shippingTimeline && product.shippingTimeline.sample));
  setField('productionTimeLo', product.productionTimeLo || (product.production && product.production.timeLo));
  setField('productionTimeHi', product.productionTimeHi || (product.production && product.production.timeHi));
  setField('rushTimeLo', product.rushTimeLo || (product.production && product.production.rushLo));
  setField('rushTimeHi', product.rushTimeHi || (product.production && product.production.rushHi));
  setField('shippingByAir', '5-7 days');
  setField('shippingBySea', '22-30 days');
  renderColors(product.colorOptions || []);
  updatePreview(productImage(product));
  resizeTextareas();
  setEditorTab('website');
}

async function recommendWebsitePlacement() {
  const status = document.getElementById('placementRecommendationStatus');
  const button = document.getElementById('recommendPlacementBtn');
  button.disabled = true;
  status.textContent = 'Analyzing product details...';
  try {
    const response = await authFetch('/api/products/recommend-placement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(collectProduct())
    });
    if (!response.ok) throw new Error('Could not create recommendations.');
    const placement = await response.json();
    setField('category', placement.category);
    updateWebsiteProductTypeOptions(placement.category, placement.websiteProductType);
    setSelectedUseCases(placement.useCases || []);
    status.textContent = placement.category
      ? 'Recommended fields applied. Please review before saving.'
      : 'Not enough product information to recommend a category yet.';
  } catch (error) {
    status.textContent = error.message;
  } finally {
    button.disabled = false;
  }
}

function normalizeUseCases(value) {
  return Array.isArray(value) ? value.map(String) : normalizeList(value);
}

function setSelectedUseCases(value) {
  const selected = new Set(normalizeUseCases(value));
  els.form.querySelectorAll('input[name="useCases"]').forEach((input) => {
    input.checked = selected.has(input.value);
  });
}

function getSelectedUseCases() {
  return Array.from(els.form.querySelectorAll('input[name="useCases"]:checked')).map((input) => input.value);
}

function setEditorTab(tab) {
  state.editorTab = tab || 'website';
  document.querySelectorAll('[data-editor-tab]').forEach((button) => {
    const active = button.dataset.editorTab === state.editorTab;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', active ? 'true' : 'false');
  });
  document.querySelectorAll('[data-editor-section]').forEach((section) => {
    section.hidden = section.dataset.editorSection !== state.editorTab;
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function blankProduct() {
  state.selected = null;
  fillForm({
    ...NEW_PRODUCT_DEFAULTS,
    shippingTimeline: {
      sample: NEW_PRODUCT_DEFAULTS.sampleTime,
      shippingByAir: NEW_PRODUCT_DEFAULTS.shippingByAir,
      shippingBySea: NEW_PRODUCT_DEFAULTS.shippingBySea
    },
    expirationDate: currentCatalogExpirationDate(),
    published: false,
    pricing: [
      { quantity: 100, price: '' },
      { quantity: 250, price: '' },
      { quantity: 500, price: '' }
    ],
    colorOptions: [],
    options: []
  });
  els.title.textContent = 'New Product';
  renderList();
  setView('editor');
}

function renderPricing(pricing) {
  const rows = pricing.length ? pricing : [{ quantity: '', price: '' }];
  els.pricingRows.innerHTML = rows.map((row) => priceRowHtml(row.quantity, row.price, row.piecesPerUnit || 1)).join('');
  updateCalculatedPriceRange();
}

function priceRowHtml(quantity, price, piecesPerUnit) {
  return '<div class="row-line price-row">' +
    '<label>Quantity<input class="price-qty" type="number" min="0" step="1" value="' + escapeHtml(quantity) + '"></label>' +
    '<label>Coded Price<input class="price-value" type="number" min="0" step="0.01" value="' + escapeHtml(price) + '"></label>' +
    '<label>Pieces Per Unit<input class="price-pieces" type="number" min="0" step="1" value="' + escapeHtml(piecesPerUnit || 1) + '"></label>' +
    '<button class="btn danger remove-row" type="button">Remove</button>' +
  '</div>';
}

function renderColors(colors) {
  const rows = colors.length ? colors : [];
  els.colorRows.innerHTML = rows.map((row) => colorRowHtml(row.name, row.image)).join('');
}

function colorRowHtml(name, image) {
  return '<div class="row-line color color-row">' +
    '<label>Color<input class="color-name" type="text" value="' + escapeHtml(name) + '"></label>' +
    '<label>Image URL<input class="color-image" type="text" value="' + escapeHtml(image) + '"></label>' +
    '<label class="color-upload-label">Upload Image<input class="color-upload" type="file" accept="image/*"></label>' +
    '<button class="btn danger remove-row" type="button">Remove</button>' +
  '</div>';
}

function collectPricing() {
  return Array.from(document.querySelectorAll('.price-row')).map((row) => ({
    quantity: Number(row.querySelector('.price-qty').value || 0),
    price: Number(row.querySelector('.price-value').value || 0),
    piecesPerUnit: Number(row.querySelector('.price-pieces').value || 1)
  })).filter((row) => row.quantity > 0 || row.price > 0);
}

function collectColors() {
  return Array.from(document.querySelectorAll('.color-row')).map((row) => ({
    name: row.querySelector('.color-name').value.trim(),
    image: row.querySelector('.color-image').value.trim()
  })).filter((row) => row.name || row.image);
}

function renderOptions(options) {
  const rows = options.length ? options : [];
  els.optionRows.innerHTML = rows.map((option) => optionCardHtml(option)).join('');
}

function optionCardHtml(option) {
  const groupName = 'option-pricing-' + Math.random().toString(36).slice(2);
  const rows = Array.isArray(option.rows) && option.rows.length ? option.rows : [{ label: '', upcharges: {} }];
  const quantities = getOptionQuantities(option);
  return '<div class="option-card">' +
    '<div class="option-card-head">' +
      '<label class="field-card"><span>Option Name</span><input class="option-name" type="text" value="' + escapeHtml(option.name || '') + '" placeholder="Imprint Method"></label>' +
      '<div class="option-type">' +
        '<label><input class="option-pricing-type" name="' + groupName + '" type="radio" value="upcharge" ' + ((option.pricingType || 'upcharge') === 'upcharge' ? 'checked' : '') + '> Pricing is an upcharge</label>' +
        '<label><input class="option-pricing-type" name="' + groupName + '" type="radio" value="total" ' + (option.pricingType === 'total' ? 'checked' : '') + '> Pricing is the total</label>' +
      '</div>' +
      '<label>Price Code<input class="option-price-code" type="text" value="' + escapeHtml(option.priceCode || '') + '" placeholder="CCCCCC"></label>' +
      '<button class="btn danger remove-option" type="button">Remove Option</button>' +
    '</div>' +
    '<div class="option-table"><table>' +
      '<thead><tr><th class="option-value-cell">VALUES</th>' + quantities.map((qty) => '<th><input class="option-qty" type="number" min="0" step="1" value="' + escapeHtml(qty) + '"></th>').join('') + '<th class="option-actions-cell">Action</th></tr></thead>' +
      '<tbody>' + rows.map((row) => optionValueRowHtml(row, quantities)).join('') + '</tbody>' +
    '</table></div>' +
    '<div class="option-row-actions"><button class="btn mini add-option-value" type="button">Add Value Row</button></div>' +
  '</div>';
}

function optionValueRowHtml(row, quantities) {
  const upcharges = row.upcharges || {};
  const qtys = quantities || DEFAULT_OPTION_QTYS.map((qty) => String(qty));
  return '<tr class="option-value-row">' +
    '<td><input class="option-label" type="text" value="' + escapeHtml(row.label || '') + '" placeholder="Heat Transfer 2 colors"></td>' +
    qtys.map((qty) => '<td><input class="option-upcharge" type="text" value="' + escapeHtml(upcharges[qty] || '') + '" placeholder="+0.4"></td>').join('') +
    '<td><button class="btn danger remove-option-value" type="button">Remove</button></td>' +
  '</tr>';
}

function collectOptions() {
  return Array.from(document.querySelectorAll('.option-card')).map((card) => {
    const selectedType = card.querySelector('.option-pricing-type:checked');
    const quantities = Array.from(card.querySelectorAll('.option-qty')).map((input) => input.value.trim()).filter(Boolean);
    return {
      name: card.querySelector('.option-name').value.trim(),
      pricingType: selectedType ? selectedType.value : 'upcharge',
      priceCode: card.querySelector('.option-price-code').value.trim(),
      quantities,
      rows: Array.from(card.querySelectorAll('.option-value-row')).map((row) => {
        const upcharges = {};
        row.querySelectorAll('.option-upcharge').forEach((input, index) => {
          const qty = quantities[index];
          if (qty && input.value.trim()) upcharges[qty] = input.value.trim();
        });
        return {
          label: row.querySelector('.option-label').value.trim(),
          upcharges
        };
      }).filter((row) => row.label || Object.keys(row.upcharges).length)
    };
  }).filter((option) => option.name || option.priceCode || option.rows.length);
}

function collectProduct() {
  const mainImage = getField('mainImage');
  const gallery = linesToArray(getField('gallery'));
  const images = mainImage ? [mainImage] : [];
  const material = getField('material');
  const dimensions = {
    length: getField('dimensionLength'),
    width: getField('dimensionWidth'),
    height: getField('dimensionHeight'),
    units: getField('dimensionUnits') || 'Inches'
  };
  const productSize = [dimensions.length, dimensions.width, dimensions.height].filter(Boolean).join(' x ') + (dimensions.units ? ' ' + dimensions.units : '');
  const imprintMethod = getField('imprintMethod');
  const imprintArea = getField('imprintArea');
  const secondaryImprintArea = getField('secondaryImprintArea');
  const packaging = getField('packaging');

  return {
    id: getField('id') || undefined,
    sku: getField('sku'),
    name: getField('name'),
    category: getField('category'),
    subcategory: getField('subcategory'),
    websiteProductType: getField('websiteProductType'),
    brandName: getField('brandName'),
    brandCategory: getField('brandCategory'),
    sageCategory1: getField('sageCategory1'),
    sageCategory2: getField('sageCategory2'),
    description: getField('description'),
    moq: '',
    priceRange: getField('priceRange'),
    keywords: normalizeList(getField('keywords')),
    themes: getSelectedThemes(),
    useCases: getSelectedUseCases(),
    catalogPage1: getField('catalogPage1'),
    catalogPage2: getField('catalogPage2'),
    expirationDate: getField('expirationDate') || currentCatalogExpirationDate(),
    published: getChecked('published'),
    verified: getChecked('verified'),
    discontinued: getChecked('discontinued'),
    notPictured: getChecked('notPictured'),
    images,
    gallery,
    colorOptions: collectColors(),
    pricing: collectPricing(),
    sagePictureUrl: getField('sagePictureUrl'),
    madeInCountry: 'China',
    assembledInCountry: 'China',
    decoratedInCountry: 'China',
    shipPointCountry: 'China',
    shipPointPostalCode: getField('shipPointPostalCode'),
    setupCharge: getField('setupCharge') ? Number(getField('setupCharge')) : '',
    setupChargeCode: 'C',
    imprintLocation: getField('imprintLocation'),
    imprintArea,
    secondaryImprintLocation: getField('secondaryImprintLocation'),
    secondaryImprintArea,
    noDecorationOffered: getChecked('noDecorationOffered'),
    printOnDemand: getChecked('printOnDemand'),
    material,
    productSize,
    dimensions,
    imprintMethod,
    packaging,
    priceCode: 'CCCCCC',
    priceIncludeColor: getField('priceIncludeColor'),
    priceIncludeSide: getField('priceIncludeSide'),
    priceIncludeLocation: getField('priceIncludeLocation'),
    priceIncludes: {
      colors: getField('priceIncludeColor'),
      sides: getField('priceIncludeSide'),
      locations: getField('priceIncludeLocation')
    },
    quotedUponRequest: getChecked('quotedUponRequest'),
    noDecorationIncludedInPrice: getChecked('noDecorationIncludedInPrice'),
    screenCharge: getField('screenCharge') ? Number(getField('screenCharge')) : '',
    screenChargeCode: getField('screenChargeCode'),
    dieCharge: getField('dieCharge') ? Number(getField('dieCharge')) : '',
    dieChargeCode: getField('dieChargeCode'),
    addColorLocationSetup: getField('addColorLocationSetup') ? Number(getField('addColorLocationSetup')) : '',
    addColorLocationSetupCode: getField('addColorLocationSetupCode'),
    options: collectOptions(),
    carton: {
      unitsPerCarton: getField('unitsPerCarton'),
      weight: getField('weightPerCarton'),
      length: getField('cartonLength'),
      width: getField('cartonWidth'),
      height: getField('cartonHeight')
    },
    production: {
      timeLo: getField('productionTimeLo'),
      timeHi: getField('productionTimeHi'),
      rushLo: getField('rushTimeLo'),
      rushHi: getField('rushTimeHi')
    },
    productDetails: {
      specs: [
        { label: 'Material', value: material },
        { label: 'Product Size', value: productSize },
        { label: 'Imprint Method', value: imprintMethod },
        { label: 'Primary Imprint Area', value: imprintArea },
        { label: 'Secondary Imprint Area', value: secondaryImprintArea },
        { label: 'Packaging', value: packaging }
      ].filter((item) => item.value)
    },
    shippingTimeline: {
      sample: getField('sampleTime'),
      production: [getField('productionTimeLo'), getField('productionTimeHi')].filter(Boolean).join('-') + (getField('productionTimeLo') || getField('productionTimeHi') ? ' working days' : ''),
      shippingByAir: '5-7 days',
      shippingBySea: '22-30 days'
    }
  };
}

async function saveProduct() {
  const product = collectProduct();
  const validation = validateProduct(product);
  renderValidation(validation);
  if (validation.required.length) {
    showStatus('Please complete the required fields before saving.', true);
    return;
  }
  const existingId = state.selected && state.selected.id;
  const url = existingId ? '/api/products/' + encodeURIComponent(existingId) : '/api/products';
  const method = existingId ? 'PUT' : 'POST';
  const res = await authFetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });
  if (!res.ok) throw new Error('Could not save product.');
  state.selected = await res.json();
  rememberBrandReference(state.selected);
  fillForm(state.selected);
  await loadProducts();
  showStatus('Product saved.');
}

async function uploadImageFile(file) {
  const form = new FormData();
  form.append('image', file);
  const res = await authFetch('/api/uploads/images', { method: 'POST', body: form });
  if (!res.ok) throw new Error('Image upload failed.');
  return res.json();
}

async function uploadMainImage(file) {
  const data = await uploadImageFile(file);
  setField('mainImage', data.url);
  if (!getField('sagePictureUrl')) setField('sagePictureUrl', data.url);
  updatePreview(data.url);
  showStatus('Image uploaded.');
}

async function uploadGalleryImages(files) {
  const uploaded = [];
  for (const file of files) {
    const data = await uploadImageFile(file);
    uploaded.push(data.url);
  }
  const existing = linesToArray(getField('gallery'));
  setField('gallery', existing.concat(uploaded).join('\n'));
  renderGalleryPreview(existing.concat(uploaded));
  if (!getField('mainImage') && uploaded[0]) {
    setField('mainImage', uploaded[0]);
    updatePreview(uploaded[0]);
  }
  showStatus(uploaded.length + ' gallery image' + (uploaded.length === 1 ? '' : 's') + ' uploaded.');
}

async function uploadColorImage(row, file) {
  const data = await uploadImageFile(file);
  row.querySelector('.color-image').value = data.url;
  showStatus('Color image uploaded.');
}

async function uploadProductImagesZip(file) {
  if (!state.selected || !state.selected.id) {
    throw new Error('Save or select the product before uploading its image ZIP.');
  }
  const form = new FormData();
  form.append('imagesZip', file);
  showStatus('Uploading and matching product images…');
  const res = await authFetch('/api/products/' + encodeURIComponent(state.selected.id) + '/images-zip', {
    method: 'POST',
    body: form
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Product image ZIP upload failed.');
  state.selected = data.product;
  fillForm(state.selected);
  await loadProducts();
  setView('editor');
  setEditorTab('media');
  showStatus('ZIP matched: ' + data.mainImages + ' main/additional image(s), ' + data.colorImages + ' color image(s).');
}

function openImportPanel() {
  setView('products');
  els.importPanel.hidden = false;
  els.sageImportResult.hidden = true;
  els.importPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeImportPanel() {
  els.importPanel.hidden = true;
}

function renderImportResult(data, preview) {
  const rows = preview ? (data.products || []) : (data.imported || []);
  const warnings = data.warnings || [];
  els.sageImportResult.hidden = false;
  els.sageImportResult.innerHTML = [
    '<strong>' + (preview ? 'Preview' : 'Import Complete') + '</strong>',
    '<p>' + (data.totalProducts || 0) + ' products, ' + (data.totalImageSkus || 0) + ' image folders matched.</p>',
    warnings.length ? '<p class="import-warning">' + warnings.map(escapeHtml).join('<br>') + '</p>' : '',
    rows.length ? '<ul>' + rows.slice(0, 12).map((item) => (
      '<li><b>' + escapeHtml(item.sku || '') + '</b> ' + escapeHtml(item.name || '') +
      ' - main images: ' + (item.mainImages || 0) + ', color images: ' + (item.colorImages || 0) + '</li>'
    )).join('') + '</ul>' : ''
  ].join('');
}

async function submitSageImport(preview) {
  const excel = els.sageImportFile.files && els.sageImportFile.files[0];
  if (!excel) {
    showStatus('Choose a SAGE Excel file first.', true);
    return;
  }
  const formData = new FormData();
  formData.append('excel', excel);
  const zip = els.sageImageZipFile.files && els.sageImageZipFile.files[0];
  if (zip) formData.append('imagesZip', zip);
  els.sagePreviewBtn.disabled = true;
  els.sageImportProductsBtn.disabled = true;
  try {
    showStatus(preview ? 'Reading SAGE file...' : 'Importing products and images...');
    const response = await authFetch(preview ? '/api/imports/sage/preview' : '/api/imports/sage/products', {
      method: 'POST',
      body: formData
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'SAGE import failed.');
    renderImportResult(data, preview);
    if (!preview) {
      await loadProducts();
      showStatus('SAGE products imported.');
    }
  } finally {
    els.sagePreviewBtn.disabled = false;
    els.sageImportProductsBtn.disabled = false;
  }
}

async function exportSage() {
  const product = state.selected || collectProduct();
  const currentProduct = collectProduct();
  const validation = validateProduct(currentProduct);
  renderValidation(validation);
  if (validation.required.length) {
    showStatus('Please complete the required fields before exporting SAGE.', true);
    return;
  }
  if (validation.sageWarnings.length) {
    const confirmed = window.confirm('Some SAGE fields may be incomplete:\n\n- ' + validation.sageWarnings.join('\n- ') + '\n\nExport anyway?');
    if (!confirmed) return;
  }
  const res = await authFetch('/api/exports/sage/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids: product.id || product.sku ? [product.id || product.sku] : [] })
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'SAGE export failed.');
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'SAGE_BPU_ProductList_AmazingYep.xls';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showStatus('SAGE file exported.');
}

function viewWebsiteProduct() {
  const product = collectProduct();
  if (!product.id && !product.sku) {
    showStatus('Save the product before opening the website page.', true);
    return;
  }
  if (product.published === false) {
    showStatus('This product is saved as Draft. Check Published on Website and save before showing it on the public site.', true);
    return;
  }
  const id = encodeURIComponent(product.id || product.sku);
  window.open('/collections/product.html?id=' + id, '_blank');
}

async function downloadBackup() {
  const createRes = await authFetch('/api/backups', { method: 'POST' });
  if (!createRes.ok) throw new Error('Could not create backup.');

  const res = await authFetch('/api/backups/latest/download');
  if (!res.ok) throw new Error('Could not download backup.');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'AmazingYep-products-backup.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showStatus('Backup downloaded.');
}

async function restoreLatestBackup() {
  const confirmed = window.confirm('Restore the latest product database backup?\n\nThe current database will be backed up first, then replaced with the latest backup.');
  if (!confirmed) return;

  const res = await authFetch('/api/backups/latest/restore', { method: 'POST' });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Could not restore backup.');
  }

  const data = await res.json();
  state.selected = null;
  els.form.reset();
  await loadProducts();
  showStatus('Backup restored: ' + (data.restored && data.restored.name ? data.restored.name : 'latest backup'));
}

async function deleteCurrentProduct() {
  if (!state.selected || !state.selected.id) {
    showStatus('Select a product before deleting.', true);
    return;
  }

  const label = (state.selected.sku ? state.selected.sku + ' - ' : '') + (state.selected.name || 'this product');
  const confirmed = window.confirm('Delete ' + label + '?\n\nA backup will be created before deleting.');
  if (!confirmed) return;

  const res = await authFetch('/api/products/' + encodeURIComponent(state.selected.id), { method: 'DELETE' });
  if (!res.ok) throw new Error('Could not delete product.');

  state.selected = null;
  els.form.reset();
  els.title.textContent = 'Edit Product';
  await loadProducts();
  showStatus('Product deleted. A backup was created before deletion.');
}

els.list.addEventListener('click', (event) => {
  const item = event.target.closest('.product-item[data-id]');
  if (item) selectProduct(item.dataset.id).catch((error) => showStatus(error.message, true));
});

els.catalogRows.addEventListener('click', (event) => {
  const target = event.target.closest('[data-id]');
  if (!target) return;
  selectProduct(target.dataset.id).catch((error) => showStatus(error.message, true));
});

document.getElementById('saveBtn').addEventListener('click', () => {
  saveProduct().catch((error) => showStatus(error.message, true));
});

els.importSageBtn.addEventListener('click', openImportPanel);
els.closeImportBtn.addEventListener('click', closeImportPanel);
els.sagePreviewBtn.addEventListener('click', () => {
  submitSageImport(true).catch((error) => showStatus(error.message, true));
});
els.sageImportProductsBtn.addEventListener('click', () => {
  submitSageImport(false).catch((error) => showStatus(error.message, true));
});

els.viewProductBtn.addEventListener('click', viewWebsiteProduct);

els.downloadBackupBtn.addEventListener('click', () => {
  downloadBackup().catch((error) => showStatus(error.message, true));
});

els.deleteProductBtn.addEventListener('click', () => {
  deleteCurrentProduct().catch((error) => showStatus(error.message, true));
});

els.reloadUsersBtn.addEventListener('click', () => {
  loadUsers().catch((error) => showStatus(error.message, true));
});

els.addUserBtn.addEventListener('click', () => {
  addUser().catch((error) => showStatus(error.message, true));
});

els.userList.addEventListener('click', (event) => {
  const button = event.target.closest('.user-toggle[data-id]');
  if (!button) return;
  toggleUser(button.dataset.id, button.dataset.active === 'true').catch((error) => showStatus(error.message, true));
});

els.loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  els.loginStatus.hidden = true;
  login(els.loginUser.value.trim(), els.loginPassword.value)
    .then(() => {
      els.loginPassword.value = '';
    })
    .catch((error) => {
      els.loginStatus.hidden = false;
      els.loginStatus.textContent = error.message;
    });
});

els.logoutBtn.addEventListener('click', logout);

document.getElementById('newProductBtn').addEventListener('click', blankProduct);
document.getElementById('recommendPlacementBtn').addEventListener('click', recommendWebsitePlacement);
els.clearFiltersBtn.addEventListener('click', () => {
  els.search.value = '';
  els.category.value = '';
  els.sageCategory.value = '';
  loadProducts().catch((error) => showStatus(error.message, true));
});

els.productsViewBtn.addEventListener('click', () => {
  setView('products');
  loadProducts().catch((error) => showStatus(error.message, true));
});

els.adminViewBtn.addEventListener('click', () => {
  if (isAdmin()) setView('admin');
});

els.editorViewBtn.addEventListener('click', () => {
  if (!state.selected) {
    setView('products');
    showStatus('Choose Edit beside a product, or click New Product to open the Product Editor.', true);
    return;
  }
  setView('editor');
});

document.querySelectorAll('[data-editor-tab]').forEach((button) => {
  button.addEventListener('click', () => setEditorTab(button.dataset.editorTab));
});

els.form.elements.brandName.addEventListener('change', applyKnownBrandCategory);
els.form.elements.brandName.addEventListener('blur', applyKnownBrandCategory);
els.form.elements.brandCategory.addEventListener('change', updateBrandAssignmentStatus);
els.form.elements.brandCategory.addEventListener('input', updateBrandAssignmentStatus);

document.getElementById('addBrandNameBtn').addEventListener('click', () => {
  const name = window.prompt('Enter the new brand name:');
  if (!name || !name.trim()) return;
  setField('brandName', name.trim());
  applyKnownBrandCategory();
  els.form.elements.brandCategory.focus();
  showStatus('New brand entered. Choose or add its category, then save the product to remember it.');
});

document.getElementById('addBrandCategoryBtn').addEventListener('click', () => {
  const category = window.prompt('Enter the new brand category:');
  if (!category || !category.trim()) return;
  setField('brandCategory', category.trim());
  updateBrandAssignmentStatus();
  showStatus('New brand category entered. Save the product to remember it.');
});

document.getElementById('addPriceBtn').addEventListener('click', () => {
  els.pricingRows.insertAdjacentHTML('beforeend', priceRowHtml('', ''));
});

document.getElementById('addColorBtn').addEventListener('click', () => {
  els.colorRows.insertAdjacentHTML('beforeend', colorRowHtml('', ''));
});

document.getElementById('addOptionBtn').addEventListener('click', () => {
  els.optionRows.insertAdjacentHTML('beforeend', optionCardHtml({ name: '', priceCode: '', pricingType: 'upcharge', rows: [{ label: '', upcharges: {} }] }));
});

document.addEventListener('click', (event) => {
  if (event.target.classList.contains('remove-row')) {
    event.target.closest('.row-line').remove();
    updateCalculatedPriceRange();
  }
  if (event.target.classList.contains('remove-option')) {
    event.target.closest('.option-card').remove();
  }
  if (event.target.classList.contains('add-option-value')) {
    const card = event.target.closest('.option-card');
    const quantities = Array.from(card.querySelectorAll('.option-qty')).map((input) => input.value.trim()).filter(Boolean);
    const body = card.querySelector('tbody');
    body.insertAdjacentHTML('beforeend', optionValueRowHtml({ label: '', upcharges: {} }, quantities));
  }
  if (event.target.classList.contains('remove-option-value')) {
    event.target.closest('.option-value-row').remove();
  }
  if (event.target.classList.contains('remove-gallery-image')) {
    const images = linesToArray(getField('gallery'));
    images.splice(Number(event.target.dataset.index), 1);
    setField('gallery', images.join('\n'));
    renderGalleryPreview(images);
  }
});

els.form.elements.mainImage.addEventListener('input', (event) => updatePreview(event.target.value.trim()));
els.form.elements.category.addEventListener('change', (event) => updateWebsiteProductTypeOptions(event.target.value, ''));
els.addThemeBtn.addEventListener('click', addSelectedTheme);
els.themeSearch.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    addSelectedTheme();
  }
});
els.selectedThemes.addEventListener('click', (event) => {
  if (!event.target.classList.contains('remove-theme')) return;
  const theme = event.target.dataset.theme;
  setSelectedThemes(getSelectedThemes().filter((item) => item !== theme));
  if (!els.validationPanel.hidden) {
    renderValidation(validateProduct(collectProduct()));
  }
});
els.form.addEventListener('input', (event) => {
  if (event.target.tagName === 'TEXTAREA') resizeTextareas();
  if (event.target.classList.contains('price-value')) updateCalculatedPriceRange();
  if (event.target.name === 'gallery') renderGalleryPreview(linesToArray(event.target.value));
  if (!els.validationPanel.hidden) {
    renderValidation(validateProduct(collectProduct()));
  }
});
document.getElementById('imageUpload').addEventListener('change', (event) => {
  const file = event.target.files && event.target.files[0];
  if (file) uploadMainImage(file).catch((error) => showStatus(error.message, true));
  event.target.value = '';
});

document.getElementById('galleryUpload').addEventListener('change', (event) => {
  const files = Array.from(event.target.files || []);
  if (files.length) uploadGalleryImages(files).catch((error) => showStatus(error.message, true));
  event.target.value = '';
});

document.getElementById('productImagesZip').addEventListener('change', (event) => {
  const file = event.target.files && event.target.files[0];
  if (file) uploadProductImagesZip(file).catch((error) => showStatus(error.message, true));
  event.target.value = '';
});

els.colorRows.addEventListener('change', (event) => {
  if (!event.target.classList.contains('color-upload')) return;
  const file = event.target.files && event.target.files[0];
  const row = event.target.closest('.color-row');
  if (file && row) uploadColorImage(row, file).catch((error) => showStatus(error.message, true));
  event.target.value = '';
});

let searchTimer;
els.search.addEventListener('input', () => {
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => loadProducts().catch((error) => showStatus(error.message, true)), 250);
});
els.category.addEventListener('change', () => loadProducts().catch((error) => showStatus(error.message, true)));
els.sageCategory.addEventListener('change', () => loadProducts().catch((error) => showStatus(error.message, true)));

checkSession().catch((error) => {
  setAuthToken('');
  showLogin(error.message);
});
