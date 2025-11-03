
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
    
  // Select all Add to Cart buttons
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  const cartCount = document.getElementById('mm-cart-count');

  // Get cart from localStorage or start new
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  // Function to update cart count in navbar
  function updateCartCount() {
    cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
  }

  // Initial update when page loads
  updateCartCount();

  // Listen to each Add to Cart button
  addToCartButtons.forEach(button => {
    button.addEventListener('click', () => {
      let name = '';
      let price = 0;
      let image = '';

      // Detect if it's a .product-card or .you-card
      const card = button.closest('.product-card, .you-card');

      if (card.classList.contains('product-card')) {
        name = card.querySelector('.product-name')?.textContent.trim();
        price = parseFloat(card.querySelector('.price')?.textContent.replace(/[^0-9.]/g, ''));
        image = card.querySelector('img')?.src;
      } else if (card.classList.contains('you-card')) {
        name = card.querySelector('h3')?.textContent.trim();
        price = parseFloat(card.querySelector('.price')?.textContent.replace(/[^0-9.]/g, ''));
        image = card.querySelector('img')?.src;
      }

      // Check if item already exists in cart
      const existing = cart.find(item => item.name === name);

      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ name, price, image, quantity: 1 });
      }

      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(cart));

      // Update the number on cart icon
      updateCartCount();

      // Optional: quick feedback
      button.textContent = 'Added!';
      setTimeout(() => (button.textContent = 'Add to Cart'), 1000);

          showToast('Product added to cart!');
        });
        
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
      })();

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
          // existing user-dropdown keyboard accessibility
          const dropdown = document.querySelector('.user-dropdown');
          if (dropdown) {
            const btn = dropdown.querySelector('.icon-btn');
            const menu = dropdown.querySelector('.menu');
            const menuItems = menu.querySelectorAll('a');
            btn.addEventListener('keydown', (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const isExpanded = btn.getAttribute('aria-expanded') === 'true';
                btn.setAttribute('aria-expanded', !isExpanded);
                if (!isExpanded) { menuItems[0]?.focus(); }
              }
            });
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