// Simulated wishlist data (could be from API later)
const wishlistItems = [
  {
    id: 1,
    name: "Trendy Sneakers",
    price: 45.00,
    image: "elon.jfif"
  },
  {
    id: 2,
    name: "Noise Cancelling Headset",
    price: 65.00,
    image: "home and kitchen.webp"
  },
  {
    id: 3,
    name: "Stylish Backpack",
    price: 39.99,
    image: "download.jfif"
  },
  {
    id: 4,
    name: "Ankara Material",
    price: 99.99,
    image: "web dev.jpeg"
  }
];

const wishlistContainer = document.getElementById("wishlist-container");

// Function to render wishlist
function renderWishlist() {
  wishlistContainer.innerHTML = "";

  if (wishlistItems.length === 0) {
    wishlistContainer.innerHTML = `<p class="wishlist-empty">Your wishlist is empty.</p>`;
    return;
  }

  wishlistItems.forEach(item => {
    const itemHTML = `
      <div class="wishlist-item" data-id="${item.id}">
        <img src="${item.image}" alt="${item.name}" />
        <h4>${item.name}</h4>
        <p>$${item.price.toFixed(2)}</p>
        <div class="wishlist-actions">
          <button class="move">Move to Cart</button>
          <button class="remove">Remove</button>
        </div>
      </div>
    `;
    wishlistContainer.insertAdjacentHTML("beforeend", itemHTML);
  });

  addEventListeners();
}

// Event Listeners for buttons
function addEventListeners() {
  document.querySelectorAll(".remove").forEach(btn => {
    btn.addEventListener("click", function () {
      const id = parseInt(this.closest(".wishlist-item").dataset.id);
      removeItem(id);
    });
  });

  document.querySelectorAll(".move").forEach(btn => {
    btn.addEventListener("click", function () {
      const id = parseInt(this.closest(".wishlist-item").dataset.id);
      alert("Item moved to cart!");
      removeItem(id);
    });
  });
}

// Remove item from wishlist
function removeItem(id) {
  const index = wishlistItems.findIndex(item => item.id === id);
  if (index > -1) {
    wishlistItems.splice(index, 1);
    renderWishlist();
  }
}

// Initial render
renderWishlist();
