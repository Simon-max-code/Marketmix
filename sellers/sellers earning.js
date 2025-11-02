



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













document.addEventListener("DOMContentLoaded", () => {
  const earningsData = {
    total: 2450,
    available: 1200,
    pending: 1100,
    withdrawn: 150,
    projected: 2800,
    badge: "Silver Seller",
    transactions: [
      {
        id: "TX1001",
        date: "2025-06-01",
        type: "Sale",
        product: "Canvas Bag",
        amount: 120
      },
      {
        id: "TX1002",
        date: "2025-05-28",
        type: "Withdrawal",
        amount: -150
      }
    ],
    products: [
      { name: "Canvas Bag", qty: 12, revenue: 540 },
      { name: "Leather Wallet", qty: 7, revenue: 280 }
    ],
    chartLabels: ["April", "May", "June"],
    chartValues: [1000, 1200, 1450]
  };

  const { total, available, pending, withdrawn, projected, badge, transactions, products, chartLabels, chartValues } = earningsData;

  document.getElementById("total-earnings").textContent = `$${total.toFixed(2)}`;
  document.getElementById("available-balance").textContent = `$${available.toFixed(2)}`;
  document.getElementById("pending").textContent = `$${pending.toFixed(2)}`;
  document.getElementById("withdrawals").textContent = `$${withdrawn.toFixed(2)}`;
  document.getElementById("projected").textContent = `Projected earnings: $${projected}`;
  document.getElementById("badge-status").textContent = `Badge Progress: 🥈 ${badge}`;

  const ctx = document.getElementById("earningsChart").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: chartLabels,
      datasets: [{
        label: 'Monthly Earnings',
        data: chartValues,
        backgroundColor: "rgba(255, 99, 0, 0.2)",
        borderColor: "#ff6600",
        borderWidth: 2,
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

  const list = document.getElementById("transactions-list");
  transactions.forEach(tx => {
    const div = document.createElement("div");
    div.classList.add("transaction");
    div.innerHTML = `
      <span>${tx.date}</span>
      <span>${tx.type}: ${tx.product || "—"}</span>
      <span class="amount ${tx.amount < 0 ? "negative" : ""}">${tx.amount < 0 ? "–" : "+"} $${Math.abs(tx.amount).toFixed(2)}</span>
    `;
    div.addEventListener("click", () => showModal(tx));
    list.appendChild(div);
  });

  const tableBody = document.getElementById("product-table-body");
  products.forEach(p => {
    const row = `<tr><td>${p.name}</td><td>${p.qty}</td><td>$${p.revenue.toFixed(2)}</td></tr>`;
    tableBody.innerHTML += row;
  });

  const modal = document.getElementById("transaction-modal");
  const modalBody = document.getElementById("modal-body");
  const closeBtn = document.querySelector(".close-btn");
  closeBtn.onclick = () => modal.style.display = "none";

  function showModal(tx) {
    modalBody.innerHTML = `
      <p><strong>Transaction ID:</strong> ${tx.id}</p>
      <p><strong>Date:</strong> ${tx.date}</p>
      <p><strong>Type:</strong> ${tx.type}</p>
      <p><strong>Product:</strong> ${tx.product || "—"}</p>
      <p><strong>Amount:</strong> $${tx.amount.toFixed(2)}</p>
    `;
    modal.style.display = "flex";
  }

  window.onclick = (e) => {
    if (e.target === modal) modal.style.display = "none";
  };

  document.getElementById("export-csv").onclick = () => {
    const csv = "Date,Type,Product,Amount\n" + transactions.map(tx =>
      `${tx.date},${tx.type},${tx.product || ""},${tx.amount}`
    ).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "earnings.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  document.getElementById("export-pdf").onclick = () => {
    alert("PDF export requires an additional library like jsPDF.");
  };
});


document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("withdrawModal");
  const openBtn = document.getElementById("withdrawBtn");
  const closeBtn = modal.querySelector(".close-btn");
  const form = document.getElementById("withdrawForm");
  const toast = document.getElementById("toast");

  // Open modal
  openBtn.addEventListener("click", () => {
    modal.style.display = "flex";
  });

  // Close modal
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Close modal clicking outside content
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  // Show toast function
  function showToast(message, success = true) {
    toast.textContent = message;
    toast.style.backgroundColor = success ? "#28a745" : "#dc3545";
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 3500);
  }

  // Form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const amount = parseFloat(form.amount.value);
    const method = form.method.value;

    if (!amount || amount <= 0) {
      showToast("Please enter a valid amount.", false);
      return;
    }
    if (!method) {
      showToast("Please select a withdrawal method.", false);
      return;
    }

    // Here, you would normally send data to your backend...
    // For demo, just simulate success after 1 sec
    showToast("Processing withdrawal...", true);

    setTimeout(() => {
      showToast(`Withdrawal of $${amount.toFixed(2)} via ${method} successful!`);
      modal.style.display = "none";
      form.reset();

      // TODO: Update balance on page dynamically if needed
    }, 1000);
  });
});
























