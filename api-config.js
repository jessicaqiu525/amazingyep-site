// ============================================
// Amazing Yep - API Configuration
// All frontend pages share this single source of truth for API calls
// ============================================

(function() {
  const isLocalSite = ['127.0.0.1', 'localhost', '::1'].includes(window.location.hostname);
  const BASE_URL = isLocalSite
    ? window.location.origin
    : 'https://amazingyep-sitebackend.onrender.com';

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function(char) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
    });
  }

  // All products use the unified dynamic detail page
  // (no more static per-product pages — everything is product.html?id=X)

  // Sample placeholder products (used to fill up to 12 cards)
  const SAMPLE_PRODUCTS = {
    'Bags': [
      { name: 'Canvas Tote Bag', img: '../assets/tote-canvas.png', moq: '100 pcs' },
      { name: 'Colorful Tote', img: '../assets/tote-yellow.png', moq: '100 pcs' },
      { name: 'Blue Canvas Tote', img: '../assets/tote-blue.png', moq: '150 pcs' },
      { name: 'Multi-Color Tote', img: '../assets/tote-colors.jpg', moq: '100 pcs' },
      { name: 'Drawstring Backpack', img: '../assets/bags-hero-bg.jpg', moq: '200 pcs' },
      { name: 'Custom Printed Tote', img: '../assets/cat-bags.jpg', moq: '100 pcs' },
      { name: 'Gym Duffel Bag', img: '../assets/bags-hero-bg.jpg', moq: '150 pcs' },
      { name: 'Foldable Shopping Bag', img: '../assets/tote-canvas.png', moq: '200 pcs' },
      { name: 'Jute Shopping Bag', img: '../assets/tote-yellow.png', moq: '300 pcs' },
      { name: 'Laptop Tote Bag', img: '../assets/tote-blue.png', moq: '100 pcs' },
      { name: 'Wine Tote Bag', img: '../assets/bags-hero-bg.jpg', moq: '100 pcs' },
      { name: 'Beach Tote Bag', img: '../assets/cat-bags.jpg', moq: '200 pcs' }
    ],
    'Drinkware': [
      { name: 'Custom Mug', img: '../assets/drinkware-hero-bg.jpg', moq: '100 pcs' },
      { name: 'Stainless Steel Tumbler', img: '../assets/drinkware-hero-bg.jpg', moq: '150 pcs' },
      { name: 'Ceramic Coffee Cup', img: '../assets/drinkware-hero-bg.jpg', moq: '100 pcs' },
      { name: 'Insulated Water Bottle', img: '../assets/drinkware-hero-bg.jpg', moq: '200 pcs' },
      { name: 'Glass Water Bottle', img: '../assets/drinkware-hero-bg.jpg', moq: '150 pcs' },
      { name: 'Plastic Sports Bottle', img: '../assets/drinkware-hero-bg.jpg', moq: '300 pcs' },
      { name: 'Vacuum Flask', img: '../assets/drinkware-hero-bg.jpg', moq: '100 pcs' },
      { name: 'Beer Mug', img: '../assets/drinkware-hero-bg.jpg', moq: '200 pcs' },
      { name: 'Wine Glass Set', img: '../assets/drinkware-hero-bg.jpg', moq: '250 pcs' },
      { name: 'Travel Mug', img: '../assets/drinkware-hero-bg.jpg', moq: '150 pcs' },
      { name: 'Tea Tumbler', img: '../assets/drinkware-hero-bg.jpg', moq: '100 pcs' },
      { name: 'Promotional Bottle', img: '../assets/drinkware-hero-bg.jpg', moq: '200 pcs' }
    ],
    'Plush & Mascots': [
      { name: 'Custom Plush Bear', img: '../assets/cat-plush.jpg', moq: '100 pcs' },
      { name: 'Mascot Character', img: '../assets/cat-plush.jpg', moq: '200 pcs' },
      { name: 'Animal Plush Toy', img: '../assets/cat-plush.jpg', moq: '150 pcs' },
      { name: 'Brand Mascot', img: '../assets/cat-plush.jpg', moq: '300 pcs' },
      { name: 'Plush Keychain', img: '../assets/cat-plush.jpg', moq: '100 pcs' },
      { name: 'Custom Soft Toy', img: '../assets/cat-plush.jpg', moq: '200 pcs' },
      { name: 'Promotional Plush', img: '../assets/cat-plush.jpg', moq: '150 pcs' },
      { name: 'Event Mascot', img: '../assets/cat-plush.jpg', moq: '250 pcs' },
      { name: 'Mini Plush Toy', img: '../assets/cat-plush.jpg', moq: '100 pcs' },
      { name: 'Corporate Mascot', img: '../assets/cat-plush.jpg', moq: '300 pcs' },
      { name: 'Plush Backpack Clip', img: '../assets/cat-plush.jpg', moq: '150 pcs' },
      { name: 'Stuffed Animal', img: '../assets/cat-plush.jpg', moq: '200 pcs' }
    ],
    'Keychains & Accessories': [
      { name: 'Metal Keychain', img: '../assets/cat-keychain.jpg', moq: '100 pcs' },
      { name: 'PVC Rubber Keychain', img: '../assets/cat-keychain.jpg', moq: '200 pcs' },
      { name: 'Leather Keychain', img: '../assets/cat-keychain.jpg', moq: '150 pcs' },
      { name: 'Bottle Opener Keychain', img: '../assets/cat-keychain.jpg', moq: '300 pcs' },
      { name: 'LED Keychain Light', img: '../assets/cat-keychain.jpg', moq: '100 pcs' },
      { name: 'Woven Keychain', img: '../assets/cat-keychain.jpg', moq: '200 pcs' },
      { name: 'Custom Shape Keychain', img: '../assets/cat-keychain.jpg', moq: '150 pcs' },
      { name: 'Keychain Flashlight', img: '../assets/cat-keychain.jpg', moq: '250 pcs' },
      { name: 'Promotional Keychain', img: '../assets/cat-keychain.jpg', moq: '100 pcs' },
      { name: 'Keychain with Compass', img: '../assets/cat-keychain.jpg', moq: '300 pcs' },
      { name: 'Photo Keychain', img: '../assets/cat-keychain.jpg', moq: '150 pcs' },
      { name: 'Lanyard Keychain', img: '../assets/cat-keychain.jpg', moq: '200 pcs' }
    ],
    'Office & Stationery': [
      { name: 'Custom Notebook', img: '../assets/hero-image.jpg', moq: '100 pcs' },
      { name: 'Ballpoint Pen', img: '../assets/hero-image.jpg', moq: '500 pcs' },
      { name: 'Desk Organizer', img: '../assets/hero-image.jpg', moq: '200 pcs' },
      { name: 'Sticky Notes', img: '../assets/hero-image.jpg', moq: '300 pcs' },
      { name: 'Pen Holder', img: '../assets/hero-image.jpg', moq: '150 pcs' },
      { name: 'Custom Sticky Notes', img: '../assets/hero-image.jpg', moq: '500 pcs' },
      { name: 'Desk Calendar', img: '../assets/hero-image.jpg', moq: '200 pcs' },
      { name: 'Highlighter Set', img: '../assets/hero-image.jpg', moq: '300 pcs' },
      { name: 'Custom Clipboard', img: '../assets/hero-image.jpg', moq: '150 pcs' },
      { name: 'Stapler & Staples', img: '../assets/hero-image.jpg', moq: '200 pcs' },
      { name: 'Tape Dispenser', img: '../assets/hero-image.jpg', moq: '250 pcs' },
      { name: 'Custom Ruler', img: '../assets/hero-image.jpg', moq: '300 pcs' }
    ],
    'Outdoor & Leisure': [
      { name: 'Picnic Mat', img: '../assets/hero-banner.jpg', moq: '100 pcs' },
      { name: 'Camping Mug', img: '../assets/hero-banner.jpg', moq: '200 pcs' },
      { name: 'Outdoor Blanket', img: '../assets/hero-banner.jpg', moq: '150 pcs' },
      { name: 'Portable Chair', img: '../assets/hero-banner.jpg', moq: '300 pcs' },
      { name: 'Cooler Bag', img: '../assets/hero-banner.jpg', moq: '100 pcs' },
      { name: 'Travel Pillow', img: '../assets/hero-banner.jpg', moq: '200 pcs' },
      { name: 'Beach Umbrella', img: '../assets/hero-banner.jpg', moq: '150 pcs' },
      { name: 'Outdoor Water Bottle', img: '../assets/hero-banner.jpg', moq: '250 pcs' },
      { name: 'Camping Lantern', img: '../assets/hero-banner.jpg', moq: '200 pcs' },
      { name: 'Portable Grill', img: '../assets/hero-banner.jpg', moq: '100 pcs' },
      { name: 'Hiking Backpack', img: '../assets/hero-banner.jpg', moq: '150 pcs' },
      { name: 'Outdoor Mat', img: '../assets/hero-banner.jpg', moq: '200 pcs' }
    ],
    'Technology': [
      { name: 'Custom USB Drive', img: '../assets/hero-image.jpg', moq: '100 pcs' },
      { name: 'Power Bank', img: '../assets/hero-image.jpg', moq: '150 pcs' },
      { name: 'Wireless Charger', img: '../assets/hero-image.jpg', moq: '200 pcs' },
      { name: 'Bluetooth Speaker', img: '../assets/hero-image.jpg', moq: '100 pcs' },
      { name: 'Phone Stand', img: '../assets/hero-image.jpg', moq: '300 pcs' },
      { name: 'Custom Earbuds', img: '../assets/hero-image.jpg', moq: '200 pcs' },
      { name: 'Laptop Sleeve', img: '../assets/hero-image.jpg', moq: '150 pcs' },
      { name: 'Mouse Pad', img: '../assets/hero-image.jpg', moq: '250 pcs' },
      { name: 'Webcam Cover', img: '../assets/hero-image.jpg', moq: '500 pcs' },
      { name: 'Cable Organizer', img: '../assets/hero-image.jpg', moq: '300 pcs' },
      { name: 'Phone Holder', img: '../assets/hero-image.jpg', moq: '200 pcs' },
      { name: 'Custom Tablet Stand', img: '../assets/hero-image.jpg', moq: '150 pcs' }
    ],
    'Trade Show': [
      { name: 'Lanyard with ID', img: '../assets/hero-banner.jpg', moq: '100 pcs' },
      { name: 'Trade Show Bag', img: '../assets/hero-banner.jpg', moq: '200 pcs' },
      { name: 'Badge Holder', img: '../assets/hero-banner.jpg', moq: '500 pcs' },
      { name: 'Promotional Pen', img: '../assets/hero-banner.jpg', moq: '1000 pcs' },
      { name: 'Table Cover', img: '../assets/hero-banner.jpg', moq: '50 pcs' },
      { name: 'Pop-up Banner', img: '../assets/hero-banner.jpg', moq: '10 pcs' },
      { name: 'Flyer Handout', img: '../assets/hero-banner.jpg', moq: '500 pcs' },
      { name: 'Trade Show Tote', img: '../assets/hero-banner.jpg', moq: '150 pcs' },
      { name: 'Custom Notepad', img: '../assets/hero-banner.jpg', moq: '200 pcs' },
      { name: 'Keychain Giveaway', img: '../assets/hero-banner.jpg', moq: '300 pcs' },
      { name: 'Water Bottle Promo', img: '../assets/hero-banner.jpg', moq: '100 pcs' },
      { name: 'Tradeshow Lanyard', img: '../assets/hero-banner.jpg', moq: '200 pcs' }
    ],
    'Gifts & Seasonal': [
      { name: 'Holiday Decoration', img: '../assets/hero-banner.jpg', moq: '100 pcs' },
      { name: 'Custom Ornament', img: '../assets/hero-banner.jpg', moq: '100 pcs' },
      { name: 'Gift Wrapping Paper', img: '../assets/hero-banner.jpg', moq: '500 pcs' },
      { name: 'Gift Bag', img: '../assets/hero-banner.jpg', moq: '250 pcs' },
      { name: 'Gift Box', img: '../assets/hero-banner.jpg', moq: '250 pcs' }
    ],
    'Games & Activities': [
      { name: 'Custom Jigsaw Puzzle', img: '../assets/collections-hero-complete-2026.png', moq: '100 pcs' },
      { name: 'Custom Board Game', img: '../assets/collections-hero-complete-2026.png', moq: '100 pcs' },
      { name: 'Branded Playing Cards', img: '../assets/collections-hero-complete-2026.png', moq: '250 pcs' },
      { name: 'Educational Game', img: '../assets/collections-hero-complete-2026.png', moq: '100 pcs' },
      { name: 'Custom Activity Kit', img: '../assets/collections-hero-complete-2026.png', moq: '100 pcs' }
    ],
    'Wearables': [
      { name: 'Custom T-Shirt', img: '../assets/hero-image.jpg', moq: '100 pcs' },
      { name: 'Embroidered Hat', img: '../assets/hero-image.jpg', moq: '150 pcs' },
      { name: 'Polo Shirt', img: '../assets/hero-image.jpg', moq: '200 pcs' },
      { name: 'Hoodie', img: '../assets/hero-image.jpg', moq: '100 pcs' },
      { name: 'Beanie Hat', img: '../assets/hero-image.jpg', moq: '150 pcs' },
      { name: 'Apron', img: '../assets/hero-image.jpg', moq: '200 pcs' },
      { name: 'Button Badge', img: '../assets/hero-image.jpg', moq: '500 pcs' },
      { name: 'Wristband', img: '../assets/hero-image.jpg', moq: '300 pcs' },
      { name: 'Scarf', img: '../assets/hero-image.jpg', moq: '150 pcs' },
      { name: 'Socks', img: '../assets/hero-image.jpg', moq: '200 pcs' },
      { name: 'Tie', img: '../assets/hero-image.jpg', moq: '100 pcs' },
      { name: 'Face Mask', img: '../assets/hero-image.jpg', moq: '500 pcs' }
    ]
  };

  // Get detail page URL for a product — always use unified dynamic page
  function getDetailPageUrl(product) {
    return '../collections/product.html?id=' + product.id;
  }

  // Render a REAL product card from backend API
  function renderProductCard(product, cardClassPrefix) {
    // Safe URL resolver: don't prefix site-relative (../ or ./) paths
    function safeImg(src) {
      if (!src) return '';
      if (src.startsWith('http') || src.startsWith('data:')) return src;
      if (src.startsWith('../') || src.startsWith('./')) return src;
      return BASE_URL + src;
    }

    // Priority: images[0] > gallery[0] > colorOptions[0] > category fallback
    let img = '';
    if (product.images && product.images.length > 0) {
      img = safeImg(product.images[0]);
    }
    if (!img && product.gallery && product.gallery.length > 0) {
      img = safeImg(product.gallery[0]);
    }
    if (!img && product.colorOptions && product.colorOptions.length > 0 && product.colorOptions[0].image) {
      img = safeImg(product.colorOptions[0].image);
    }

    // Fallback category-specific defaults if still no image
    const cat = product.category || '';
    if (!img) {
      if (cat.includes('Bag')) img = '../assets/cat-bags.jpg';
      else if (cat.includes('Drink') || cat.includes('Tumbler') || cat.includes('Mug')) img = '../assets/drinkware-hero-bg.jpg';
      else if (cat.includes('Plush') || cat.includes('Mascot')) img = '../assets/cat-plush.jpg';
      else if (cat.includes('Keychain')) img = '../assets/cat-keychain.jpg';
      else img = '../assets/hero-image.jpg';
    }
    const name = product.name || 'Untitled Product';
    const sku = product.sku || '';
    const prices = (product.pricing || [])
      .map(function(row) { return Number(String(row.price || '').replace(/[^0-9.-]/g, '')); })
      .filter(function(price) { return Number.isFinite(price) && price > 0; });
    const priceRange = prices.length
      ? (function() {
          const min = Math.min.apply(null, prices);
          const max = Math.max.apply(null, prices);
          return min === max
            ? '$' + min.toFixed(2)
            : '$' + min.toFixed(2) + '-$' + max.toFixed(2);
        })()
      : (product.priceRange || '');

    const cardClass = cardClassPrefix + '-featured-card';
    const imgClass = cardClassPrefix + '-featured-card-img';
    const bodyClass = cardClassPrefix + '-featured-card-body';

    const link = getDetailPageUrl(product);

    return '<a href="' + link + '" style="display:block;text-decoration:none;color:inherit;border-radius:12px;overflow:hidden;">' +
      '<div class="' + cardClass + '" style="height:100%;">' +
        '<img class="' + imgClass + '" src="' + img + '" alt="' + name + '" onerror="this.src=\'../assets/tote-canvas.png\'">' +
        '<div class="' + bodyClass + '">' +
          '<h4>' + name + '</h4>' +
          (sku ? '<p style="font-size:12px;font-weight:700;color:var(--orange);margin-bottom:4px;">Item #: ' + sku + '</p>' : '') +
          '<p style="font-size:13px;font-weight:700;color:var(--navy);margin-top:8px;">' +
            (priceRange ? priceRange : '') +
          '</p>' +
        '</div>' +
      '</div></a>';
  }

  // Render a SAMPLE placeholder card
  function renderSampleCard(sample, cardClassPrefix) {
    const cardClass = cardClassPrefix + '-featured-card';
    const imgClass = cardClassPrefix + '-featured-card-img';
    const bodyClass = cardClassPrefix + '-featured-card-body';

    return '<div class="' + cardClass + '" style="height:100%;opacity:0.7;">' +
      '<img class="' + imgClass + '" src="' + sample.img + '" alt="' + sample.name + '">' +
      '<div class="' + bodyClass + '">' +
        '<h4>' + sample.name + '</h4>' +
        '<p>Sample product &middot; MOQ: ' + sample.moq + '</p>' +
      '</div>' +
    '</div>';
  }

  function renderRecommendationCard(product, cardClassPrefix) {
    const img = (product.images && product.images[0]) || product.mainImage || '../assets/hero-image.jpg';
    const name = escapeHtml(product.name || 'Custom Product');
    const sku = escapeHtml(product.sku || product.itemNumber || '');
    const link = getDetailPageUrl(product);
    return '<a href="' + link + '" style="display:flex;height:100%;min-width:0;text-decoration:none;color:inherit;">' +
      '<div class="' + cardClassPrefix + '-carousel-card" style="width:100%;height:100%;display:flex;flex-direction:column;">' +
        '<img class="' + cardClassPrefix + '-carousel-card-img" src="' + escapeHtml(img) + '" alt="' + name + '">' +
        '<div class="' + cardClassPrefix + '-carousel-card-body" style="display:flex;flex:1;flex-direction:column;">' +
          '<h4 title="' + name + '" style="min-height:4.2em;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;">' + name + '</h4>' +
          (sku ? '<p style="margin-top:auto;">Item #: ' + sku + '</p>' : '') +
        '</div>' +
      '</div></a>';
  }

  function productMatchesType(product, selectedType) {
    if (!selectedType) return true;

    const stopWords = new Set([
      'and', 'the', 'bags', 'bag', 'accessories', 'accessory', 'gear',
      'equipment', 'products', 'product', 'custom', 'keychain', 'keychains'
    ]);
    function tokens(value) {
      return String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
        .split(/\s+/)
        .filter(function(token) {
          return token && !stopWords.has(token);
        })
        .map(function(token) {
          return token.endsWith('s') && token.length > 3 ? token.slice(0, -1) : token;
        });
    }

    const selectedTypes = String(selectedType).split('|').map(function(type) {
      return type.trim();
    }).filter(Boolean);
    const selectedTokenGroups = selectedTypes.map(tokens);
    const selectedTokens = selectedTokenGroups.flat();
    if (!selectedTokens.length) return false;

    if (product.websiteProductType) {
      const productTypeTokens = tokens(product.websiteProductType).join(' ');
      return selectedTokenGroups.some(function(group) {
        return group.join(' ') === productTypeTokens;
      });
    }

    function fieldMatches(value) {
      const fieldTokens = tokens(value);
      return selectedTokens.some(function(token) {
        return fieldTokens.includes(token);
      });
    }

    // Treat the product's identity fields as stronger evidence than the optional
    // website subcategory. Imported catalogs occasionally contain a stale or
    // incorrect subcategory (for example a Tote marked "Cooler Bags"). A lone
    // subcategory match must not override the product name, keywords, or formal
    // SAGE category, while correctly classified products continue to match.
    let score = 0;
    if (fieldMatches(product.name)) score += 5;
    if (fieldMatches(product.keywords)) score += 4;
    if (fieldMatches(product.sageCategory1) || fieldMatches(product.sageCategory2)) score += 3;
    if (fieldMatches(product.subcategory)) score += 2;

    return score >= 3;
  }

  // Initialize a category page with 12 products per page.
  // category: e.g. 'Bags', 'Drinkware'
  // gridId: the ID of the grid container (default: 'featuredGrid')
  // cardClassPrefix: CSS class prefix (e.g. 'bags', 'dw', 'plush')
  async function initPage(category, gridId, cardClassPrefix) {
    const grid = document.getElementById(gridId || 'featuredGrid');
    if (!grid) {
      console.error('Grid not found:', gridId);
      return;
    }

    const apiCategory = category;
    const samples = (SAMPLE_PRODUCTS[category] || []).slice(0, 12);
    let typeItems = Array.from(document.querySelectorAll('.' + cardClassPrefix + '-type-item'));

    // Every collection starts with a consistent way to clear the type filter.
    // Older pages omitted this chip, which made returning to the full catalog
    // unnecessarily difficult after selecting a type.
    if (typeItems.length && !typeItems.some(function(item) {
      return /^all products$/i.test(item.textContent.trim());
    })) {
      const allProductsItem = document.createElement('span');
      allProductsItem.className = cardClassPrefix + '-type-item';
      allProductsItem.textContent = 'All Products';
      typeItems[0].parentElement.insertBefore(allProductsItem, typeItems[0]);
      typeItems = Array.from(document.querySelectorAll('.' + cardClassPrefix + '-type-item'));
    }

    // No Product Type filter is selected until the visitor clicks one.
    typeItems.forEach(function(item) {
      item.classList.remove('active');
    });

    try {
      let url = BASE_URL + '/api/products';
      if (apiCategory) url += '?category=' + encodeURIComponent(apiCategory);
      const responses = await Promise.all([
        fetch(url),
        apiCategory ? fetch(BASE_URL + '/api/products') : Promise.resolve(null)
      ]);
      const res = responses[0];
      if (!res.ok) throw new Error('Failed to load products');
      const data = await res.json();
      // Defensively enforce the page category on the client too. The API
      // normally filters this response, but older stored category values or a
      // cached backend response must never leak products into the wrong page.
      const products = (data.products || []).filter(function(product) {
        return !apiCategory
          || String(product.category || '').trim().toLowerCase() === apiCategory.toLowerCase();
      });
      let allProducts = products;
      if (responses[1] && responses[1].ok) {
        const allData = await responses[1].json();
        allProducts = allData.products || products;
      }
      const recommendationTrack = document.querySelector('.' + cardClassPrefix + '-carousel-track');
      const recommendationPagination = document.querySelector('.' + cardClassPrefix + '-carousel-pagination');
      const recommendationPageSize = 5;
      const featuredPageSize = 12;
      let featuredPage = 0;
      let selectedProductType = '';
      let featuredSearchQuery = '';
      let recommendationProducts = [];
      let recommendationPage = 0;
      const featuredPagination = document.createElement('nav');
      featuredPagination.className = cardClassPrefix + '-featured-pagination';
      featuredPagination.setAttribute('aria-label', category + ' product pages');
      featuredPagination.style.cssText = 'display:none;align-items:center;justify-content:center;gap:14px;margin:28px auto 4px;padding:0 32px;';
      grid.insertAdjacentElement('afterend', featuredPagination);
      if (recommendationTrack) {
        recommendationTrack.style.display = 'grid';
        recommendationTrack.style.gridTemplateColumns = 'repeat(5, minmax(180px, 1fr))';
        recommendationTrack.style.alignItems = 'stretch';
      }

      function drawRecommendationPage() {
        if (!recommendationTrack) return;
        const pageCount = Math.max(1, Math.ceil(recommendationProducts.length / recommendationPageSize));
        recommendationPage = Math.max(0, Math.min(recommendationPage, pageCount - 1));
        const pageProducts = recommendationProducts.slice(
          recommendationPage * recommendationPageSize,
          (recommendationPage + 1) * recommendationPageSize
        );
        recommendationTrack.innerHTML = pageProducts.length
          ? pageProducts.map(function(product) { return renderRecommendationCard(product, cardClassPrefix); }).join('')
          : '<p style="color:#667085;">More custom product ideas are available on request.</p>';

        if (recommendationPagination) {
          drawJumpPagination(recommendationPagination, recommendationPage, pageCount, function(page) {
            recommendationPage = page;
            drawRecommendationPage();
          }, 'recommendation');
        }
      }

      // Add backend-derived product types that are not yet represented by a
      // hard-coded chip. New catalog types therefore become filterable without
      // editing every category page by hand.
      if (typeItems.length) {
        const typeContainer = typeItems[0].parentElement;
        const existingTypes = new Set();
        typeItems.forEach(function(item) {
          existingTypes.add(item.textContent.trim().toLowerCase());
          if (item.dataset.productType) {
            existingTypes.add(item.dataset.productType.trim().toLowerCase());
          }
          if (item.dataset.productTypes) {
            item.dataset.productTypes.split('|').forEach(function(type) {
              existingTypes.add(type.trim().toLowerCase());
            });
          }
        });
        products.forEach(function(product) {
          const productType = String(product.websiteProductType || '').trim();
          if (!productType || existingTypes.has(productType.toLowerCase())) return;
          const item = document.createElement('span');
          item.className = cardClassPrefix + '-type-item';
          item.textContent = productType;
          typeContainer.appendChild(item);
          existingTypes.add(productType.toLowerCase());
        });
        typeItems = Array.from(document.querySelectorAll('.' + cardClassPrefix + '-type-item'));
        typeItems.sort(function(a, b) {
          const aLabel = a.textContent.trim();
          const bLabel = b.textContent.trim();
          if (/^all (products|collections)$/i.test(aLabel)) return -1;
          if (/^all (products|collections)$/i.test(bLabel)) return 1;
          return aLabel.localeCompare(bLabel, 'en', { sensitivity: 'base' });
        }).forEach(function(item) {
          typeContainer.appendChild(item);
        });
      }

      function drawFeaturedPagination(pageCount) {
        if (pageCount <= 1) {
          featuredPagination.style.display = 'none';
          featuredPagination.innerHTML = '';
          return;
        }
        drawJumpPagination(featuredPagination, featuredPage, pageCount, function(page) {
          featuredPage = page;
          renderProducts();
          scrollFeaturedIntoView();
        }, 'featured');
      }

      function visiblePageNumbers(current, pageCount) {
        const pages = new Set([0, pageCount - 1, current - 2, current - 1, current, current + 1, current + 2]);
        return Array.from(pages).filter(function(page) { return page >= 0 && page < pageCount; }).sort(function(a, b) { return a - b; });
      }

      function drawJumpPagination(container, current, pageCount, onGo, key) {
        if (!container) return;
        if (pageCount <= 1) {
          container.style.display = 'none';
          return;
        }
        container.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;margin:28px auto 4px;padding:0 24px;';
        const pages = visiblePageNumbers(current, pageCount);
        let last = -1;
        let buttons = '';
        pages.forEach(function(page) {
          if (last >= 0 && page - last > 1) buttons += '<span aria-hidden="true" style="padding:0 4px;">…</span>';
          buttons += '<button type="button" data-' + key + '-page="' + page + '" aria-label="Page ' + (page + 1) + '"' +
            (page === current ? ' aria-current="page"' : '') + ' style="min-width:42px;height:42px;padding:0 12px;border:1px solid ' +
            (page === current ? '#ff5a1f' : '#d0d5dd') + ';border-radius:8px;background:' + (page === current ? '#ff5a1f' : '#fff') +
            ';color:' + (page === current ? '#fff' : '#082a4a') + ';font-weight:700;cursor:pointer;">' + (page + 1) + '</button>';
          last = page;
        });
        container.innerHTML = buttons + '<span style="margin-left:10px;color:#667085;">Go to</span>' +
          '<input type="number" min="1" max="' + pageCount + '" value="' + (current + 1) + '" data-' + key + '-jump aria-label="Go to page" style="width:72px;height:42px;border:1px solid #d0d5dd;border-radius:8px;padding:0 10px;text-align:center;font:inherit;">' +
          '<button type="button" data-' + key + '-go style="height:42px;padding:0 18px;border:0;border-radius:8px;background:#082a4a;color:#fff;font-weight:700;cursor:pointer;">Go</button>';
        container.querySelectorAll('[data-' + key + '-page]').forEach(function(button) {
          button.onclick = function() { onGo(Number(button.getAttribute('data-' + key + '-page'))); };
        });
        const input = container.querySelector('[data-' + key + '-jump]');
        const go = container.querySelector('[data-' + key + '-go]');
        function jump() {
          const page = Math.max(1, Math.min(pageCount, Number(input.value) || 1));
          input.value = page;
          onGo(page - 1);
        }
        go.onclick = jump;
        input.onkeydown = function(event) { if (event.key === 'Enter') jump(); };
      }

      function productMatchesSearch(product, query) {
        if (!query) return true;
        return [
          product.name,
          product.sku,
          product.itemNumber,
          product.websiteProductType,
          product.description,
          ...listValue(product.keywords)
        ].filter(Boolean).join(' ').toLowerCase().includes(query);
      }

      function scrollFeaturedIntoView() {
        const featuredSection = grid.closest('section') || grid;
        const nav = document.querySelector('.nav');
        const navHeight = nav ? nav.getBoundingClientRect().height : 0;
        const top = window.scrollY + featuredSection.getBoundingClientRect().top - navHeight - 20;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      }

      function renderProducts() {
        let filteredProducts = selectedProductType
          ? products.filter(function(product) {
              return productMatchesType(product, selectedProductType);
            })
          : products;
        filteredProducts = filteredProducts.filter(function(product) {
          return productMatchesSearch(product, featuredSearchQuery);
        });

        // Product Type filters show matching backend products only. The unfiltered
        // view continues to use samples to keep the existing 12-card layout.
        if ((selectedProductType || featuredSearchQuery) && !filteredProducts.length) {
          const safeType = escapeHtml(selectedProductType || featuredSearchQuery);
          const safeCategory = escapeHtml(category);
          grid.innerHTML = '<div style="grid-column:1/-1;padding:34px;border:1px solid #e4e7ec;border-radius:16px;background:#fffaf7;">' +
            '<h3 style="margin:0 0 10px;color:#082a4a;font-size:24px;">Looking for custom ' + safeType + '?</h3>' +
            '<p style="margin:0 0 22px;color:#667085;line-height:1.6;">We can source it for you. Tell us your quantity, artwork, and deadline—we’ll recommend the best options.</p>' +
            '<a href="../contact/index.html" style="display:inline-block;padding:12px 20px;border-radius:28px;background:#ff5a1f;color:#fff;text-decoration:none;font-weight:700;margin-right:10px;">Start a Project</a>' +
            (products.length ? '<button type="button" data-view-available style="padding:11px 20px;border-radius:28px;border:1px solid #082a4a;background:#fff;color:#082a4a;font-weight:700;cursor:pointer;">View Available ' + safeCategory + '</button>' : '') +
          '</div>';
          const viewAvailable = grid.querySelector('[data-view-available]');
          if (viewAvailable) {
            viewAvailable.addEventListener('click', function() {
              typeItems.forEach(function(item) { item.classList.remove('active'); });
              selectedProductType = '';
              featuredSearchQuery = '';
              const searchInput = document.getElementById('searchInput');
              if (searchInput) searchInput.value = '';
              featuredPage = 0;
              renderProducts();
            });
          }
          drawFeaturedPagination(1);
        } else {
          let html = '';
          const pageCount = Math.max(1, Math.ceil(filteredProducts.length / featuredPageSize));
          featuredPage = Math.min(featuredPage, pageCount - 1);
          const pageStart = featuredPage * featuredPageSize;
          const realToShow = filteredProducts.slice(pageStart, pageStart + featuredPageSize);
          realToShow.forEach(function(p) {
            html += renderProductCard(p, cardClassPrefix);
          });

          if (!selectedProductType && !featuredSearchQuery && featuredPage === 0) {
            const remaining = featuredPageSize - realToShow.length;
            if (remaining > 0) {
              samples.slice(0, remaining).forEach(function(s) {
                html += renderSampleCard(s, cardClassPrefix);
              });
            }
          }

          grid.innerHTML = html;
          drawFeaturedPagination(pageCount);
        }

        if (recommendationTrack) {
          const visibleIds = new Set(filteredProducts.map(function(product) {
            return String(product.id || product.sku || '');
          }));
          const categoryIds = new Set(products.map(function(product) {
            return String(product.id || product.sku || '');
          }));
          const sameCategory = products.filter(function(product) {
            return !visibleIds.has(String(product.id || product.sku || ''));
          });
          recommendationProducts = sameCategory.concat(allProducts.filter(function(product) {
            const id = String(product.id || product.sku || '');
            return !categoryIds.has(id) && !visibleIds.has(id);
          }));
          recommendationPage = 0;
          drawRecommendationPage();
        }
      }

      renderProducts();

      const featuredSearchInput = document.getElementById('searchInput');
      if (featuredSearchInput) {
        featuredSearchInput.addEventListener('input', function() {
          featuredSearchQuery = String(featuredSearchInput.value || '').trim().toLowerCase();
          featuredPage = 0;
          renderProducts();
        });
      }

      typeItems.forEach(function(item) {
        item.addEventListener('click', function() {
          typeItems.forEach(function(other) {
            other.classList.remove('active');
          });
          item.classList.add('active');
          selectedProductType = /^all products$/i.test(item.textContent.trim())
            ? ''
            : (item.dataset.productTypes || item.dataset.productType || item.textContent.trim());
          featuredPage = 0;
          renderProducts();
        });
      });

    } catch (err) {
      console.error('Error loading products:', err);
      // On error, show all 12 sample cards
      grid.innerHTML = samples.map(function(s) {
        return renderSampleCard(s, cardClassPrefix);
      }).join('');
    }
  }

  // Expose to global scope
  window.API_CONFIG = {
    BASE_URL: BASE_URL,
    getDetailPageUrl: getDetailPageUrl,
    renderProductCard: renderProductCard,
    productMatchesType: productMatchesType,
    initPage: initPage
  };
})();
