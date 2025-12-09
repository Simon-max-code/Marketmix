(function(){
  // Setup autocomplete
  const topInput = document.getElementById('mm-search-top-input');
  const topAutocomplete = document.getElementById('mm-search-top-autocomplete');
  if (topInput && topAutocomplete) {
    setupAutocomplete(topInput, topAutocomplete, (suggestion) => {
      if (suggestion.type === 'product') {
        window.location.href = `product.html?id=${suggestion.id}`;
      } else if (suggestion.type === 'category') {
        window.location.href = `buyers/category.html?id=${suggestion.id}`;
      }
    });
  }

  const mobileInput = document.getElementById('mm-search-mobile-input');
  const mobileAutocomplete = document.getElementById('mm-search-mobile-autocomplete');
  if (mobileInput && mobileAutocomplete) {
    setupAutocomplete(mobileInput, mobileAutocomplete, (suggestion) => {
      if (suggestion.type === 'product') {
        window.location.href = `product.html?id=${suggestion.id}`;
      } else if (suggestion.type === 'category') {
        window.location.href = `buyers/category.html?id=${suggestion.id}`;
      }
    });
  }

  function getQueryParam(name){
    const params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  const q = getQueryParam('q').trim();
  const resultsTitle = document.getElementById('resultsTitle');
  const resultsInfo = document.getElementById('resultsInfo');
  const resultsGrid = document.getElementById('resultsGrid');
  const noResults = document.getElementById('noResults');

  resultsTitle.textContent = q ? `Results for "${q}"` : 'Search results';
  if(q) resultsInfo.textContent = `Showing products matching "${q}"`;

  // Search products from API
  let filtered = [];
  
  async function searchProducts() {
    try {
      if (!q) {
        // If no search query, fetch all products
        const response = await fetch(`${CONFIG.API_BASE_URL}/products?limit=50`);
        if (!response.ok) throw new Error('Failed to fetch products');
        
        const data = await response.json();
        filtered = Array.isArray(data.data) ? data.data : [];
      } else {
        // Search for products by query
        const response = await fetch(`${CONFIG.API_BASE_URL}/products/search/query?q=${encodeURIComponent(q)}`);
        if (!response.ok) throw new Error('Failed to search products');
        
        const data = await response.json();
        filtered = Array.isArray(data.data) ? data.data : [];
      }
      
      render();
    } catch (error) {
      console.error('Error searching products:', error);
      filtered = [];
      render();
    }
  }
  
  // Start search immediately
  searchProducts();

  function createCard(p){
    const div = document.createElement('div');
    div.className = 'product-card';
    div.innerHTML = `
      <img src="${p.main_image_url || p.image || 'https://via.placeholder.com/300'}" alt="${p.name}" style="height: 200px; object-fit: cover;">
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        ${p.description ? `<div class="product-desc">${p.description}</div>` : ''}
        <div class="meta"><div class="price">$${(p.price || 0).toFixed(2)}</div></div>
      </div>
      <button class="add-to-cart" data-product-id="${p.id}">Add to Cart</button>
    `;
    return div;
  }

  function render(){
    resultsGrid.innerHTML = '';
    if(filtered.length === 0){
      noResults.style.display = 'block';
      resultsInfo.textContent = q ? `No products match "${q}"` : 'No products available.';
      return;
    }
    noResults.style.display = 'none';
    filtered.forEach(p => resultsGrid.appendChild(createCard(p)));

    // attach add-to-cart behavior to use existing landing toast if available
    const addBtns = resultsGrid.querySelectorAll('.add-to-cart');
    addBtns.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        // If landingpage.js defines showToast or global cart functions, try to use them
        if(window.showToast) return window.showToast(`${filtered[idx].name} added to cart`);
        // fallback simple toast
        const t = document.createElement('div'); t.className='toast'; t.textContent = `${filtered[idx].name} added to cart`;
        document.body.appendChild(t);
        setTimeout(()=> t.classList.add('show'), 100);
        setTimeout(()=> { t.classList.remove('show'); setTimeout(()=> t.remove(),300); }, 2000);
      });
    });
  }

  render();

  // Populate top search input
  const topInput = document.getElementById('mm-search-top-input');
  if(topInput) topInput.value = q;
})();