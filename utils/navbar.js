// Navbar Utility - Handles hamburger menu and cart functionality
document.addEventListener('DOMContentLoaded', function() {
  
  // ===== HAMBURGER MENU =====
  (function() {
    const toggle = document.querySelector('.mm-toggle');
    const menu = document.getElementById('mm-menu');
    
    if (!toggle || !menu) return;
    
    toggle.addEventListener('click', function() {
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !isExpanded);
      menu.setAttribute('aria-hidden', isExpanded);
      menu.classList.toggle('active');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!toggle.contains(e.target) && !menu.contains(e.target)) {
        toggle.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
        menu.classList.remove('active');
      }
    });
  })();

  // ===== CART COUNT UPDATE =====
  (function() {
    const cartCountEl = document.getElementById('mm-cart-count');
    if (!cartCountEl) return;
    
    // Get cart from localStorage
    function updateCartCount() {
      try {
        const cart = JSON.parse(localStorage.getItem('marketmix-cart') || '[]');
        const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        cartCountEl.textContent = totalCount;
      } catch (error) {
        console.error('Error updating cart count:', error);
        cartCountEl.textContent = '0';
      }
    }
    
    // Update on page load
    updateCartCount();
    
    // Listen for storage changes (from other tabs/windows)
    window.addEventListener('storage', function(e) {
      if (e.key === 'marketmix-cart') {
        updateCartCount();
      }
    });
  })();

  // ===== USER DROPDOWN MENU =====
  (function() {
    const userBtn = document.querySelector('.user-dropdown .mm-icon');
    const userMenu = document.querySelector('.user-dropdown .menu');
    
    if (!userBtn || !userMenu) return;
    
    userBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      const isHidden = userMenu.getAttribute('aria-hidden') === 'true';
      userBtn.setAttribute('aria-expanded', isHidden);
      userMenu.setAttribute('aria-hidden', !isHidden);
    });
    
    // Close when clicking outside
    document.addEventListener('click', function(e) {
      if (!userBtn.contains(e.target) && !userMenu.contains(e.target)) {
        userBtn.setAttribute('aria-expanded', 'false');
        userMenu.setAttribute('aria-hidden', 'true');
      }
    });
  })();

});
