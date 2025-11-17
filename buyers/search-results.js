(function(){
  // Parse query param
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

  // Sample product data (use images available in your repo)
  const products = [
    { name: 'Smartphone', price: 250, image: 'marketplace.png' },
    { name: 'Headphones', price: 50, image: 'home and kitchen.webp' },
    { name: 'Smartwatch', price: 120, image: 'IMG-20250302-WA0088.jpg' },
    { name: 'Laptop', price: 650, image: 'download.jfif' },
    { name: 'Bluetooth Speaker', price: 75, image: 'home and kitchen.webp' },
    { name: 'Fashion Jacket', price: 40, image: 'props and stuff.jpg' },
    { name: 'Kitchen Set', price: 29.99, image: 'home and kitchen.webp' },
    { name: 'Running Shoes', price: 59.99, image: 'oli.png' }
  ];

  // Filter products (case-insensitive contained in name)
  const filtered = q ? products.filter(p => p.name.toLowerCase().includes(q.toLowerCase())) : products.slice();

  function createCard(p){
    const div = document.createElement('div');
    div.className = 'product-card';
    div.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p class="price">$${p.price.toFixed(2)}</p>
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

    // Wire up add-to-cart buttons to show a simple toast
    const addBtns = resultsGrid.querySelectorAll('.add-to-cart');
    addBtns.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        showToast(`${filtered[idx].name} added to cart`);
      });
    });
  }

  // Simple toast (keeps consistent look with homepage showToast)
  function showToast(msg){
    let toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(()=> toast.classList.add('show'), 100);
    setTimeout(()=> { toast.classList.remove('show'); setTimeout(()=> toast.remove(), 300); }, 2000);
  }

  render();

  // Populate search input in navbar
  const topInput = document.getElementById('searchInputTop');
  if(topInput) topInput.value = q;

})();