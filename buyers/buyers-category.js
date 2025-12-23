document.addEventListener('DOMContentLoaded', function() {
  // Setup autocomplete for desktop search
  const topInput = document.getElementById('searchInput');
  const topAutocomplete = document.getElementById('searchAutocomplete');
  if (topInput && topAutocomplete) {
    setupAutocomplete(topInput, topAutocomplete, (suggestion) => {
      if (suggestion.type === 'product') {
        window.location.href = `product.html?id=${suggestion.id}`;
      } else if (suggestion.type === 'category') {
        window.location.href = `buyers-category.html?id=${suggestion.id}`;
      }
    });
  }

  // Setup autocomplete for mobile search
  const mobileInput = document.getElementById('searchInputMobile');
  const mobileAutocomplete = document.getElementById('searchAutocompleteMobile');
  if (mobileInput && mobileAutocomplete) {
    setupAutocomplete(mobileInput, mobileAutocomplete, (suggestion) => {
      if (suggestion.type === 'product') {
        window.location.href = `product.html?id=${suggestion.id}`;
      } else if (suggestion.type === 'category') {
        window.location.href = `buyers-category.html?id=${suggestion.id}`;
      }
    });
  }

  // Get category ID from URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const categoryId = urlParams.get('id');

  if (!categoryId) {
    document.getElementById('categoryTitle').textContent = 'Category Not Found';
    document.getElementById('noResults').style.display = 'block';
    return;
  }

  // Fetch products for this category
  fetchCategoryProducts(categoryId);

  async function fetchCategoryProducts(categoryId) {
    try {
      // Fetch category details
      const categoryRes = await fetch(`${CONFIG.API_BASE_URL}/categories/${categoryId}`);
      if (!categoryRes.ok) throw new Error('Category not found');
      const categoryData = await categoryRes.json();
      const categoryName = categoryData.data.name;

      // Update page title and heading
      document.title = `${categoryName} — MarketMix`;
      document.getElementById('categoryTitle').textContent = `${categoryName}`;

      // Fetch products for this category
      const productsRes = await fetch(`${CONFIG.API_BASE_URL}/categories/${categoryId}/products?limit=100`);
      if (!productsRes.ok) throw new Error('Failed to fetch products');
      const productsData = await productsRes.json();
      const products = productsData.data || [];

      const grid = document.getElementById('categoryProductsGrid');
      const noResults = document.getElementById('noResults');
      const resultsInfo = document.getElementById('resultsInfo');

      if (products.length === 0) {
        noResults.style.display = 'block';
        grid.innerHTML = '';
        resultsInfo.textContent = '';
      } else {
        noResults.style.display = 'none';
        resultsInfo.textContent = `Showing ${products.length} product(s)`;

        grid.innerHTML = products.map(product => `
          <div class="product-card" data-product-id="${product.id}" data-category="${categoryName.toLowerCase()}" data-name="${product.name}" data-price="${product.price}">
            <img src="${product.main_image_url || product.image || 'https://via.placeholder.com/300'}" alt="${product.name}">
            <div class="product-info">
              <div class="product-name">${product.name}</div>
              <div class="meta">
                <div class="price">$${parseFloat(product.price).toFixed(2)}</div>
              </div>
            </div>
            <button class="add-to-cart">Add to Cart</button>
          </div>
        `).join('');

        // Re-attach click handlers to new product cards
        attachProductCardHandlers();
        attachCartListeners();
      }
    } catch (error) {
      console.error('Error fetching category products:', error);
      document.getElementById('categoryTitle').textContent = 'Error Loading Category';
      document.getElementById('noResults').style.display = 'block';
      document.getElementById('noResults').textContent = 'Failed to load products. Please try again.';
    }
  }

  function attachProductCardHandlers() {
    document.querySelectorAll('#categoryProductsGrid .product-card').forEach((card) => {
      const productId = card.getAttribute('data-product-id');
      card.style.cursor = 'pointer';

      card.addEventListener('click', (e) => {
        if (e.target.closest('.add-to-cart')) return;
        window.location.href = `product.html?id=${productId}`;
      });
    });
  }

  // Attach cart listeners
  function attachCartListeners() {
    const addButtons = document.querySelectorAll('.add-to-cart') || [];
    addButtons.forEach(button => {
      button.onclick = null;
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = button.closest('.product-card');
        if (!card) return;
        const titleEl = card.querySelector('.product-name');
        const priceEl = card.querySelector('.price');
        const imgEl = card.querySelector('img');

        const name = titleEl ? titleEl.textContent.trim() : 'Product';
        let price = 0;
        if (priceEl) {
          const priceText = priceEl.textContent.replace(/[^0-9.,-]/g, '').replace(',', '.').trim();
          price = parseFloat(priceText) || 0;
        }
        const image = imgEl ? (imgEl.src || '') : '';

        const productId = card.dataset && card.dataset.productId ? card.dataset.productId : null;
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existing = cart.find(item => item.name === name);
        if (existing) {
          existing.quantity = (existing.quantity || 1) + 1;
        } else {
          cart.push({
            name,
            price,
            image,
            quantity: 1,
            productId
          });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        showToast(`${name} added to cart`);
      });
    });
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
      z-index: 10000;
      font-weight: 600;
      font-size: 14px;
      animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  // ===== LOAD BEST-SELLING PRODUCTS =====
  async function loadBestSellingProducts() {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/products?limit=20`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      const products = data.data || [];

      if (products.length === 0) {
        const grid = document.getElementById('bestSellingGrid');
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #999;">No products available</div>';
        return;
      }

      renderBestSellingProducts(products);
    } catch (error) {
      console.error('Error loading best-selling products:', error);
    }
  }

  function renderBestSellingProducts(products) {
    const grid = document.getElementById('bestSellingGrid');
    grid.innerHTML = products.map(p => `
      <div class="product-card" data-product-id="${p.id}" data-name="${p.name}" data-price="${p.price}" data-category="${(p.category || p.category_name || 'all').toLowerCase().trim()}">
        <img src="${p.image || p.main_image_url || 'https://via.placeholder.com/300'}" alt="${p.name}">
        <div class="product-info">
          <div class="product-name">${p.name}</div>
          <div class="meta">
            <div class="price">$${parseFloat(p.price).toFixed(2)}</div>
          </div>
        </div>
        <button class="add-to-cart">Add to Cart</button>
      </div>
    `).join('');

    attachBestSellingHandlers(products);
  }

  function attachBestSellingHandlers(products) {
    const cards = document.querySelectorAll('#bestSellingGrid .product-card');
    cards.forEach((card, idx) => {
      const productId = card.getAttribute('data-product-id');
      card.style.cursor = 'pointer';

      card.addEventListener('click', (e) => {
        if (e.target.closest('.add-to-cart')) return;
        window.location.href = `product.html?id=${productId}`;
      });
    });

    attachCartListeners();
  }

  // Load best-selling on page load
  loadBestSellingProducts();

  // ===== DYNAMICALLY LOAD FILTER BUTTONS FROM SUPABASE =====
  (function() {
    const filterContainer = document.getElementById('bestSellingFilterContainer');
    if (!filterContainer) return;

    async function fetchAndPopulateFilterButtons() {
      try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/categories`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        
        const result = await response.json();
        const categories = result.data || [];

        if (categories.length === 0) {
          // Keep only "All" button if no categories
          return;
        }

        // Generate filter buttons from categories
        const categoryButtons = categories.map(category => {
          return `<button class="filter-btn" data-category="${category.name.toLowerCase()}" data-section="best-selling">${category.name}</button>`;
        }).join('');

        // Append new buttons after the "All" button
        const allButton = filterContainer.querySelector('[data-category="all"]');
        if (allButton && allButton.nextSibling) {
          // Insert after the "All" button
          allButton.insertAdjacentHTML('afterend', categoryButtons);
        } else if (allButton) {
          // If "All" is the last element, append
          allButton.insertAdjacentHTML('afterend', categoryButtons);
        }

        // Re-attach filter button listeners to include new buttons
        attachFilterButtonListeners();
      } catch (error) {
        console.error('Error fetching categories for filter buttons:', error);
      }
    }

    fetchAndPopulateFilterButtons();
  })();

  // ===== FILTER BUTTONS FOR BEST-SELLING =====
  (function() {
    function normalizeCategoryRaw(input) {
      if (!input) return '';
      return String(input)
        .toLowerCase()
        .replace(/&nbsp;/g, ' ')
        .replace(/\s*&\s*/g, ' & ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    // Initialize filter button listeners on load
    attachFilterButtonListeners();

    function attachFilterButtonListeners() {
      const filterButtons = document.querySelectorAll('.filter-btn');

      filterButtons.forEach(btn => {
        btn.addEventListener('click', async function() {
          const rawCategory = this.dataset.category || '';
          const category = normalizeCategoryRaw(rawCategory);
          const section = this.dataset.section;

          document.querySelectorAll(`.${section}-filter .filter-btn`).forEach(b => b.classList.remove('active'));
          this.classList.add('active');

          const products = document.querySelectorAll(`.${section}-grid .product-card`);

          // Try to match existing products in the section first
          const matched = Array.from(products).filter(product => {
            const pcat = normalizeCategoryRaw(product.dataset.category || '');
            return category === 'all' || pcat === category;
          });

          // If no existing products match and a specific category was selected,
          // fetch more products from the API
          if (matched.length === 0 && category !== 'all') {
            try {
              const base = (window.CONFIG && CONFIG.API_BASE_URL) ? CONFIG.API_BASE_URL : 'https://marketmix-backend-production.up.railway.app/api';
              const resp = await fetch(`${base}/products?limit=200`);
              if (resp.ok) {
                const json = await resp.json();
                const items = json.data || [];
                const filtered = items.filter(it => normalizeCategoryRaw(it.category || it.category_name || '') === category);
                const grid = document.querySelector(`.${section}-grid`);
                if (grid) {
                  grid.innerHTML = filtered.length > 0 ? filtered.map(p => `
                    <div class="product-card" data-product-id="${p.id}" data-name="${p.name}" data-price="${p.price}" data-category="${category}">
                      <img src="${p.image || p.main_image_url || 'https://via.placeholder.com/300'}" alt="${p.name}">
                      <div class="product-info">
                        <div class="product-name">${p.name}</div>
                        <div class="meta">
                          <div class="price">$${parseFloat(p.price).toFixed(2)}</div>
                        </div>
                      </div>
                      <button class="add-to-cart">Add to Cart</button>
                    </div>
                  `).join('') : '<div style="grid-column: 1/-1; padding: 20px; color: #334155; text-align: center;">No products in this category</div>';
                  attachBestSellingHandlers(filtered);
                }
              }
            } catch (err) {
              console.error('Error fetching category products', err);
            }
            return;
          }

          // Otherwise show/hide existing DOM products
          products.forEach(product => {
            const productCategory = normalizeCategoryRaw(product.dataset.category || '');
            const shouldShow = category === 'all' || productCategory === category;
            if (shouldShow) {
              product.style.display = '';
              product.style.visibility = 'visible';
            } else {
              product.style.display = 'none';
              product.style.visibility = 'hidden';
            }
          });
        });
      });
    }  })();
});