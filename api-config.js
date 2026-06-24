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

  // Get detail page URL for a product
  function getDetailPageUrl(product) {
    if (DETAIL_PAGE_MAP[product.sku]) {
      return DETAIL_PAGE_MAP[product.sku];
    }
    return '../collections/product.html?id=' + product.id;
  }

  // Render a REAL product card from backend API
  function renderProductCard(product, cardClassPrefix) {
    // Determine image: try images[] first, then gallery[], then fallback
    let img = '../assets/tote-canvas.png'; // default fallback (always exists)
    if (product.images && product.images.length > 0) {
      const src = product.images[0];
      img = src.startsWith('http') ? src : BASE_URL + src;
    } else if (product.gallery && product.gallery.length > 0) {
      img = product.gallery[0];
    }
    // Fallback category-specific defaults for blank products
    const cat = product.category || '';
    if (!product.images || product.images.length === 0) {
      if (cat.includes('Bag')) img = '../assets/cat-bags.jpg';
      else if (cat.includes('Drink') || cat.includes('Tumbler') || cat.includes('Mug')) img = '../assets/drinkware-hero-bg.jpg';
      else if (cat.includes('Plush') || cat.includes('Mascot')) img = '../assets/cat-plush.jpg';
      else if (cat.includes('Keychain')) img = '../assets/cat-keychain.jpg';
      else if (cat.includes('Outdoor') || cat.includes('Leisure')) img = '../assets/hero-banner.jpg';
      else if (cat.includes('Office') || cat.includes('Stationery')) img = '../assets/hero-image.jpg';
      else if (cat.includes('Technology')) img = '../assets/hero-image.jpg';
      else if (cat.includes('Trade Show') || cat.includes('Tradeshow')) img = '../assets/hero-banner.jpg';
      else if (cat.includes('Wearable') || cat.includes('T-Shirt') || cat.includes('Apparel')) img = '../assets/hero-image.jpg';
    }
    const name = product.name || 'Untitled Product';
    const moq = product.moq || '';
    const desc = product.description ? product.description.substring(0, 60) + '...' : '';

    const cardClass = cardClassPrefix + '-featured-card';
    const imgClass = cardClassPrefix + '-featured-card-img';
    const bodyClass = cardClassPrefix + '-featured-card-body';

    const link = getDetailPageUrl(product);

    return '<a href="' + link + '" style="display:block;text-decoration:none;color:inherit;border-radius:12px;overflow:hidden;">' +
      '<div class="' + cardClass + '" style="height:100%;">' +
        '<img class="' + imgClass + '" src="' + img + '" alt="' + name + '" onerror="this.src=\'../assets/tote-canvas.png\'">' +
        '<div class="' + bodyClass + '">' +
          '<h4>' + name + '</h4>' +
          '<p>' + desc + (moq ? ' &middot; MOQ: ' + moq : '') + '</p>' +
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

  // Initialize a category page: always show 12 cards (real + samples)
  // category: e.g. 'Bags', 'Drinkware'
  // gridId: the ID of the grid container (default: 'featuredGrid')
  // cardClassPrefix: CSS class prefix (e.g. 'bags', 'dw', 'plush')
  async function initPage(category, gridId, cardClassPrefix) {
    const grid = document.getElementById(gridId || 'featuredGrid');
    if (!grid) {
      console.error('Grid not found:', gridId);
      return;
    }

    const samples = (SAMPLE_PRODUCTS[category] || []).slice(0, 12);

    try {
      let url = BASE_URL + '/api/products';
      if (category) url += '?category=' + encodeURIComponent(category);
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load products');
      const data = await res.json();
      const products = data.products || [];

      // Build HTML: real products first, then sample placeholders to fill 12
      let html = '';

      // Show up to 12 real products
      const realToShow = products.slice(0, 12);
      realToShow.forEach(function(p) {
        html += renderProductCard(p, cardClassPrefix);
      });

      // Fill remaining slots (up to 12 total) with samples
      const remaining = 12 - realToShow.length;
      if (remaining > 0) {
        samples.slice(0, remaining).forEach(function(s) {
          html += renderSampleCard(s, cardClassPrefix);
        });
      }

      grid.innerHTML = html;

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
    initPage: initPage
  };
})();
