document.getElementById("placeOrderBtn").addEventListener("click", () => {
  const form = document.getElementById("checkoutForm");
  const message = document.getElementById("orderMessage");

  if (form.checkValidity()) {
    message.textContent = "✅ Order placed successfully!";
    message.className = "success";
    message.classList.remove("hidden");

    // Simulate clearing cart
    document.getElementById("orderItems").innerHTML = "<li>Your cart is empty.</li>";
    document.getElementById("totalAmount").textContent = "$0";

  } else {
    message.textContent = "⚠️ Please fill all required fields.";
    message.className = "error";
    message.classList.remove("hidden");
  }
});
