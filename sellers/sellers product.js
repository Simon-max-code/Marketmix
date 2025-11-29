




       document.addEventListener("DOMContentLoaded", function () {
  const toggler = document.getElementById("navbar-toggler");
  const offcanvasMenu = document.getElementById("offcanvasMenu");
  const offcanvasClose = document.getElementById("offcanvasClose");

  // Open Offcanvas Menu
  toggler.addEventListener("click", function () {
    offcanvasMenu.classList.add("show");
  });

  // Close Offcanvas Menu
  offcanvasClose.addEventListener("click", function () {
    offcanvasMenu.classList.remove("show");
  });

  // Close Offcanvas when clicking outside, but not when clicking inside
  document.addEventListener("click", function (event) {
    if (!offcanvasMenu.contains(event.target) && !toggler.contains(event.target)) {
      offcanvasMenu.classList.remove("show");
    }
  });

  // Ensure clicking inside doesn't close menu
  offcanvasMenu.addEventListener("click", function (event) {
    event.stopPropagation();
  });

  // Close offcanvas when clicking any menu link (for better UX)
  document.querySelectorAll('.offcanvas-body a').forEach(link => {
    link.addEventListener('click', () => {
      offcanvasMenu.classList.remove('show');
    });
  });

  });


function toggleProfileDropdown() {
    const dropdown = document.getElementById("profileDropdown");
    dropdown.style.display = dropdown.style.display === "flex" ? "none" : "flex";
  }

  // Close dropdown if clicking outside
  document.addEventListener("click", function (e) {
    const dropdown = document.getElementById("profileDropdown");
    const profile = document.querySelector(".profile-icon");

    if (!dropdown.contains(e.target) && !profile.contains(e.target)) {
      dropdown.style.display = "none";
    }
  });











  let products = [
    { id: 1, name: "Classic Leather Bag", status: "In Stock", price: 80, image: "images/cloths and shoes.jpg" },
    { id: 2, name: "Bluetooth Headset", status: "Low Stock", price: 45, image: "images/chanel.png" },
    { id: 3, name: "Vintage Sunglasses", status: "Out of Stock", price: 30, image: "images/app.png" },
    { id: 4, name: "Cool Drapes", status: "In Stock", price: 40, image: "images/hm.png" }
  
  ];

  let nextId = Math.max(...products.map(p => p.id)) + 1;

  document.addEventListener("DOMContentLoaded", function () {
    const toggler = document.getElementById("navbar-toggler");
    const offcanvasMenu = document.getElementById("offcanvasMenu");
    const offcanvasClose = document.getElementById("offcanvasClose");

    toggler.addEventListener("click", () => offcanvasMenu.classList.add("show"));
    offcanvasClose.addEventListener("click", () => offcanvasMenu.classList.remove("show"));
    document.addEventListener("click", event => {
      if (!offcanvasMenu.contains(event.target) && !toggler.contains(event.target)) {
        offcanvasMenu.classList.remove("show");
      }
    });
    offcanvasMenu.addEventListener("click", e => e.stopPropagation());
    document.querySelectorAll('.offcanvas-body a').forEach(link => {
      link.addEventListener('click', () => offcanvasMenu.classList.remove('show'));
    });

    renderProducts();
  });

  function renderProducts() {
    const productGrid = document.getElementById("productGrid");
    const searchQuery = document.getElementById("searchInput").value.toLowerCase();
    const statusFilter = document.getElementById("statusFilter").value;

    productGrid.innerHTML = "";

    let total = 0, inStock = 0, lowStock = 0, outStock = 0;

    products.forEach(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "in-stock" && product.status === "In Stock") ||
        (statusFilter === "low-stock" && product.status === "Low Stock") ||
        (statusFilter === "out-of-stock" && product.status === "Out of Stock");

      if (matchesSearch && matchesStatus) {
        const row = document.createElement("div");
        row.className = "product-row";

        const statusClass = product.status.toLowerCase().replace(/\s+/g, '-');

        row.innerHTML = `
          <div><img src="${product.image}" alt="${product.name}" style="width:50px; height:50px;"></div>
          <div>${product.name}</div>
          <div class="status ${statusClass}">${product.status}</div>
          <div>$${product.price.toFixed(2)}</div>
          <div class="actions">
            <button class="edit-btn" onclick="openEditModal(${product.id})">Edit</button>
            <button class="delete-btn" onclick="deleteProduct(${product.id})">Delete</button>
          </div>
        `;
        productGrid.appendChild(row);
      }

      total++;
      if (product.status === "In Stock") inStock++;
      if (product.status === "Low Stock") lowStock++;
      if (product.status === "Out of Stock") outStock++;
    });

    document.getElementById("total-products").textContent = total;
    document.getElementById("in-stock-count").textContent = inStock;
    document.getElementById("low-stock-count").textContent = lowStock;
    document.getElementById("out-of-stock-count").textContent = outStock;

    // Update product notification badge
    updateProductNotificationBadge(lowStock, outStock);
  }

  function updateProductNotificationBadge(lowStock, outStock) {
    // Find the product overview card in the dashboard
    const cards = document.querySelectorAll('.overview-card');
    if (cards.length === 0) return; // Card may not exist on this page
    
    // Find the product card (usually the 3rd or 4th card) and update its badge
    cards.forEach((card, index) => {
      const cardText = card.textContent.toLowerCase();
      if (cardText.includes('product')) {
        let badge = card.querySelector('.notification-badge');
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'notification-badge';
          card.appendChild(badge);
        }
        const totalAlerts = lowStock + outStock;
        badge.textContent = totalAlerts > 0 ? totalAlerts : '';
        badge.style.display = totalAlerts > 0 ? 'flex' : 'none';
      }
    });
  }

  function openAddModal() {
    document.getElementById("addProductModal").style.display = "block";
  }

  function closeAddModal() {
    document.getElementById("addProductModal").style.display = "none";
  }

  function clearAddModalInputs() {
    document.getElementById("newProductName").value = "";
    document.getElementById("newProductPrice").value = "";
    document.getElementById("newProductStatus").value = "in-stock";
    document.getElementById("newProductImage").value = "";
  }

  function addProduct() {
    const name = document.getElementById("newProductName").value.trim();
    const price = parseFloat(document.getElementById("newProductPrice").value.trim());
    const status = document.getElementById("newProductStatus").value;
    const image = document.getElementById("newProductImage").value.trim();

    if (!name || isNaN(price) || !status || !image) {
      alert("Please fill in all fields.");
      return;
    }

    const newProduct = {
      id: nextId++,
      name,
      price,
      status,
      image
    };

    products.push(newProduct);
    closeAddModal();
    clearAddModalInputs();
    renderProducts();
  }

  function openEditModal(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    document.getElementById("editId").value = product.id;
    document.getElementById("editName").value = product.name;
    document.getElementById("editPrice").value = product.price;
    document.getElementById("editStatus").value = product.status;
    document.getElementById("editModal").style.display = "block";
  }

  function closeModal() {
    document.getElementById("editModal").style.display = "none";
  }

  document.getElementById("editForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const id = +document.getElementById("editId").value;
    const product = products.find(p => p.id === id);
    if (!product) return;

    product.name = document.getElementById("editName").value;
    product.price = parseFloat(document.getElementById("editPrice").value);
    product.status = document.getElementById("editStatus").value;

    closeModal();
    renderProducts();
  });

  function deleteProduct(id) {
    const confirmed = confirm("Are you sure you want to delete this product?");
    if (confirmed) {
      const index = products.findIndex(p => p.id === id);
      if (index !== -1) products.splice(index, 1);
      renderProducts();
    }
  }

  document.getElementById("searchInput").addEventListener("input", renderProducts);
  document.getElementById("statusFilter").addEventListener("change", renderProducts);

