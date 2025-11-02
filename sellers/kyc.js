const form = document.getElementById("kycForm");
const successScreen = document.getElementById("successScreen");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  let valid = true;

  // Validate required inputs
  form.querySelectorAll("[required]").forEach((field) => {
    const error = field.parentElement.querySelector(".error-msg");
    if (field.value.trim() === "") {
      error.textContent = "This field is required";
      error.style.display = "block";
      valid = false;
    } else {
      error.style.display = "none";
    }
  });

  if (!valid) return;

  // Show success message
  form.classList.add("hidden");
  successScreen.classList.remove("hidden");

  // Redirect to dashboard after 3s
  setTimeout(() => {
    window.location.href = "sellers layout.html"; // later link to real dashboard
  }, 3000);
});
