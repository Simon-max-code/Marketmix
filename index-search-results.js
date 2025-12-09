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

  // Collect product data from the Best Sellers section on index (fallback static list)
  // Attempt to read existing .product-card elements on index if available
  let products = [];
  try {
    // If index page and script share DOM (unlikely), else use fallback
    const cards = document.querySelectorAll('.product-card');
    if(cards && cards.length){
      products = Array.from(cards).map(card => ({
        name: card.dataset.name || (card.querySelector('.product-name') && card.querySelector('.product-name').textContent) || 'Product',
        price: parseFloat(card.dataset.price) || 0,
        image: card.querySelector('img') ? card.querySelector('img').src : '',
        desc: card.dataset.desc || (card.querySelector('.product-desc') && card.querySelector('.product-desc').textContent) || ''
      }));
    }
  } catch(e){/* ignore */}

  if(!products.length){
    // fallback sample list (use same visuals as landing page)
    products = [
      { name: 'Leather Jacket', price: 149, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400' },
      { name: 'Wireless Earbuds', price: 89, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400' },
      { name: 'Smart Watch', price: 299, image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400' },
      { name: 'Table Lamp', price: 45, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400' },
      { name: 'Sunglasses', price: 129, image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400' },
      { name: '4K Camera', price: 199, image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400' },
      { name: 'Vase Set', price: 59, image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400' }
    ];
  }

  const filtered = q ? products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || (p.desc && p.desc.toLowerCase().includes(q.toLowerCase()))) : products.slice();

  function createCard(p){
    const div = document.createElement('div');
    div.className = 'product-card';
    div.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        ${p.desc ? `<div class="product-desc">${p.desc}</div>` : ''}
        <div class="meta"><div class="price">$${p.price.toFixed(2)}</div></div>
      </div>
      <button class="add-to-cart">Add to Cart</button>
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