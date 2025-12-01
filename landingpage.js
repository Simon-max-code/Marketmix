
    document.addEventListener('DOMContentLoaded', function() {
      
      // ===== HERO SLIDER =====
      (function() {
        const slides = document.querySelectorAll('.hero-slide');
        if (!slides || slides.length === 0) return;
        
        let currentIndex = 0;
        const interval = 4000;
        let isPaused = false;
        
        function showSlide(index) {
          slides.forEach(slide => slide.classList.remove('active'));
          slides[index].classList.add('active');
        }
        
        function nextSlide() {
          if (isPaused) return;
          currentIndex = (currentIndex + 1) % slides.length;
          showSlide(currentIndex);
        }
        
        let timer = setInterval(nextSlide, interval);
        
        const heroRight = document.querySelector('.hero-right');
        if (heroRight) {
          heroRight.addEventListener('mouseenter', () => isPaused = true);
          heroRight.addEventListener('mouseleave', () => isPaused = false);
        }
      })();

      // ===== SEARCH FUNCTIONALITY =====
      (function() {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        const searchResults = document.getElementById('searchResults');
        
        if (!searchInput || !searchResults) return;
        
        const allProducts = [];
        document.querySelectorAll('.product-card').forEach(card => {
          const name = card.dataset.name || card.querySelector('.product-name')?.textContent || '';
          const price = card.dataset.price || '';
          const category = card.dataset.category || '';
          if (name) {
            allProducts.push({ name, price, category, element: card });
          }
        });
        
        function performSearch(query) {
          if (!query.trim()) {
            searchResults.classList.remove('show');
            return;
          }
          
          const lowQuery = query.toLowerCase();
          const matches = allProducts.filter(p => 
            p.name.toLowerCase().includes(lowQuery) ||
            p.category.toLowerCase().includes(lowQuery)
          ).slice(0, 5);
          
          if (matches.length === 0) {
            searchResults.innerHTML = '<div class="no-results">No products found</div>';
          } else {
            searchResults.innerHTML = matches.map(p => 
              `<div class="search-result-item" data-name="${p.name}">
                <strong>${p.name}</strong> - ${p.price}
              </div>`
            ).join('');
          }
          
          searchResults.classList.add('show');
        }
        
        searchInput.addEventListener('input', (e) => {
          performSearch(e.target.value);
        });
        
        searchBtn.addEventListener('click', () => {
          performSearch(searchInput.value);
        });
        
        searchInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            performSearch(searchInput.value);
          }
        });
        
        document.addEventListener('click', (e) => {
          if (!e.target.closest('.search-wrap')) {
            searchResults.classList.remove('show');
          }
        });
        
        searchResults.addEventListener('click', (e) => {
          const item = e.target.closest('.search-result-item');
          if (item) {
            const productName = item.dataset.name;
            const product = allProducts.find(p => p.name === productName);
            if (product && product.element) {
              product.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            searchResults.classList.remove('show');
            searchInput.value = '';
          }
        });
      })();

      // ===== FILTER BUTTONS =====
      (function() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(btn => {
          btn.addEventListener('click', function() {
            const category = this.dataset.category;
            const section = this.dataset.section;
            
            document.querySelectorAll(`.${section}-filter .filter-btn`).forEach(b => 
              b.classList.remove('active')
            );
            this.classList.add('active');
            
            const products = document.querySelectorAll(`.${section}-grid .product-card`);
            products.forEach(product => {
              const shouldShow = category === 'all' || product.dataset.category === category;
              product.style.display = shouldShow ? 'flex' : 'none';
            });
          });
        });
      })();


      // ===== NEWSLETTER SUBSCRIPTION =====
      (function() {
        const form = document.getElementById('newsletterForm');
        const input = document.getElementById('newsletterInput');
        const message = document.getElementById('newsletterMessage');
        
        if (!form || !input || !message) return;
        
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          
          const email = input.value.trim();
          
          if (!email || !email.includes('@')) {
            message.textContent = 'Please enter a valid email';
            message.style.color = '#f87171';
            return;
          }
          
          message.textContent = 'Subscribing...';
          message.style.color = '#94a3b8';
          
          setTimeout(() => {
            message.textContent = '✓ Subscribed successfully!';
            message.style.color = '#34d399';
            input.value = '';
            
            setTimeout(() => {
              message.textContent = '';
            }, 5000);
          }, 1000);
        });
      })();

      // ===== ADD TO CART FUNCTIONALITY =====
    
  // Centralized cart state (local) and helper to update UI
  const cartCount = document.getElementById('mm-cart-count');
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  function updateCartCount() {
    if (!cartCount) return;
    cartCount.textContent = cart.reduce((total, item) => total + (item.quantity || 0), 0);
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

  // Delegated click handler for Add to Cart buttons (works for dynamic content)
  document.addEventListener('click', (e) => {
    const button = e.target.closest('.add-to-cart');
    if (!button) return;
    e.preventDefault();

    const card = button.closest('.product-card, .you-card');
    if (!card) return;

    let name = '';
    let price = 0;
    let image = '';

    if (card.classList.contains('product-card')) {
      name = card.querySelector('.product-name')?.textContent.trim() || card.dataset.name || '';
      price = parseFloat(card.querySelector('.price')?.textContent.replace(/[^0-9.]/g, '')) || parseFloat(card.dataset.price) || 0;
      image = card.querySelector('img')?.src || card.dataset.image || '';
    } else if (card.classList.contains('you-card')) {
      name = card.querySelector('h3')?.textContent.trim() || '';
      price = parseFloat(card.querySelector('.price')?.textContent.replace(/[^0-9.]/g, '')) || 0;
      image = card.querySelector('img')?.src || '';
    }

    const productId = card.dataset && card.dataset.productId ? card.dataset.productId : null;
    const productObj = { name, price, image, quantity: 1, productId };

    // Try backend sync if logged in and productId is valid
    (async () => {
      try {
        const token = (window.Auth && typeof Auth.getToken === 'function') ? Auth.getToken() : localStorage.getItem('token');
        const base = (window.CONFIG && CONFIG.API_BASE_URL) ? CONFIG.API_BASE_URL : 'https://marketmix-backend-production.up.railway.app/api';
        if (token && productObj.productId) {
          const resp = await fetch(`${base}/cart/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ product_id: productObj.productId, quantity: 1 })
          });
          if (!resp.ok) {
            const d = await resp.json().catch(() => null);
            console.warn('Landing: backend add-to-cart failed', resp.status, d);
          } else {
            console.log('Landing: added to backend cart');
          }
        }
      } catch (err) {
        console.error('Landing page: error adding to backend cart', err);
      }
    })();

    const existing = cart.find(item => item.name === name);
    if (existing) existing.quantity = (existing.quantity || 0) + 1;
    else cart.push(productObj);

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();

    button.textContent = 'Added!';
    setTimeout(() => (button.textContent = 'Add to Cart'), 1000);
    showToast('Product added to cart!');
  });

  // Initial cart count
  updateCartCount();

  // Load products from backend and render into the grids
  async function loadLandingProducts(limit = 8) {
    try {
      const base = (window.CONFIG && CONFIG.API_BASE_URL) ? CONFIG.API_BASE_URL : 'https://marketmix-backend-production.up.railway.app/api';
      const res = await fetch(`${base}/products?limit=${limit}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const json = await res.json();
      const items = json.data || [];

      if (items.length === 0) return;

      const bestGrid = document.querySelector('.best-selling-grid');
      const newGrid = document.querySelector('.new-arrivals-grid');

      // Render into best selling (first half) and new arrivals (second half)
      const half = Math.ceil(items.length / 2);
      if (bestGrid) bestGrid.innerHTML = items.slice(0, half).map(renderProductCard).join('');
      if (newGrid) newGrid.innerHTML = items.slice(half).map(renderProductCard).join('');
    } catch (err) {
      console.error('Error loading landing products:', err);
    }
  }

  function renderProductCard(product) {
    const img = product.image || product.main_image_url || 'marketplace.png';
    const price = typeof product.price === 'number' ? product.price.toFixed(2) : product.price;
    return `
      <div class="product-card" data-product-id="${product.id}" data-name="${escapeHtml(product.name)}" data-price="${price}">
        <img src="${img}" alt="${escapeHtml(product.name)}">
        <div class="product-info">
          <div class="product-name">${escapeHtml(product.name)}</div>
          <div class="product-desc">${escapeHtml(product.description || '')}</div>
          <div class="meta">
            <div class="price">$${price}</div>
            <div class="rating">★★★★★</div>
          </div>
        </div>
        <button class="add-to-cart">Add to Cart</button>
      </div>`;
  }

  function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/[&<>"']/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c];
    });
  }

  // Kick off loading products for landing
  loadLandingProducts(8);

      // ===== BACK TO TOP BUTTON =====
      (function() {
        const btn = document.getElementById('backToTop');
        if (!btn) return;
        
        window.addEventListener('scroll', () => {
          if (window.scrollY > 400) {
            btn.classList.add('visible');
          } else {
            btn.classList.remove('visible');
          }
        });
        
        btn.addEventListener('click', () => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      })();

      // ===== KEYBOARD ACCESSIBILITY =====
        (function() {
          // user-dropdown: keyboard + click + hover handling
          const dropdown = document.querySelector('.user-dropdown');
          if (dropdown) {
            const btn = dropdown.querySelector('.icon-btn');
            const menu = dropdown.querySelector('.menu');
            const menuItems = menu ? menu.querySelectorAll('a') : [];

            function closeDropdown() {
              dropdown.classList.remove('open');
              btn.setAttribute('aria-expanded', 'false');
              if (menu) menu.setAttribute('aria-hidden', 'true');
            }

            function openDropdown() {
              dropdown.classList.add('open');
              btn.setAttribute('aria-expanded', 'true');
              if (menu) menu.setAttribute('aria-hidden', 'false');
            }

            // Click toggles (useful for touch/mobile)
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              const isOpen = dropdown.classList.toggle('open');
              btn.setAttribute('aria-expanded', String(isOpen));
              if (menu) menu.setAttribute('aria-hidden', String(!isOpen));
              if (isOpen) menuItems[0]?.focus();
            });

            // Keyboard support
            btn.addEventListener('keydown', (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const isExpanded = btn.getAttribute('aria-expanded') === 'true';
                if (isExpanded) { closeDropdown(); }
                else { openDropdown(); menuItems[0]?.focus(); }
              } else if (e.key === 'Escape') {
                closeDropdown();
                btn.focus();
              } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                openDropdown();
                menuItems[0]?.focus();
              }
            });

            // Close when clicking outside
            document.addEventListener('click', (e) => {
              if (!e.target.closest('.user-dropdown')) {
                closeDropdown();
              }
            });

            // Close on Escape anywhere
            document.addEventListener('keydown', (e) => {
              if (e.key === 'Escape') closeDropdown();
            });

            // Close when a menu item is chosen
            menuItems.forEach(mi => mi.addEventListener('click', () => closeDropdown()));
          }

          // new navbar toggle accessibility
          const mmToggle = document.querySelector('.mm-toggle');
          const mmMenu = document.getElementById('mm-menu');
          if (mmToggle && mmMenu) {
            mmToggle.addEventListener('keydown', (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const isOpen = mmMenu.classList.toggle('open');
                mmToggle.setAttribute('aria-expanded', String(isOpen));
                mmMenu.setAttribute('aria-hidden', String(!isOpen));
              }
            });
          }
        })();
    });

    // ===== ADD ANIMATION KEYFRAMES =====
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  
  // ===== NAVBAR TOGGLE SCRIPT =====
  (function(){
    const toggle = document.querySelector('.mm-toggle');
    const menu = document.getElementById('mm-menu');
    const searchBtn = document.getElementById('mm-search-btn');
    const searchInput = document.getElementById('mm-search');

    if(toggle && menu){
      toggle.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(isOpen));
        menu.setAttribute('aria-hidden', String(!isOpen));
      });

      // Close menu on Escape
      document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape' && menu.classList.contains('open')){
          menu.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
          menu.setAttribute('aria-hidden', 'true');
        }
      });

      // Close when clicking outside (mobile)
      document.addEventListener('click', (e) => {
        if(menu.classList.contains('open') && !e.target.closest('.mm-menu') && !e.target.closest('.mm-toggle')){
          menu.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
          menu.setAttribute('aria-hidden', 'true');
        }
      });
    }

    if(searchBtn && searchInput){
      searchBtn.addEventListener('click', () => searchInput.focus());
    }
  })();