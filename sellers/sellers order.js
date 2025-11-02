



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




const ordersData = [
  { id: "OD001", customer: "Alice Johnson", product: "Red Dress", quantity: 2, date: "2025-05-15", status: "Pending" },
  { id: "OD002", customer: "Bob Smith", product: "Bluetooth Speaker", quantity: 1, date: "2025-05-16", status: "Shipped" },
  { id: "OD003", customer: "Carol Lee", product: "Coffee Maker", quantity: 1, date: "2025-05-17", status: "Delivered" },
  { id: "OD004", customer: "David Kim", product: "Running Shoes", quantity: 3, date: "2025-05-18", status: "Pending" },
  { id: "OD005", customer: "Eva Green", product: "Smart Watch", quantity: 1, date: "2025-05-19", status: "Shipped" },
  { id: "OD006", customer: "Frank Wright", product: "Yoga Mat", quantity: 2, date: "2025-05-20", status: "Pending" },
  { id: "OD007", customer: "Grace Hall", product: "Wireless Headphones", quantity: 1, date: "2025-05-21", status: "Delivered" },
  { id: "OD008", customer: "Henry Adams", product: "Gaming Mouse", quantity: 1, date: "2025-05-22", status: "Pending" },
  { id: "OD009", customer: "Isla Brown", product: "LED Desk Lamp", quantity: 2, date: "2025-05-23", status: "Shipped" },
  { id: "OD010", customer: "Jack White", product: "Backpack", quantity: 1, date: "2025-05-24", status: "Pending" },
];

let currentPage = 1;
const ordersPerPage = 5;
let filteredOrders = [...ordersData];
let selectedOrderId = null;
let selectedNewStatus = null;

const orderTable = document.getElementById("orderTable");
const statusFilter = document.getElementById("statusFilter");
const searchInput = document.getElementById("searchInput");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const toast = document.getElementById("toast");
const confirmationModal = document.getElementById("confirmationModal");
const newStatusText = document.getElementById("newStatusText");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");

function renderOrders() {
  document.querySelectorAll(".order-row:not(.header)").forEach(row => row.remove());

  const search = searchInput.value.toLowerCase();
  filteredOrders = ordersData.filter(order =>
    (statusFilter.value === "all" || order.status === statusFilter.value) &&
    (order.id.toLowerCase().includes(search) ||
     order.customer.toLowerCase().includes(search) ||
     order.product.toLowerCase().includes(search))
  );

  const end = currentPage * ordersPerPage;
  const paginated = filteredOrders.slice(0, end);
  loadMoreBtn.style.display = end >= filteredOrders.length ? "none" : "block";

  paginated.forEach(order => {
    const row = document.createElement("div");
    row.className = "order-row";
    row.innerHTML = `
      <div data-label="Order ID">${order.id}</div>
      <div data-label="Customer">${order.customer}</div>
      <div data-label="Product">${order.product}</div>
      <div data-label="Qty">${order.quantity}</div>
      <div data-label="Date">${order.date}</div>
      <div data-label="Status"><span class="status ${order.status}">${order.status}</span></div>
      <div data-label="Action">
        ${
          order.status === "Pending"
          ? `<button class="mark-btn" data-id="${order.id}" data-status="Shipped">Shipped</button>`
          : order.status === "Shipped"
          ? `<button class="mark-btn" data-id="${order.id}" data-status="Delivered"> Delivered</button>`
          : `<button class="mark-btn" disabled>Completed</button>`
        }
      </div>
    `;
    orderTable.appendChild(row);
  });

  document.querySelectorAll(".mark-btn:not([disabled])").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedOrderId = btn.dataset.id;
      selectedNewStatus = btn.dataset.status;
      newStatusText.textContent = selectedNewStatus;
      confirmationModal.classList.add("show");
    });
  });
}

loadMoreBtn.addEventListener("click", () => {
  currentPage++;
  renderOrders();
});

statusFilter.addEventListener("change", () => {
  currentPage = 1;
  renderOrders();
});

searchInput.addEventListener("input", () => {
  currentPage = 1;
  renderOrders();
});

confirmYes.addEventListener("click", () => {
  const order = ordersData.find(o => o.id === selectedOrderId);
  if (order) {
    order.status = selectedNewStatus;
    showToast(`Order ${order.id} marked as ${selectedNewStatus}`);
    renderOrders();
  }
  closeModal();
});

confirmNo.addEventListener("click", closeModal);
window.addEventListener("click", (e) => {
  if (e.target === confirmationModal) closeModal();
});

function closeModal() {
  confirmationModal.classList.remove("show");
  selectedOrderId = null;
  selectedNewStatus = null;
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

renderOrders();


document.getElementById("closeTips").addEventListener("click", function () {
  document.getElementById("sellerTips").style.display = "none";
});
