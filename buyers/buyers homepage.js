// ...existing code...

// Wrap initialization in DOMContentLoaded to avoid null element errors
window.addEventListener('DOMContentLoaded', () => {

  // Load and render products from API
  async function loadFlashProducts() {
    try {
      const container = document.getElementById('flashProducts');
      if (!container) return;

      const response = await fetch(`${CONFIG.API_BASE_URL}/products?limit=5`);
      const data = await response.json();

      if (!response.ok || !data.data || data.data.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding: 20px; color: #666;">No products available</p>';
        return;
      }

      // Render flash product cards
      container.innerHTML = data.data.map(product => `
        <div class="flash-card" data-product-id="${product.id}">
          <img src="${product.main_image_url || product.image || 'marketplace.png'}" alt="${product.name}">
          <h4>${product.name}</h4>
          <p class="price">$${product.price}</p>
          <button>Add to Cart</button>
        </div>
      `).join('');

      // Re-attach event listeners to new buttons
      attachCartListeners();
    } catch (error) {
      console.error('Error loading flash products:', error);
      const container = document.getElementById('flashProducts');
      if (container) {
        container.innerHTML = '<p style="text-align:center; padding: 20px; color: #666;">Error loading products</p>';
      }
    }
  }

  // Load products early
  loadFlashProducts();

  // Countdown Timer
  function startCountdown(duration, display) {
    let timer = duration, hours, minutes, seconds;
    if (!display) return;
    const intervalId = setInterval(function () {
      hours = parseInt(timer / 3600, 10);
      minutes = parseInt((timer % 3600) / 60, 10);
      seconds = parseInt(timer % 60, 10);

      hours = hours < 10 ? "0" + hours : hours;
      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;

      display.textContent = hours + ":" + minutes + ":" + seconds;

      if (--timer < 0) {
        timer = duration;
      }
    }, 1000);
    return intervalId;
  }

  const countdownDisplay = document.querySelector('#countdown');
  if (countdownDisplay) {
    let countdownDuration = 24 * 60 * 60; // 24 hours
    startCountdown(countdownDuration, countdownDisplay);
  }

  // Hero Slider (simple rotating slides)
  let slideIndex = 0;
  function showSlides() {
    let slides = document.querySelectorAll(".slide");
    if (!slides || slides.length === 0) return; // guard
    slides.forEach(s => s.classList.remove("active"));
    slideIndex++;
    if (slideIndex > slides.length) slideIndex = 1;
    slides[slideIndex - 1].classList.add("active");
    setTimeout(showSlides, 3000);
  }
  showSlides();

  // Update cart count when returning to this page (back/forward cache) or when window gains focus
  window.addEventListener('pageshow', () => {
    syncCartFromStorage();
  });
  window.addEventListener('focus', () => {
    syncCartFromStorage();
  });
  // Listen to storage events from other tabs/windows
  window.addEventListener('storage', (e) => {
    if (e.key === 'cart') syncCartFromStorage();
  });


  // for search input
  function doSearch() {
    const input = document.getElementById("searchInput");
    if (!input) return;
    let query = input.value;
    if (query.trim() !== "") {
      alert("You searched for: " + query);
      // Later, you can replace this alert with your real search function
    }
  }


  // Select all slides (hero-slider)
  const heroSlides = document.querySelectorAll(".hero-slider .slide");
  let currentIndex = 0;

  function showSlide(index) {
    if (!heroSlides || heroSlides.length === 0) return;
    heroSlides.forEach((slide, i) => {
      slide.classList.remove("active");
      if (i === index) slide.classList.add("active");
    });
  }

  if (heroSlides && heroSlides.length > 0) {
    setInterval(() => {
      currentIndex++;
      if (currentIndex >= heroSlides.length) currentIndex = 0;
      showSlide(currentIndex);
    }, 3000);
  }

  // scroll buttons for quick links
  const wrapper = document.querySelector(".links-wrapper");
  const leftBtn = document.querySelector(".left-btn");
  const rightBtn = document.querySelector(".right-btn");

  if (leftBtn && wrapper) {
    leftBtn.addEventListener("click", () => {
      wrapper.scrollBy({ left: -200, behavior: "smooth" });
    });
  }
  if (rightBtn && wrapper) {
    rightBtn.addEventListener("click", () => {
      wrapper.scrollBy({ left: 200, behavior: "smooth" });
    });
  }


  // for flash sales
  const flashContainer = document.querySelector(".flash-container");
  const prevBtn = document.querySelector(".flash-btn.prev");
  const nextBtn = document.querySelector(".flash-btn.next");

  if (nextBtn && flashContainer) {
    nextBtn.addEventListener("click", () => {
      flashContainer.scrollBy({ left: 200, behavior: "smooth" });
    });
  }
  if (prevBtn && flashContainer) {
    prevBtn.addEventListener("click", () => {
      flashContainer.scrollBy({ left: -200, behavior: "smooth" });
    });
  }


  // <!-- JS for Auto Sliding (blog cards) -->
  (function initBlogSlider() {
    const blogSlider = document.querySelector('.blog-cards');
    const blogCards = Array.from(document.querySelectorAll('.blog-card'));
    const cardGap = 20; // gap between cards in px
    let index = 0;
    let isTransitioning = false;
    if (!blogSlider || blogCards.length === 0) return;

    // Clone first few cards for smooth infinite loop
    const clones = blogCards.map(card => card.cloneNode(true));
    clones.forEach(clone => blogSlider.appendChild(clone));

    const cardWidth = blogCards[0].offsetWidth + cardGap;

    // Auto-slide with mutable interval id so we can clear & restart
    let autoSlideId = setInterval(slideNext, 4000);

    function slideNext() {
      if (isTransitioning) return;
      isTransitioning = true;
      index++;
      blogSlider.style.transition = 'transform 0.5s ease-in-out';
      blogSlider.style.transform = `translateX(-${index * cardWidth}px)`;

      if (index >= blogCards.length) {
        setTimeout(() => {
          blogSlider.style.transition = 'none';
          blogSlider.style.transform = 'translateX(0)';
          index = 0;
          isTransitioning = false;
        }, 200);
      } else {
        setTimeout(() => isTransitioning = false, 200);
      }
    }

    // === Drag/Swipe Support ===
    let startX = 0;
    let prevTranslate = 0;
    let dragging = false;

    const getPositionX = e => e.type.includes('mouse') ? e.pageX : (e.touches && e.touches[0] && e.touches[0].clientX) || 0;

    const touchStart = e => {
      clearInterval(autoSlideId); // stop auto-slide when dragging
      startX = getPositionX(e);
      dragging = true;
      blogSlider.style.transition = 'none';
    };

    const touchMove = e => {
      if (!dragging) return;
      const currentX = getPositionX(e);
      const delta = currentX - startX;
      blogSlider.style.transform = `translateX(${prevTranslate + delta}px)`;
    };

    const touchEnd = e => {
      if (!dragging) return;
      dragging = false;
      // parse current transform safely
      const transform = (blogSlider.style.transform || '').match(/-?\d+/g);
      const currentTranslate = transform ? parseInt(transform[0], 10) : prevTranslate;
      const movedBy = currentTranslate - prevTranslate;

      if (movedBy < -50 && index < blogCards.length) {
        index++;
      } else if (movedBy > 50 && index > 0) {
        index--;
      }
      blogSlider.style.transition = 'transform 0.5s ease-in-out';
      blogSlider.style.transform = `translateX(-${index * cardWidth}px)`;
      prevTranslate = -index * cardWidth;

      setTimeout(() => {
        if (index >= blogCards.length) {
          blogSlider.style.transition = 'none';
          blogSlider.style.transform = 'translateX(0)';
          index = 0;
          prevTranslate = 0;
        }
      }, 200);

      // restart auto-slide (clear any existing then set)
      clearInterval(autoSlideId);
      autoSlideId = setInterval(slideNext, 4000);
    };

    // Events
    blogSlider.addEventListener('mousedown', touchStart);
    blogSlider.addEventListener('mousemove', touchMove);
    blogSlider.addEventListener('mouseup', touchEnd);
    blogSlider.addEventListener('mouseleave', () => dragging && touchEnd());
    blogSlider.addEventListener('touchstart', touchStart, {passive: true});
    blogSlider.addEventListener('touchmove', touchMove, {passive: true});
    blogSlider.addEventListener('touchend', touchEnd);
  })();


  // === CART SYSTEM ===

  // Load existing cart or create new
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  // Function to update cart count in bottom nav
  function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
      cartCount.textContent = count;
      cartCount.style.display = count > 0 ? 'inline-block' : 'none';
    }
  }

  // Save cart to localStorage
  function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
  }

  // Sync cart from localStorage (useful when returning via back button or other pages)
  function syncCartFromStorage() {
    try {
      const stored = JSON.parse(localStorage.getItem('cart')) || [];
      // only assign if different to avoid unnecessary updates
      const changed = JSON.stringify(stored) !== JSON.stringify(cart);
      if (changed) {
        cart = stored;
        updateCartCount();
      }
    } catch (e) {
      console.warn('syncCartFromStorage failed', e);
      cart = [];
      updateCartCount();
    }
  }

  // Function to add item to backend API
  async function addToBackendCart(product) {
    try {
      // Check if user is logged in
      const token = Auth.getToken();
      if (!token) {
        showToast('Please login to add items to cart');
        setTimeout(() => {
          window.location.href = 'login for buyers.html';
        }, 1500);
        return false;
      }

      // Prefer a real product id when provided by the markup; otherwise create a temporary id
      const tempProductId = btoa(product.name).substring(0, 36);
      const productIdToSend = product.productId || tempProductId;

      const response = await fetch(`${CONFIG.API_BASE_URL}/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: productIdToSend,
          quantity: 1,
          metadata: { name: product.name, image: product.image }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Backend error:', data.message);
        showToast(`Error: ${data.message}`);
        return false;
      }

      console.log('✅ Item added to backend:', data);
      return true;
    } catch (error) {
      console.error('Error adding to backend cart:', error);
      showToast('Error adding to cart. Check console.');
      return false;
    }
  }

  // Add item to cart (with quantity handling)
  async function addToCart(product) {
    if (!product || !product.name) return;

    // First, try to add to backend if logged in
    const token = Auth.getToken();
    if (token) {
      const backendSuccess = await addToBackendCart(product);
      if (!backendSuccess) {
        // If backend fails, still save locally
        showToast('Saved locally (backend sync failed)');
      }
    }

    // Always save to localStorage for offline support
    const existing = cart.find(item => item.name === product.name);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      product.quantity = 1;
      cart.push(product);
    }
    saveCart();
    
    if (!token) {
      showToast(`${product.name} added to cart (login to save)`);
    } else {
      showToast(`${product.name} added to cart`);
    }
  }

  // Attach listeners to all "Add to Cart" buttons (guarded) - can be called after dynamic rendering
  function attachCartListeners() {
    const addButtons = document.querySelectorAll('.add-to-cart, .flash-card button, .recommended-section button') || [];
    addButtons.forEach(button => {
      // Remove existing listener to avoid duplicates
      button.onclick = null;
      button.addEventListener('click', () => {
        const card = button.closest('.product-card, .flash-card, .recommended-item');
        if (!card) return;
        const titleEl = card.querySelector('h3, h4');
        const priceEl = card.querySelector('.price');
        const imgEl = card.querySelector('img');

        const name = titleEl ? titleEl.textContent.trim() : 'Product';
        let price = 0;
        if (priceEl) {
          const priceText = priceEl.textContent.replace(/[^0-9.,-]/g, '').replace(',', '.').trim();
          price = parseFloat(priceText) || 0;
        }
        const image = imgEl ? (imgEl.src || '') : '';

        // Prefer a real product_id if present on the card
        const productId = card.dataset && card.dataset.productId ? card.dataset.productId : null;
        const product = { name, price, image, quantity: 1, productId };
        addToCart(product);
      });
    });
  }

  // Attach listeners initially
  attachCartListeners();

  // Initial cart count update on page load
  updateCartCount();

  // === Toast Notification ===
  function showToast(message) {
    let toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  // Initialize count on load
  updateCartCount();

}); // end DOMContentLoaded wrapper

// ...existing code...