// ============================================
// Amazing Yep - API Configuration
// All frontend pages share this single source of truth for API calls
// ============================================

(function() {
  const BASE_URL = 'https://amazingyep-backend.onrender.com';

  // Map known products to their custom detail pages
  const DETAIL_PAGE_MAP = {
    'AYP-BG-001': 'bag-detail.html',
    'AYP-BG-002': 'bag-detail-colorful.html'
  };

  // Get detail page URL for a product
  function getDetailPageUrl(product) {
    if (DETAIL_PAGE_MAP[product.sku]) {
      return DETAIL_PAGE_MAP[product.sku];
    }
    return '../collections/product.html?id=' + product.id;
  }

  // Render a product card HTML
  // cardClassPrefix: e.g. 'bags', 'dw', 'plush', 'keychain'
  function renderProductCard(product, cardClassPrefix) {
    const img = (product.images && product.images.length > 0)
      ? (product.images[0].startsWith('http') ? product.images[0] : BASE_URL + product.images[0])
      : (product.gallery && product.gallery.length > 0 ? product.gallery[0] : '../assets/placeholder-product.png');
    const name = product.name || 'Untitled Product';
    const moq = product.moq || '';
    const desc = product.description ? product.description.substring(0, 60) + '...' : '';

    const cardClass = cardClassPrefix + '-featured-card';
    const imgClass = cardClassPrefix + '-featured-card-img';
    const bodyClass = cardClassPrefix + '-featured-card-body';

    const link = getDetailPageUrl(product);

    return '<a href="' + link + '" style="display:block;text-decoration:none;color:inherit;border-radius:12px;overflow:hidden;">' +
      '<div class="' + cardClass + '" style="height:100%;">' +
        '<img class="' + imgClass + '" src="' + img + '" alt="' + name + '" onerror="this.src=\'../assets/placeholder-product.png\'">' +
        '<div class="' + bodyClass + '">' +
          '<h4>' + name + '</h4>' +
          '<p>' + desc + (moq ? ' &middot; MOQ: ' + moq : '') + '</p>' +
        '</div>' +
      '</div></a>';
  }

  // Initialize a category page: load products from API and render to grid
  // category: e.g. 'Bags', 'Drinkware', 'Plush & Mascots'
  // gridId: the ID of the grid container (default: 'featuredGrid')
  // cardClassPrefix: CSS class prefix (e.g. 'bags', 'dw', 'plush')
  async function initPage(category, gridId, cardClassPrefix) {
    const grid = document.getElementById(gridId || 'featuredGrid');
    if (!grid) {
      console.error('Grid not found:', gridId);
      return;
    }

    try {
      let url = BASE_URL + '/api/products';
      if (category) url += '?category=' + encodeURIComponent(category);
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load products');
      const data = await res.json();
      const products = data.products || [];

      if (products.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#999;"><p>No products available yet.</p></div>';
        return;
      }

      grid.innerHTML = products.map(function(p) {
        return renderProductCard(p, cardClassPrefix);
      }).join('');
    } catch (err) {
      console.error('Error loading products:', err);
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#999;"><p>Unable to load products. Please try again later.</p></div>';
    }
  }

  // Expose to global scope
  window.API_CONFIG = {
    BASE_URL: BASE_URL,
    getDetailPageUrl: getDetailPageUrl,
    renderProductCard: renderProductCard,
    initPage: initPage
  };
})();
