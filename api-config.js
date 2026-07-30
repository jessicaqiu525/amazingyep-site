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
    return '<a href="' + link + '" style="display:block;text-decoration:none;color:inherit;">' +
      '<div class="' + cardClassPrefix + '-carousel-card">' +
        '<img class="' + cardClassPrefix + '-carousel-card-img" src="' + escapeHtml(img) + '" alt="' + name + '">' +
        '<div class="' + cardClassPrefix + '-carousel-card-body">' +
          '<h4>' + name + '</h4>' +
          (sku ? '<p>Item #: ' + sku + '</p>' : '') +
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

    const selectedTokens = tokens(selectedType);
    if (!selectedTokens.length) return false;

    if (product.websiteProductType) {
      return tokens(product.websiteProductType).join(' ') === selectedTokens.join(' ');
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

    const apiCategory = category;
    const samples = (SAMPLE_PRODUCTS[category] || []).slice(0, 12);
    let typeItems = Array.from(document.querySelectorAll('.' + cardClassPrefix + '-type-item'));

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
      const products = data.products || [];
      let allProducts = products;
      if (responses[1] && responses[1].ok) {
        const allData = await responses[1].json();
        allProducts = allData.products || products;
      }
      const recommendationTrack = document.querySelector('.' + cardClassPrefix + '-carousel-track');

      // Add backend-derived product types that are not yet represented by a
      // hard-coded chip. New catalog types therefore become filterable without
      // editing every category page by hand.
      if (typeItems.length) {
        const typeContainer = typeItems[0].parentElement;
        const existingTypes = new Set(typeItems.map(function(item) {
          return item.textContent.trim().toLowerCase();
        }));
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
      }

      function renderProducts(selectedType) {
        const filteredProducts = selectedType
          ? products.filter(function(product) {
              return productMatchesType(product, selectedType);
            })
          : products;

        // Product Type filters show matching backend products only. The unfiltered
        // view continues to use samples to keep the existing 12-card layout.
        if (selectedType && !filteredProducts.length) {
          const safeType = escapeHtml(selectedType);
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
              renderProducts('');
            });
          }
        } else {
          let html = '';
          const realToShow = filteredProducts.slice(0, 12);
          realToShow.forEach(function(p) {
            html += renderProductCard(p, cardClassPrefix);
          });

          if (!selectedType) {
            const remaining = 12 - realToShow.length;
            if (remaining > 0) {
              samples.slice(0, remaining).forEach(function(s) {
                html += renderSampleCard(s, cardClassPrefix);
              });
            }
          }

          grid.innerHTML = html;
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
          const related = sameCategory.concat(allProducts.filter(function(product) {
            const id = String(product.id || product.sku || '');
            return !categoryIds.has(id) && !visibleIds.has(id);
          })).slice(0, 8);
          recommendationTrack.innerHTML = related.length
            ? related.map(function(product) { return renderRecommendationCard(product, cardClassPrefix); }).join('')
            : '<p style="color:#667085;">More custom product ideas are available on request.</p>';
        }
      }

      renderProducts('');

      typeItems.forEach(function(item) {
        item.addEventListener('click', function() {
          typeItems.forEach(function(other) {
            other.classList.remove('active');
          });
          item.classList.add('active');
          renderProducts(item.textContent.trim());
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
